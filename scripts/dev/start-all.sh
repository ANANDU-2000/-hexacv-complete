#!/bin/bash

# Development environment startup script
# This script starts all services for local development

set -e

echo "🚀 Starting HexaResume Development Environment..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "   npm install -g pnpm"
    exit 1
fi

# Check if docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "📦 Installing dependencies..."
pnpm install

echo "🔨 Building shared packages..."
pnpm --filter @hexaresume/shared-types build
pnpm --filter @hexaresume/ui-components build
pnpm --filter @hexaresume/utils build

echo "🐘 Starting PostgreSQL and Redis with Docker Compose..."
docker-compose -f infrastructure/docker/docker-compose.yml up -d postgres redis

echo "⏳ Waiting for database to be ready..."
sleep 5

echo "🗄️  Running database migrations..."
cd services/api && pnpm db:migrate && cd ../..

echo "✅ Development environment is ready!"
echo ""
echo "Available services:"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo ""
echo "To start the applications:"
echo "  - User Web: pnpm --filter @hexaresume/user-web dev"
echo "  - API: pnpm --filter @hexaresume/api dev"
echo "  - All apps: turbo run dev"
echo ""
echo "To stop services:"
echo "  docker-compose -f infrastructure/docker/docker-compose.yml down"
