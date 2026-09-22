from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    trades = relationship("Trade", back_populates="owner")

class Trade(Base):
    __tablename__ = "trades"
    id = Column(Integer, primary_key=True, index=True)
    ticket = Column(Integer)
    symbol = Column(String)
    profit = Column(Float)
    emotion = Column(String, nullable=True)
    mistake = Column(String, nullable=True)
    strategy = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="trades")
