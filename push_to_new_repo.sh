#!/bin/bash

# Script to push all files to new repository
# Repository: https://github.com/Nihith132/hactober

echo "🚀 Preparing to push to new repository..."

# Navigate to project directory
cd /Users/nihithreddy/Downloads/Hactober-main

# Remove existing .git directory if it exists
if [ -d ".git" ]; then
    echo "📦 Removing old git repository..."
    rm -rf .git
fi

# Initialize new git repository
echo "🎯 Initializing new git repository..."
git init

# Add the new remote repository
echo "🔗 Adding remote repository..."
git remote add origin https://github.com/Nihith132/hactober.git

# Create or update .gitignore to NOT ignore anything (empty .gitignore)
echo "📝 Creating empty .gitignore to include all files..."
cat > .gitignore << 'EOF'
# Minimal gitignore - only exclude git folder itself
.git/
EOF

# Add all files (including .env files and node_modules if you want everything)
echo "📁 Adding all files..."
git add -A

# Show what will be committed
echo "📊 Files to be committed:"
git status

# Commit with timestamp
echo "💾 Committing files..."
git commit -m "Initial commit - Complete project upload on $(date '+%Y-%m-%d %H:%M:%S')"

# Push to main branch (force push to overwrite if needed)
echo "🚀 Pushing to GitHub..."
echo "⚠️  You will be prompted for your GitHub credentials"
git branch -M main
git push -u origin main --force

echo "✅ Done! All files have been pushed to https://github.com/Nihith132/hactober"
