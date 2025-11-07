from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from firebase_admin import auth as firebase_auth
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    FirebaseLoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    UserResponse,
    MessageResponse
)
from app.models.user import User, UserRole
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.core.firebase import get_firebase_admin
from app.api.dependencies import get_current_user


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    """
    Register a new user - Frontend creates Firebase user, backend creates MongoDB user
    """
    firebase_admin = get_firebase_admin()
    
    try:
        # Verify Firebase ID token from frontend
        decoded_token = await firebase_admin.verify_id_token(user_data.firebase_token)
        firebase_uid = decoded_token["uid"]
        email = decoded_token.get("email")
        
        # Check if user already exists in MongoDB
        existing_user = await User.find_one(User.firebase_uid == firebase_uid)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already registered"
            )
        
        # Set custom claims for role in Firebase
        await firebase_admin.set_custom_claims(
            firebase_uid,
            {"role": user_data.role.value}
        )
        
        # Create user in MongoDB
        new_user = User(
            firebase_uid=firebase_uid,
            email=email,
            display_name=user_data.display_name,
            role=user_data.role,
            student_id=user_data.student_id,
            grade=user_data.grade,
            teacher_id=user_data.teacher_id,
            department=user_data.department,
            last_login=datetime.utcnow()
        )
        await new_user.insert()
        
        # Generate JWT tokens
        token_data = {"sub": str(new_user.id), "email": new_user.email, "role": new_user.role.value}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        # Prepare user response
        user_response = UserResponse(
            id=str(new_user.id),
            firebase_uid=new_user.firebase_uid,
            email=new_user.email,
            display_name=new_user.display_name,
            role=new_user.role,
            profile_picture=new_user.profile_picture,
            phone_number=new_user.phone_number,
            student_id=new_user.student_id,
            grade=new_user.grade,
            enrolled_courses=new_user.enrolled_courses,
            teacher_id=new_user.teacher_id,
            department=new_user.department,
            teaching_courses=new_user.teaching_courses,
            is_active=new_user.is_active,
            created_at=new_user.created_at,
            last_login=new_user.last_login
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Registration failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """
    Login with Firebase Authentication and return JWT tokens
    """
    firebase_admin = get_firebase_admin()
    
    try:
        # Note: Firebase Admin SDK doesn't provide email/password login
        # In production, use Firebase Client SDK on frontend to get ID token
        # Then verify it here and generate JWT tokens
        
        # For now, we'll fetch user by email and verify
        user = await User.find_one(User.email == credentials.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        
        # Update last login
        user.last_login = datetime.utcnow()
        await user.save()
        
        # Generate JWT tokens
        token_data = {"sub": str(user.id), "email": user.email, "role": user.role.value}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        # Prepare user response
        user_response = UserResponse(
            id=str(user.id),
            firebase_uid=user.firebase_uid,
            email=user.email,
            display_name=user.display_name,
            role=user.role,
            profile_picture=user.profile_picture,
            phone_number=user.phone_number,
            student_id=user.student_id,
            grade=user.grade,
            enrolled_courses=user.enrolled_courses,
            teacher_id=user.teacher_id,
            department=user.department,
            teaching_courses=user.teaching_courses,
            is_active=user.is_active,
            created_at=user.created_at,
            last_login=user.last_login
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.post("/login/firebase", response_model=TokenResponse)
async def login_with_firebase_token(request: FirebaseLoginRequest):
    """
    Login using Firebase ID token (from frontend Firebase SDK).
    If the Firebase user exists but no MongoDB user is found, auto-provision one.
    """
    firebase_admin = get_firebase_admin()

    try:
        # 1) Verify Firebase ID token
        decoded_token = await firebase_admin.verify_id_token(request.firebase_token)
        firebase_uid = decoded_token["uid"]
        email = decoded_token.get("email")
        display_name = decoded_token.get("name") or (email.split("@")[0] if email else "User")

        # 2) Find existing MongoDB user by firebase_uid
        user = await User.find_one(User.firebase_uid == firebase_uid)

        # 3) Auto-provision user if missing
        if not user:
            # Try to derive role from custom claims; default to student
            role_claim = decoded_token.get("role") or "student"
            try:
                role_enum = UserRole(role_claim)
            except ValueError:
                role_enum = UserRole.STUDENT

            # Ensure claims are set in Firebase (idempotent)
            await firebase_admin.set_custom_claims(firebase_uid, {"role": role_enum.value})

            user = User(
                firebase_uid=firebase_uid,
                email=email,
                display_name=display_name,
                role=role_enum,
                last_login=datetime.utcnow(),
            )
            await user.insert()

        # 4) Block inactive accounts
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )

        # 5) Update last login
        user.last_login = datetime.utcnow()
        await user.save()

        # 6) Issue JWT tokens
        token_data = {"sub": str(user.id), "email": user.email, "role": user.role.value}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        # 7) Build response
        user_response = UserResponse(
            id=str(user.id),
            firebase_uid=user.firebase_uid,
            email=user.email,
            display_name=user.display_name,
            role=user.role,
            profile_picture=user.profile_picture,
            phone_number=user.phone_number,
            student_id=user.student_id,
            grade=user.grade,
            enrolled_courses=user.enrolled_courses,
            teacher_id=user.teacher_id,
            department=user.department,
            teaching_courses=user.teaching_courses,
            is_active=user.is_active,
            created_at=user.created_at,
            last_login=user.last_login,
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_response,
        )

    except HTTPException:
        raise
    except Exception as e:
        # Token invalid, or any other Firebase error
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Firebase authentication failed: {str(e)}",
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(request: RefreshTokenRequest):
    """
    Refresh access token using refresh token
    """
    # Decode refresh token
    payload = decode_token(request.refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    # Fetch user
    user = await User.get(user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Generate new tokens
    token_data = {"sub": str(user.id), "email": user.email, "role": user.role.value}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    # Prepare user response
    user_response = UserResponse(
        id=str(user.id),
        firebase_uid=user.firebase_uid,
        email=user.email,
        display_name=user.display_name,
        role=user.role,
        profile_picture=user.profile_picture,
        phone_number=user.phone_number,
        student_id=user.student_id,
        grade=user.grade,
        enrolled_courses=user.enrolled_courses,
        teacher_id=user.teacher_id,
        department=user.department,
        teaching_courses=user.teaching_courses,
        is_active=user.is_active,
        created_at=user.created_at,
        last_login=user.last_login
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_response
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user information
    """
    return UserResponse(
        id=str(current_user.id),
        firebase_uid=current_user.firebase_uid,
        email=current_user.email,
        display_name=current_user.display_name,
        role=current_user.role,
        profile_picture=current_user.profile_picture,
        phone_number=current_user.phone_number,
        student_id=current_user.student_id,
        grade=current_user.grade,
        enrolled_courses=current_user.enrolled_courses,
        teacher_id=current_user.teacher_id,
        department=current_user.department,
        teaching_courses=current_user.teaching_courses,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        last_login=current_user.last_login
    )


@router.post("/logout", response_model=MessageResponse)
async def logout(current_user: User = Depends(get_current_user)):
    """
    Logout current user (frontend should clear tokens)
    """
    # In a production system, you might want to blacklist the refresh token
    # For now, just return success message
    return MessageResponse(
        message="Logged out successfully",
        detail="Please clear tokens from client storage"
    )
