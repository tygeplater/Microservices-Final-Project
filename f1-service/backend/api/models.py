from pydantic import BaseModel 
from typing import Any, List
from enum import Enum

class Role(Enum):
    ADMIN = "admin"
    USER = "user"

# Models
class F1Data(BaseModel):
    id: int
    name: str
    description: str


class F1Response(BaseModel):
    message: str
    data: List[F1Data]

class ScheduleResponse(BaseModel):
    status: int
    schedule: Any

class StandingsResponse(BaseModel):
    status: int
    standings: Any

class SessionResponse(BaseModel):
    status: int
    session: Any

class User(BaseModel):
    id: int
    username: str
    hashed_password: str
    role: Role

# Pydantic models for auth
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
