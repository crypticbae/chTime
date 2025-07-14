#!/bin/bash

# chTime Docker Build Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="chtime"
TAG="${1:-latest}"
BUILD_ARGS=""

echo -e "${BLUE}🐳 chTime Docker Build Script${NC}"
echo "=============================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running or not accessible${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"

# Build the image
echo -e "${YELLOW}🔨 Building Docker image: ${IMAGE_NAME}:${TAG}${NC}"
if docker build -t "${IMAGE_NAME}:${TAG}" ${BUILD_ARGS} .; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Show image info
echo -e "${BLUE}📊 Image Information:${NC}"
docker images "${IMAGE_NAME}:${TAG}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

# Optional: Run container for testing
read -p "Do you want to run the container for testing? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🚀 Starting container...${NC}"
    
    # Stop any existing container
    docker stop chtime-test 2>/dev/null || true
    docker rm chtime-test 2>/dev/null || true
    
    # Run new container
    docker run -d \
        --name chtime-test \
        -p 3000:3000 \
        "${IMAGE_NAME}:${TAG}"
    
    echo -e "${GREEN}✅ Container started${NC}"
    echo -e "${BLUE}🌐 Access chTime at: http://localhost:3000${NC}"
    echo
    echo "Useful commands:"
    echo "  docker logs -f chtime-test    # View logs"
    echo "  docker stop chtime-test       # Stop container"
    echo "  docker rm chtime-test         # Remove container"
fi

echo -e "${GREEN}🎉 Docker build completed successfully!${NC}" 