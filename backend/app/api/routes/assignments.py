"""
Assignments API endpoints for creating, viewing, and managing assignments
"""
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from app.core.database import get_database
from app.api.dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/assignments", tags=["assignments"])


# Pydantic models
class AssignmentCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    due_date: str  # ISO format datetime string
    course_id: Optional[str] = None
    course_name: Optional[str] = "General"
    points: Optional[int] = 100
    instructions: Optional[str] = None


class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[str] = None
    course_id: Optional[str] = None
    course_name: Optional[str] = None
    points: Optional[int] = None
    instructions: Optional[str] = None
    status: Optional[str] = None


class SubmissionCreate(BaseModel):
    assignment_id: str
    file_url: Optional[str] = None
    text_content: Optional[str] = None
    comments: Optional[str] = None


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_assignment(
    assignment: AssignmentCreate,
    current_user = Depends(get_current_user)
):
    """
    Create a new assignment (Teachers only)
    """
    try:
        # Check if user is a teacher
        if current_user.role.value != "teacher":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only teachers can create assignments"
            )
        
        db = await get_database()
        
        # Create assignment document
        assignment_doc = {
            "title": assignment.title,
            "description": assignment.description,
            "due_date": assignment.due_date,
            "course_id": assignment.course_id,
            "course_name": assignment.course_name or "General",
            "points": assignment.points or 100,
            "instructions": assignment.instructions,
            "teacher_id": str(current_user.id),
            "teacher_name": current_user.display_name or "Teacher",
            "status": "active",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
        
        # Insert into database
        result = await db.assignments.insert_one(assignment_doc)
        
        # Return created assignment with ID
        assignment_doc["id"] = str(result.inserted_id)
        assignment_doc.pop("_id", None)
        
        logger.info(f"Assignment created: {assignment_doc['id']} by teacher {str(current_user.id)}")
        
        return {
            "message": "Assignment created successfully",
            "assignment": assignment_doc
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating assignment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create assignment: {str(e)}"
        )


@router.get("/")
async def get_assignments(
    current_user = Depends(get_current_user),
    status_filter: Optional[str] = None,
    course_id: Optional[str] = None
):
    """
    Get all assignments
    - Students: See all active assignments
    - Teachers: See assignments they created
    """
    try:
        db = await get_database()
        
        # Build query based on user role
        query = {}
        
        if current_user.role.value == "teacher":
            # Teachers see their own assignments
            query["teacher_id"] = str(current_user.id)
        else:
            # Students see all active assignments
            query["status"] = "active"
        
        # Apply filters
        if status_filter:
            query["status"] = status_filter
        if course_id:
            query["course_id"] = course_id
        
        # Fetch assignments
        cursor = db.assignments.find(query).sort("due_date", 1)
        assignments = await cursor.to_list(length=100)
        
        # Convert ObjectId to string
        for assignment in assignments:
            assignment["id"] = str(assignment["_id"])
            assignment.pop("_id", None)
        
        return {
            "assignments": assignments,
            "total": len(assignments)
        }
        
    except Exception as e:
        logger.error(f"Error fetching assignments: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch assignments: {str(e)}"
        )


@router.get("/{assignment_id}")
async def get_assignment(
    assignment_id: str,
    current_user = Depends(get_current_user)
):
    """
    Get a specific assignment by ID
    """
    try:
        db = await get_database()
        
        # Fetch assignment
        assignment = await db.assignments.find_one({"_id": ObjectId(assignment_id)})
        
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assignment not found"
            )
        
        # Convert ObjectId to string
        assignment["id"] = str(assignment["_id"])
        assignment.pop("_id", None)
        
        return assignment
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching assignment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch assignment: {str(e)}"
        )


@router.put("/{assignment_id}")
async def update_assignment(
    assignment_id: str,
    assignment_update: AssignmentUpdate,
    current_user = Depends(get_current_user)
):
    """
    Update an assignment (Teachers only - their own assignments)
    """
    try:
        # Check if user is a teacher
        if current_user.role.value != "teacher":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only teachers can update assignments"
            )
        
        db = await get_database()
        
        # Check if assignment exists and belongs to this teacher
        assignment = await db.assignments.find_one({
            "_id": ObjectId(assignment_id),
            "teacher_id": str(current_user.id)
        })
        
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assignment not found or you don't have permission to update it"
            )
        
        # Build update document (only include provided fields)
        update_doc = {
            "updated_at": datetime.utcnow().isoformat()
        }
        
        for field, value in assignment_update.dict(exclude_unset=True).items():
            if value is not None:
                update_doc[field] = value
        
        # Update assignment
        result = await db.assignments.update_one(
            {"_id": ObjectId(assignment_id)},
            {"$set": update_doc}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No changes made to assignment"
            )
        
        # Fetch updated assignment
        updated_assignment = await db.assignments.find_one({"_id": ObjectId(assignment_id)})
        updated_assignment["id"] = str(updated_assignment["_id"])
        updated_assignment.pop("_id", None)
        
        return {
            "message": "Assignment updated successfully",
            "assignment": updated_assignment
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating assignment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update assignment: {str(e)}"
        )


@router.delete("/{assignment_id}")
async def delete_assignment(
    assignment_id: str,
    current_user = Depends(get_current_user)
):
    """
    Delete an assignment (Teachers only - their own assignments)
    """
    try:
        # Check if user is a teacher
        if current_user.role.value != "teacher":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only teachers can delete assignments"
            )
        
        db = await get_database()
        
        # Check if assignment exists and belongs to this teacher
        assignment = await db.assignments.find_one({
            "_id": ObjectId(assignment_id),
            "teacher_id": str(current_user.id)
        })
        
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assignment not found or you don't have permission to delete it"
            )
        
        # Delete assignment
        await db.assignments.delete_one({"_id": ObjectId(assignment_id)})
        
        # Also delete related submissions
        await db.submissions.delete_many({"assignment_id": assignment_id})
        
        return {
            "message": "Assignment deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting assignment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete assignment: {str(e)}"
        )


# Submission endpoints
@router.post("/submissions", status_code=status.HTTP_201_CREATED)
async def submit_assignment(
    submission: SubmissionCreate,
    current_user = Depends(get_current_user)
):
    """
    Submit an assignment (Students only)
    """
    try:
        # Check if user is a student
        if current_user.role.value != "student":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only students can submit assignments"
            )
        
        db = await get_database()
        
        # Check if assignment exists
        assignment = await db.assignments.find_one({"_id": ObjectId(submission.assignment_id)})
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assignment not found"
            )
        
        # Check if already submitted
        existing = await db.submissions.find_one({
            "assignment_id": submission.assignment_id,
            "student_id": str(current_user.id)
        })
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already submitted this assignment"
            )
        
        # Create submission document
        submission_doc = {
            "assignment_id": submission.assignment_id,
            "assignment_title": assignment.get("title"),
            "student_id": str(current_user.id),
            "student_name": current_user.display_name or "Student",
            "file_url": submission.file_url,
            "text_content": submission.text_content,
            "comments": submission.comments,
            "submitted_at": datetime.utcnow().isoformat(),
            "status": "submitted",
            "grade": None,
            "feedback": None
        }
        
        # Insert submission
        result = await db.submissions.insert_one(submission_doc)
        
        submission_doc["id"] = str(result.inserted_id)
        submission_doc.pop("_id", None)
        
        return {
            "message": "Assignment submitted successfully",
            "submission": submission_doc
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting assignment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit assignment: {str(e)}"
        )


@router.get("/submissions/my-submissions")
async def get_my_submissions(
    current_user = Depends(get_current_user)
):
    """
    Get current user's submissions
    """
    try:
        db = await get_database()
        
        query = {"student_id": str(current_user.id)}
        
        cursor = db.submissions.find(query).sort("submitted_at", -1)
        submissions = await cursor.to_list(length=100)
        
        for submission in submissions:
            submission["id"] = str(submission["_id"])
            submission.pop("_id", None)
        
        return {
            "submissions": submissions,
            "total": len(submissions)
        }
        
    except Exception as e:
        logger.error(f"Error fetching submissions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch submissions: {str(e)}"
        )
