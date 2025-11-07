from datetime import datetime
from typing import Optional
from enum import Enum
from beanie import Document
from pydantic import Field


class AssignmentStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CLOSED = "closed"


class Assignment(Document):
    title: str
    description: str
    course_id: str = Field(..., index=True)
    teacher_id: str = Field(..., index=True)
    
    # Assignment details
    status: AssignmentStatus = Field(default=AssignmentStatus.DRAFT)
    total_points: int = Field(default=100)
    passing_points: int = Field(default=60)
    
    # Files and resources
    attachment_urls: list[str] = Field(default_factory=list)
    instructions: Optional[str] = None
    
    # Dates
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    due_date: datetime
    publish_date: Optional[datetime] = None
    
    # Statistics
    total_submissions: int = Field(default=0)
    graded_submissions: int = Field(default=0)
    average_score: float = Field(default=0.0)
    
    class Settings:
        name = "assignments"
        indexes = [
            "course_id",
            "teacher_id",
            "status",
            "due_date",
        ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Python Functions Assignment",
                "description": "Complete exercises on Python functions",
                "course_id": "COURSE001",
                "teacher_id": "TEACHER001",
                "total_points": 100,
                "due_date": "2024-12-31T23:59:59"
            }
        }
