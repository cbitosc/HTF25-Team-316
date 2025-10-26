import firebase_admin
from firebase_admin import credentials, auth
from app.core.config import settings
import json


class FirebaseAdmin:
    """Firebase Admin SDK Manager"""
    
    def __init__(self):
        self.cred = None
        self.app = None
        self._initialized = False
    
    def initialize(self):
        """Initialize Firebase Admin SDK"""
        # Prevent multiple initializations
        if self._initialized:
            return
        
        try:
            # Check if app already exists
            try:
                self.app = firebase_admin.get_app()
                self._initialized = True
                print("✅ Firebase Admin SDK already initialized")
                return
            except ValueError:
                # App doesn't exist, create it
                pass
            
            # Create credentials dict from environment variables
            cred_dict = {
                "type": settings.FIREBASE_TYPE,
                "project_id": settings.FIREBASE_PROJECT_ID,
                "private_key_id": settings.FIREBASE_PRIVATE_KEY_ID,
                "private_key": settings.FIREBASE_PRIVATE_KEY.replace('\\n', '\n'),
                "client_email": settings.FIREBASE_CLIENT_EMAIL,
                "client_id": settings.FIREBASE_CLIENT_ID,
                "auth_uri": settings.FIREBASE_AUTH_URI,
                "token_uri": settings.FIREBASE_TOKEN_URI,
                "auth_provider_x509_cert_url": settings.FIREBASE_AUTH_PROVIDER_CERT_URL,
                "client_x509_cert_url": settings.FIREBASE_CLIENT_CERT_URL
            }
            
            self.cred = credentials.Certificate(cred_dict)
            self.app = firebase_admin.initialize_app(self.cred)
            self._initialized = True
            print("✅ Firebase Admin SDK initialized successfully")
            
        except Exception as e:
            print(f"❌ Error initializing Firebase Admin SDK: {str(e)}")
            raise
    
    async def verify_id_token(self, id_token: str) -> dict:
        """Verify Firebase ID token"""
        try:
            decoded_token = auth.verify_id_token(id_token)
            return decoded_token
        except Exception as e:
            print(f"Token verification failed: {str(e)}")
            raise
    
    async def get_user(self, uid: str):
        """Get user by UID"""
        try:
            user = auth.get_user(uid)
            return user
        except Exception as e:
            print(f"Get user failed: {str(e)}")
            raise
    
    async def create_user(self, email: str, password: str, display_name: str = None):
        """Create a new Firebase user"""
        try:
            user = auth.create_user(
                email=email,
                password=password,
                display_name=display_name,
                email_verified=False
            )
            return user
        except Exception as e:
            print(f"Create user failed: {str(e)}")
            raise
    
    async def update_user(self, uid: str, **kwargs):
        """Update user information"""
        try:
            user = auth.update_user(uid, **kwargs)
            return user
        except Exception as e:
            print(f"Update user failed: {str(e)}")
            raise
    
    async def delete_user(self, uid: str):
        """Delete a user"""
        try:
            auth.delete_user(uid)
            return True
        except Exception as e:
            print(f"Delete user failed: {str(e)}")
            raise
    
    async def set_custom_claims(self, uid: str, claims: dict):
        """Set custom claims for a user (e.g., role)"""
        try:
            auth.set_custom_user_claims(uid, claims)
            return True
        except Exception as e:
            print(f"Set custom claims failed: {str(e)}")
            raise


# Global Firebase Admin instance
firebase_admin_instance = None


def get_firebase_admin() -> FirebaseAdmin:
    """Get Firebase Admin instance"""
    global firebase_admin_instance
    if firebase_admin_instance is None:
        firebase_admin_instance = FirebaseAdmin()
    return firebase_admin_instance
