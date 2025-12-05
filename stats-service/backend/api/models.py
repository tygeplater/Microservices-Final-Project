from typing import List
from pydantic import BaseModel
from enum import Enum

class Role(Enum):
    ADMIN = "admin"
    USER = "user"

# Models
class Statistics(BaseModel):
    metric: str
    value: float
    unit: str

class StatsResponse(BaseModel):
    message: str
    stats: List[Statistics]

class User(BaseModel):
    id: int
    username: str
    hashed_password: str
    role: Role

class UserRegister(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    username: str
    role: Role
