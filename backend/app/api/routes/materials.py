"""
Materials API Routes
Endpoints for managing study materials
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from typing import List, Optional
from datetime import datetime
from beanie import PydanticObjectId
from beanie.operators import In
import shutil
from pathlib import Path
import os

from app.models.material import Material, MaterialType
from app.models.user import User
from app.api.dependencies import get_current_user
from app.services.rag_service import get_rag_service, RAGService


router = APIRouter(prefix="/materials", tags=["Materials"])


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_material(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    course_id: str = Form(...),
    file: UploadFile = File(...),
    tags: Optional[str] = Form(None),  # Comma-separated
    is_public: bool = Form(False),
    vectorize: bool = Form(True),  # Auto-vectorize for RAG
    current_user: User = Depends(get_current_user),
    rag_service: RAGService = Depends(get_rag_service)
):
    """
    Upload a new study material (PDF)
    Only teachers can upload materials
    """
    # Check if user is a teacher
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=403,
            detail="Only teachers can upload study materials"
        )
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported at this time"
        )
    
    try:
        # Create uploads directory if it doesn't exist
        uploads_dir = Path("./data/uploads")
        uploads_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        safe_filename = f"{timestamp}_{file.filename}"
        file_path = uploads_dir / safe_filename
        
        # Save uploaded file
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Get file size
        file_size = file_path.stat().st_size
        
        # Parse tags
        tags_list = [tag.strip() for tag in tags.split(",")] if tags else []
        
        # Create material record
        material = Material(
            title=title,
            description=description,
            course_id=course_id,
            teacher_id=str(current_user.id),
            type=MaterialType.PDF,
            file_url=str(file_path),
            file_size=file_size,
            tags=tags_list,
            is_public=is_public,
            published_at=datetime.utcnow()
        )
        
        # Save to database
        await material.insert()
        
        # Vectorize for RAG if requested
        vectorization_result = None
        if vectorize:
            try:
                vectorization_result = await rag_service.vectorize_material(
                    material_id=str(material.id),
                    file_path=str(file_path),
                    metadata={
                        "title": title,
                        "course_id": course_id,
                        "uploaded_by": str(current_user.id),
                        "filename": file.filename
                    }
                )
            except Exception as e:
                print(f"Warning: Vectorization failed: {str(e)}")
                # Don't fail the upload if vectorization fails
        
        return {
            "success": True,
            "material_id": str(material.id),
            "title": material.title,
            "file_size": file_size,
            "file_path": str(file_path),
            "vectorized": vectorization_result is not None,
            "vectorization_info": vectorization_result,
            "message": "Material uploaded successfully"
        }
        
    except Exception as e:
        # Clean up file if database insert fails
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/")
async def get_materials(
    course_id: Optional[str] = None,
    teacher_id: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
    current_user: User = Depends(get_current_user)
):
    """
    Get list of materials
    Students see public materials + materials in their courses
    Teachers see their own materials
    """
    query = {}
    
    if current_user.role == "teacher":
        # Teachers see their own materials
        if teacher_id:
            query["teacher_id"] = teacher_id
        else:
            query["teacher_id"] = str(current_user.id)
    else:
        # Students see public materials or materials they have access to
        query["$or"] = [
            {"is_public": True},
            {"accessible_to": str(current_user.id)}
        ]
    
    if course_id:
        query["course_id"] = course_id
    
    materials = await Material.find(query).sort("-created_at").skip(skip).limit(limit).to_list()
    
    return {
        "materials": [
            {
                "id": str(m.id),
                "title": m.title,
                "description": m.description,
                "course_id": m.course_id,
                "teacher_id": m.teacher_id,
                "type": m.type,
                "file_url": m.file_url,
                "file_size": m.file_size,
                "tags": m.tags,
                "is_public": m.is_public,
                "created_at": m.created_at.isoformat(),
                "published_at": m.published_at.isoformat() if m.published_at else None,
                "view_count": m.view_count,
                "download_count": m.download_count
            }
            for m in materials
        ],
        "total": len(materials)
    }


@router.get("/{material_id}")
async def get_material(
    material_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific material by ID"""
    try:
        material = await Material.get(PydanticObjectId(material_id))
        
        if not material:
            raise HTTPException(status_code=404, detail="Material not found")
        
        # Check access permissions
        if current_user.role != "teacher" or str(material.teacher_id) != str(current_user.id):
            if not material.is_public and str(current_user.id) not in material.accessible_to:
                raise HTTPException(status_code=403, detail="Access denied")
        
        # Increment view count
        material.view_count += 1
        await material.save()
        
        return {
            "id": str(material.id),
            "title": material.title,
            "description": material.description,
            "course_id": material.course_id,
            "teacher_id": material.teacher_id,
            "type": material.type,
            "file_url": material.file_url,
            "file_size": material.file_size,
            "tags": material.tags,
            "is_public": material.is_public,
            "created_at": material.created_at.isoformat(),
            "published_at": material.published_at.isoformat() if material.published_at else None,
            "view_count": material.view_count,
            "download_count": material.download_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{material_id}")
async def delete_material(
    material_id: str,
    current_user: User = Depends(get_current_user),
    rag_service: RAGService = Depends(get_rag_service)
):
    """
    Delete a material
    Only the teacher who uploaded it can delete
    """
    try:
        material = await Material.get(PydanticObjectId(material_id))
        
        if not material:
            raise HTTPException(status_code=404, detail="Material not found")
        
        # Check ownership
        if current_user.role != "teacher" or str(material.teacher_id) != str(current_user.id):
            raise HTTPException(
                status_code=403,
                detail="Only the teacher who uploaded this material can delete it"
            )
        
        # Delete file from storage
        if material.file_url:
            file_path = Path(material.file_url)
            if file_path.exists():
                file_path.unlink()
        
        # Delete vector embeddings
        try:
            await rag_service.delete_material_vectors(material_id)
        except Exception as e:
            print(f"Warning: Failed to delete vectors: {str(e)}")
        
        # Delete from database
        await material.delete()
        
        return {
            "success": True,
            "message": "Material deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{material_id}/increment-download")
async def increment_download(
    material_id: str,
    current_user: User = Depends(get_current_user)
):
    """Increment download count for a material"""
    try:
        material = await Material.get(PydanticObjectId(material_id))
        
        if not material:
            raise HTTPException(status_code=404, detail="Material not found")
        
        material.download_count += 1
        await material.save()
        
        return {"success": True, "download_count": material.download_count}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{material_id}/download")
async def download_material(
    material_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Download a material file
    Returns the actual file for download
    """
    try:
        material = await Material.get(PydanticObjectId(material_id))
        
        if not material:
            raise HTTPException(status_code=404, detail="Material not found")
        
        # Check access permissions
        if current_user.role != "teacher" or str(material.teacher_id) != str(current_user.id):
            if not material.is_public and str(current_user.id) not in material.accessible_to:
                raise HTTPException(status_code=403, detail="Access denied")
        
        # Verify file exists
        file_path = Path(material.file_url)
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found on server")
        
        # Increment download count
        material.download_count += 1
        await material.save()
        
        # Return file for download
        return FileResponse(
            path=str(file_path),
            media_type='application/pdf',
            filename=f"{material.title}.pdf"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
