"""
Backend Setup Verification Script
Run this script to verify your backend configuration before starting the server.
"""

import os
import sys
from pathlib import Path


def check_python_version():
    """Check if Python version is 3.9 or higher"""
    print("Checking Python version...")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 9:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} (OK)")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro} (Requires 3.9+)")
        return False


def check_dependencies():
    """Check if required packages are installed"""
    print("\nChecking required packages...")
    required_packages = [
        'fastapi',
        'uvicorn',
        'motor',
        'beanie',
        'firebase_admin',
        'pydantic',
        'pydantic_settings',
        'python_jose',
        'passlib',
        'bcrypt'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} (NOT INSTALLED)")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n❌ Missing packages: {', '.join(missing_packages)}")
        print("Run: pip install -r requirements.txt")
        return False
    
    return True


def check_env_file():
    """Check if .env file exists and has required variables"""
    print("\nChecking .env file...")
    env_path = Path(__file__).parent / '.env'
    
    if not env_path.exists():
        print("❌ .env file not found")
        print("Copy .env.example to .env and configure it")
        return False
    
    print("✅ .env file exists")
    
    # Check for required variables
    required_vars = [
        'MONGODB_URL',
        'FIREBASE_PROJECT_ID',
        'FIREBASE_PRIVATE_KEY',
        'FIREBASE_CLIENT_EMAIL',
        'JWT_SECRET_KEY'
    ]
    
    missing_vars = []
    with open(env_path, 'r') as f:
        content = f.read()
        for var in required_vars:
            if f"{var}=" in content:
                # Check if it has a value (not just the placeholder)
                for line in content.split('\n'):
                    if line.startswith(f"{var}="):
                        value = line.split('=', 1)[1].strip()
                        if value and not value.startswith('your-') and value != 'change-this':
                            print(f"✅ {var}")
                        else:
                            print(f"⚠️  {var} (needs configuration)")
                            missing_vars.append(var)
                        break
            else:
                print(f"❌ {var} (NOT FOUND)")
                missing_vars.append(var)
    
    if missing_vars:
        print(f"\n⚠️  Configure these variables in .env: {', '.join(missing_vars)}")
        return False
    
    return True


def check_mongodb():
    """Check if MongoDB is accessible"""
    print("\nChecking MongoDB connection...")
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        import asyncio
        from app.core.config import settings
        
        async def test_connection():
            try:
                client = AsyncIOMotorClient(settings.MONGODB_URL)
                await client.admin.command('ping')
                print(f"✅ MongoDB connection successful")
                print(f"   URL: {settings.MONGODB_URL}")
                print(f"   Database: {settings.MONGODB_DB_NAME}")
                client.close()
                return True
            except Exception as e:
                print(f"❌ MongoDB connection failed: {str(e)}")
                print("   Make sure MongoDB is running")
                return False
        
        return asyncio.run(test_connection())
    
    except Exception as e:
        print(f"❌ Error checking MongoDB: {str(e)}")
        return False


def check_firebase():
    """Check if Firebase credentials are valid"""
    print("\nChecking Firebase configuration...")
    try:
        from app.core.config import settings
        
        # Check if Firebase environment variables are set
        if not settings.FIREBASE_PROJECT_ID or settings.FIREBASE_PROJECT_ID.startswith('your-'):
            print("❌ Firebase not configured properly")
            print("   Update Firebase credentials in .env file")
            return False
        
        print(f"✅ Firebase project ID: {settings.FIREBASE_PROJECT_ID}")
        print("   Note: Full Firebase validation happens on server startup")
        return True
    
    except Exception as e:
        print(f"❌ Error checking Firebase: {str(e)}")
        return False


def main():
    """Run all verification checks"""
    print("=" * 60)
    print("Educational Dashboard Backend - Setup Verification")
    print("=" * 60)
    
    checks = [
        ("Python Version", check_python_version),
        ("Dependencies", check_dependencies),
        ("Environment File", check_env_file),
        ("MongoDB", check_mongodb),
        ("Firebase", check_firebase),
    ]
    
    results = []
    for name, check_func in checks:
        try:
            result = check_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n❌ Error during {name} check: {str(e)}")
            results.append((name, False))
    
    print("\n" + "=" * 60)
    print("VERIFICATION SUMMARY")
    print("=" * 60)
    
    all_passed = True
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
        if not result:
            all_passed = False
    
    print("=" * 60)
    
    if all_passed:
        print("\n🎉 All checks passed! Your backend is ready to run.")
        print("\nStart the server with:")
        print("  python -m uvicorn app.main:app --reload")
        print("\nOr:")
        print("  python -m app.main")
        print("\nAPI Docs: http://localhost:8000/api/docs")
    else:
        print("\n⚠️  Some checks failed. Please fix the issues above before starting the server.")
        print("\nRefer to:")
        print("  - QUICKSTART.md for setup instructions")
        print("  - README.md for detailed documentation")
    
    print()
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
