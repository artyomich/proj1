from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import json
import os
from typing import List, Optional

app = FastAPI(title="Todo List API")

# CORS middleware for Angular frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data storage file
DATA_FILE = "data.json"

# Initialize data file if it doesn't exist
def init_data():
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, "w") as f:
            json.dump({
                "todos": [],
                "calendar": {}
            }, f, indent=2)

init_data()

# Pydantic models
class Todo(BaseModel):
    id: Optional[int] = None
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None
    completed: bool = False
    size: Optional[int] = None

class CalendarEvent(BaseModel):
    id: Optional[int] = None
    title: str
    description: Optional[str] = None
    date: str
    start_time: str
    end_time: str
    size: Optional[int] = None

# Load data from JSON file
def load_data():
    with open(DATA_FILE, "r") as f:
        return json.load(f)

# Save data to JSON file
def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

# ============== TODO ENDPOINTS ==============

@app.get("/api/todos", response_model=List[Todo])
def get_todos():
    """Get all todos"""
    data = load_data()
    return data["todos"]

@app.get("/api/todos/{todo_id}")
def get_todo(todo_id: int):
    """Get a specific todo by ID"""
    data = load_data()
    for todo in data["todos"]:
        if todo["id"] == todo_id:
            return todo
    raise HTTPException(status_code=404, detail="Todo not found")

@app.post("/api/todos")
def create_todo(todo: Todo):
    """Create a new todo"""
    data = load_data()
    new_id = max([t["id"] for t in data["todos"]], default=0) + 1
    new_todo = {
        "id": new_id,
        "title": todo.title,
        "description": todo.description,
        "due_date": todo.due_date,
        "completed": todo.completed,
        "size": todo.size
    }
    data["todos"].append(new_todo)
    save_data(data)
    return new_todo

@app.put("/api/todos/{todo_id}")
def update_todo(todo_id: int, todo: Todo):
    """Update a todo"""
    data = load_data()
    for i, t in enumerate(data["todos"]):
        if t["id"] == todo_id:
            data["todos"][i] = {
                "id": todo_id,
                "title": todo.title,
                "description": todo.description,
                "due_date": todo.due_date,
                "completed": todo.completed,
                "size": todo.size
            }
            save_data(data)
            return data["todos"][i]
    raise HTTPException(status_code=404, detail="Todo not found")

@app.delete("/api/todos/{todo_id}")
def delete_todo(todo_id: int):
    """Delete a todo"""
    data = load_data()
    data["todos"] = [t for t in data["todos"] if t["id"] != todo_id]
    save_data(data)
    return {"message": "Todo deleted"}

@app.get("/api/todos/overdue")
def get_overdue_todos():
    """Get todos that are overdue"""
    data = load_data()
    today = datetime.now().strftime("%Y-%m-%d")
    overdue = [t for t in data["todos"] if not t["completed"] and t["due_date"] < today]
    return overdue

# ============== CALENDAR ENDPOINTS ==============

@app.get("/api/calendar/{date}")
def get_calendar_event(date: str):
    """Get calendar event for a specific date (YYYY-MM-DD)"""
    data = load_data()
    return data["calendar"].get(date, None)

@app.post("/api/calendar")
def create_calendar_event(event: CalendarEvent):
    """Create a new calendar event"""
    data = load_data()
    all_events = list(data["calendar"].values())
    new_id = max([e["id"] for e in all_events], default=0) + 1
    new_event = {
        "id": new_id,
        "title": event.title,
        "description": event.description,
        "date": event.date,
        "start_time": event.start_time,
        "end_time": event.end_time,
        "size": event.size
    }
    data["calendar"][event.date] = new_event
    save_data(data)
    return new_event

@app.put("/api/calendar/{date}")
def update_calendar_event(date: str, event: CalendarEvent):
    """Update a calendar event"""
    data = load_data()
    if date in data["calendar"]:
        data["calendar"][date] = {
            "id": event.id,
            "title": event.title,
            "description": event.description,
            "date": event.date,
            "start_time": event.start_time,
            "end_time": event.end_time,
            "size": event.size
        }
        save_data(data)
        return data["calendar"][date]
    raise HTTPException(status_code=404, detail="Event not found")

@app.delete("/api/calendar/{date}")
def delete_calendar_event(date: str):
    """Delete a calendar event"""
    data = load_data()
    if date in data["calendar"]:
        del data["calendar"][date]
        save_data(data)
        return {"message": "Event deleted"}
    raise HTTPException(status_code=404, detail="Event not found")

@app.get("/api/calendar/events")
def get_all_calendar_events():
    """Get all calendar events"""
    data = load_data()
    return list(data["calendar"].values())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)