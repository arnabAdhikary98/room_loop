# RoomLoop Development Server Launcher
# This script sets up the environment and starts the Next.js development server

Write-Host "Starting RoomLoop development server..." -ForegroundColor Cyan

# Check if .env.local exists, if not, create a template
if (-not (Test-Path .env.local)) {
    Write-Host "Creating .env.local template..." -ForegroundColor Yellow
    @"
# MongoDB Connection String
# Replace with your actual MongoDB connection string
MONGODB_URI=mongodb+srv://adhikaryarnab1998:AIeitaoLem2Qv1An@cluster0.tot0uwb.mongodb.net/roomloop?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-for-jwt-encryption

# Add other environment variables as needed
"@ | Out-File -FilePath .env.local
    Write-Host "Please update .env.local with your MongoDB connection string and NextAuth secret" -ForegroundColor Yellow
}

# Start the development server
Write-Host "Starting Next.js development server..." -ForegroundColor Green
npm run dev 