from sqlalchemy import Column, Integer, Float, String
from .database import Base

class Trade(Base):
    __tablename__ = "trades"
    id = Column(Integer, primary_key=True, index=True)
    ticket = Column(Integer)
    symbol = Column(String)
    profit = Column(Float)
    emotion = Column(String, nullable=True)
    mistake = Column(String, nullable=True)
    strategy = Column(String, nullable=True)
