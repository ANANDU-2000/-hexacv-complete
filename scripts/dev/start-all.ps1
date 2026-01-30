# Development environment startup script for Windows
# This script starts all services for local development

Write-Host "🚀 Starting HexaResume Development Environment..." -ForegroundColor Green

# Check if pnpm is installed
if (!(Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ pnpm is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g pnpm"
    exit 1
}

# Check if docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
pnpm install

Write-Host "🔨 Building shared packages..." -ForegroundColor Cyan
pnpm --filter @hexaresume/shared-types build
pnpm --filter @hexaresume/ui-components build
pnpm --filter @hexaresume/utils build

Write-Host "🐘 Starting PostgreSQL and Redis with Docker Compose..." -ForegroundColor Cyan
docker-compose -f infrastructure\docker\docker-compose.yml up -d postgres redis

Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "🗄️  Running database migrations..." -ForegroundColor Cyan
Set-Location services\api
pnpm db:migrate
Set-Location ..\..

Write-Host "✅ Development environment is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Available services:"
Write-Host "  - PostgreSQL: localhost:5432"
Write-Host "  - Redis: localhost:6379"
Write-Host ""
Write-Host "To start the applications:"
Write-Host "  - User Web: pnpm --filter @hexaresume/user-web dev"
Write-Host "  - API: pnpm --filter @hexaresume/api dev"
Write-Host "  - All apps: turbo run dev"
Write-Host ""
Write-Host "To stop services:"
Write-Host "  docker-compose -f infrastructure\docker\docker-compose.yml down"
