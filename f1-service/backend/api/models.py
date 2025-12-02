from pydantic import BaseModel 
from typing import Any, List

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