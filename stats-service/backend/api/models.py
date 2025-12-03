from typing import List
from pydantic import BaseModel

# Models
class Statistics(BaseModel):
    metric: str
    value: float
    unit: str


class StatsResponse(BaseModel):
    message: str
    stats: List[Statistics]
