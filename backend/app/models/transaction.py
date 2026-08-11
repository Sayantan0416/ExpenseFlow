from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)

    title = Column(String(150), nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String(20), nullable=False)
    description = Column(String(500), nullable=True)
    date = Column(Date, nullable=False)