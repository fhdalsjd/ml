from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from . import models, database, auth
from .database import engine

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.post("/register")
async def register(email: str, password: str, db: Session = Depends(database.get_db)):
    hashed_pw = auth.get_password_hash(password)
    user = models.User(email=email, hashed_password=hashed_pw)
    db.add(user)
    db.commit()
    return {"message": "User created"}

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    token = auth.create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/api/trades")
async def get_trades(db: Session = Depends(database.get_db)):
    return db.query(models.Trade).all()

@app.post("/api/update-trade/{trade_id}")
async def update_trade(trade_id: int, emotion: str, mistake: str, db: Session = Depends(database.get_db)):
    trade = db.query(models.Trade).filter(models.Trade.id == trade_id).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    trade.emotion = emotion
    trade.mistake = mistake
    db.commit()
    return {"status": "success"}
