from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import Field


class Performance(Document):
    student_id: str = Field(..., index=True)
    course_id: str = Field(..., index=True)
    
    # Overall metrics
    total_assignments: int = Field(default=0)
    completed_assignments: int = Field(default=0)
    average_score: float = Field(default=0.0)
    
    # Grade breakdown
    grade_distribution: dict[str, int] = Field(default_factory=dict)  # {"A": 5, "B": 3, ...}
    
    # Time metrics
    average_submission_time: float = Field(default=0.0)  # in hours
    on_time_submissions: int = Field(default=0)
    late_submissions: int = Field(default=0)
    
    # Engagement metrics
    materials_viewed: int = Field(default=0)
    materials_downloaded: int = Field(default=0)
    last_activity: Optional[datetime] = None
    
    # Progress tracking
    strengths: list[str] = Field(default_factory=list)  # Topics/skills
    areas_for_improvement: list[str] = Field(default_factory=list)
    
    # Comparative metrics
    class_rank: Optional[int] = None
    percentile: Optional[float] = None
    
    # Dates
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "performance"
        indexes = [
            "student_id",
            "course_id",
            ("student_id", "course_id"),  # Compound index
        ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "student_id": "STU001",
                "course_id": "COURSE001",
                "total_assignments": 10,
                "completed_assignments": 8,
                "average_score": 85.5,
                "grade_distribution": {"A": 5, "B": 3},
                "on_time_submissions": 7,
                "late_submissions": 1
            }
        }
