from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
import subprocess
import json
import os
from sqlalchemy.orm import Session
from . import models, database

# Create tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

class MT5Credentials(BaseModel):
    login: int
    password: str
    server: str
    days_back: int = 30

@app.post("/api/sync")
async def sync_trades(creds: MT5Credentials, db: Session = Depends(database.get_db)):
    env = os.environ.copy()
    env["MT5_LOGIN"] = str(creds.login)
    env["MT5_PASSWORD"] = creds.password
    env["MT5_SERVER"] = creds.server
    env["DAYS_BACK"] = str(creds.days_back)

    try:
        # Run sync script
        result = subprocess.run(["python3", "mt5_sync.py"], capture_output=True, text=True, env=env)
        data = json.loads(result.stdout)
        
        if "error" in data:
            raise HTTPException(status_code=400, detail=data["error"])
        
        # Save to DB
        for t in data:
            db_trade = models.Trade(ticket=t['ticket'], symbol=t['symbol'], profit=t['profit'])
            db.add(db_trade)
        db.commit()
        return {"status": "success", "trades": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
