"""
Firebase Admin SDK Setup Helper

This script will guide you through getting your Firebase Admin SDK credentials.
"""

print("=" * 70)
print("Firebase Admin SDK Setup")
print("=" * 70)
print()
print("You need to get your Firebase Service Account credentials.")
print()
print("Steps:")
print("1. Go to: https://console.firebase.google.com/")
print("2. Select your project: edudash-4f7ef")
print("3. Click the gear icon ⚙️  > Project Settings")
print("4. Go to the 'Service Accounts' tab")
print("5. Click 'Generate New Private Key'")
print("6. A JSON file will be downloaded")
print()
print("=" * 70)
print()

import json
import os
from pathlib import Path

# Check if service account file exists
service_account_path = Path(__file__).parent / "firebase-service-account.json"

if service_account_path.exists():
    print(f"✅ Found service account file: {service_account_path}")
    print()
    print("Reading credentials...")
    
    with open(service_account_path, 'r') as f:
        creds = json.load(f)
    
    print()
    print("Add these to your .env file:")
    print("=" * 70)
    print(f'FIREBASE_TYPE="{creds.get("type", "service_account")}"')
    print(f'FIREBASE_PROJECT_ID="{creds.get("project_id", "")}"')
    print(f'FIREBASE_PRIVATE_KEY_ID="{creds.get("private_key_id", "")}"')
    print(f'FIREBASE_PRIVATE_KEY="{creds.get("private_key", "")}"')
    print(f'FIREBASE_CLIENT_EMAIL="{creds.get("client_email", "")}"')
    print(f'FIREBASE_CLIENT_ID="{creds.get("client_id", "")}"')
    print(f'FIREBASE_AUTH_URI="{creds.get("auth_uri", "")}"')
    print(f'FIREBASE_TOKEN_URI="{creds.get("token_uri", "")}"')
    print(f'FIREBASE_AUTH_PROVIDER_CERT_URL="{creds.get("auth_provider_x509_cert_url", "")}"')
    print(f'FIREBASE_CLIENT_CERT_URL="{creds.get("client_x509_cert_url", "")}"')
    print("=" * 70)
    print()
    print("⚠️  IMPORTANT: The FIREBASE_PRIVATE_KEY must keep all \\n characters!")
    print()
    
else:
    print("❌ Service account file not found.")
    print()
    print("Please:")
    print(f"1. Download the JSON file from Firebase Console")
    print(f"2. Save it as: {service_account_path}")
    print(f"3. Run this script again")
    print()

print("=" * 70)
print()
print("Need help? Check QUICK_SETUP.md for detailed instructions")
print()
