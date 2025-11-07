"""
Firebase Admin SDK Credential Extractor
This will read your downloaded Firebase service account JSON and format it for .env
"""

import json
import sys
from pathlib import Path

def main():
    # Look for service account JSON files
    backend_dir = Path(__file__).parent
    json_files = list(backend_dir.glob("*firebase*.json")) + list(backend_dir.glob("*service*.json"))
    
    if not json_files:
        print("=" * 70)
        print("❌ No Firebase service account JSON file found!")
        print("=" * 70)
        print()
        print("Please:")
        print("1. Go to: https://console.firebase.google.com/project/edudash-4f7ef/settings/serviceaccounts/adminsdk")
        print("2. Click 'Generate new private key'")
        print("3. Save the downloaded JSON file in this folder (backend/)")
        print("4. Run this script again")
        print()
        return 1
    
    # Use the first JSON file found
    json_file = json_files[0]
    print("=" * 70)
    print(f"✅ Found service account file: {json_file.name}")
    print("=" * 70)
    print()
    
    try:
        with open(json_file, 'r') as f:
            creds = json.load(f)
        
        print("Reading credentials...")
        print()
        print("=" * 70)
        print("📋 Copy these lines to your backend/.env file:")
        print("=" * 70)
        print()
        
        # Print formatted credentials
        print(f'FIREBASE_TYPE={creds.get("type", "service_account")}')
        print(f'FIREBASE_PROJECT_ID={creds.get("project_id", "")}')
        print(f'FIREBASE_PRIVATE_KEY_ID={creds.get("private_key_id", "")}')
        
        # Format private key properly
        private_key = creds.get("private_key", "").replace('\n', '\\n')
        print(f'FIREBASE_PRIVATE_KEY="{private_key}"')
        
        print(f'FIREBASE_CLIENT_EMAIL={creds.get("client_email", "")}')
        print(f'FIREBASE_CLIENT_ID={creds.get("client_id", "")}')
        print(f'FIREBASE_AUTH_URI={creds.get("auth_uri", "https://accounts.google.com/o/oauth2/auth")}')
        print(f'FIREBASE_TOKEN_URI={creds.get("token_uri", "https://oauth2.googleapis.com/token")}')
        print(f'FIREBASE_AUTH_PROVIDER_CERT_URL={creds.get("auth_provider_x509_cert_url", "https://www.googleapis.com/oauth2/v1/certs")}')
        print(f'FIREBASE_CLIENT_CERT_URL={creds.get("client_x509_cert_url", "")}')
        
        print()
        print("=" * 70)
        print()
        print("✅ Credentials extracted successfully!")
        print()
        print("⚠️  IMPORTANT:")
        print("   - Copy ALL the lines above")
        print("   - Replace the corresponding lines in backend/.env")
        print("   - Make sure FIREBASE_PRIVATE_KEY keeps the quotes and \\n")
        print("   - Save the file and restart the backend")
        print()
        print("=" * 70)
        
        return 0
        
    except Exception as e:
        print(f"❌ Error reading JSON file: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
