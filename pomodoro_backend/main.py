from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime

app = FastAPI()

# Temporary in-memory storage
session_log = []

class SessionData(BaseModel):
    start: datetime
    end: datetime

@app.post("/log-session/")
def log_session(data: SessionData):
    session_log.append(data)
    return {"message": "Session logged", "total_sessions": len(session_log)}

@app.get("/stats/")
def get_stats():
    total_seconds = sum([(s.end - s.start).total_seconds() for s in session_log])
    return {
        "total_sessions": len(session_log),
        "total_minutes": round(total_seconds / 60, 2)
    }
