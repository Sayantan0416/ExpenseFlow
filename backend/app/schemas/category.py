from pydantic import BaseModel, ConfigDict


class CategoryCreate(BaseModel):
    name: str
    type: str


class CategoryResponse(BaseModel):
    id: int
    name: str
    type: str

    model_config = ConfigDict(from_attributes=True)