from datetime import date

from pydantic import BaseModel, ConfigDict


class TransactionCreate(BaseModel):
    user_id: int
    category_id: int
    title: str
    amount: float
    type: str
    description: str | None = None
    date: date


class TransactionResponse(TransactionCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)