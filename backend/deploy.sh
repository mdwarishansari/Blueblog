#!/bin/bash

# Exit on error
set -e

# Configuration
APP_NAME="blueblog-backend"
DOCKER_IMAGE="your-docker-repo/blueblog-backend:latest"
SERVER_IP="your-ec2-ip"
SSH_KEY="~/.ssh/your-key.pem"
SSH_USER="ubuntu"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment of BlueBlog Backend to EC2${NC}"

# Build Docker image
echo -e "${YELLOW}📦 Building Docker image...${NC}"
docker build -t $DOCKER_IMAGE .

# Push to Docker registry (if using)
# docker push $DOCKER_IMAGE

# Deploy to EC2
echo -e "${YELLOW}☁️  Deploying to EC2 instance...${NC}"

# SSH into EC2 and deploy
ssh -i $SSH_KEY $SSH_USER@$SERVER_IP << 'EOF'
  # Create app directory
  mkdir -p ~/$APP_NAME
  
  # Navigate to app directory
  cd ~/$APP_NAME
  
  # Create .env file from environment variables
  cat > .env << 'ENVEOF'
PORT=4000
DATABASE_URL=${{ secrets.DATABASE_URL }}
JWT_ACCESS_SECRET=${{ secrets.JWT_ACCESS_SECRET }}
JWT_REFRESH_SECRET=${{ secrets.JWT_REFRESH_SECRET }}
ACCESS_TOKEN_EXPIRES_IN=1d
REFRESH_TOKEN_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=${{ secrets.CLOUDINARY_CLOUD_NAME }}
CLOUDINARY_API_KEY=${{ secrets.CLOUDINARY_API_KEY }}
CLOUDINARY_API_SECRET=${{ secrets.CLOUDINARY_API_SECRET }}
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ALLOWED_ORIGINS=https://your-frontend-domain.com
NODE_ENV=production
ENVEOF
  
  # Pull latest image
  docker pull $DOCKER_IMAGE
  
  # Stop and remove existing container
  docker stop $APP_NAME || true
  docker rm $APP_NAME || true
  
  # Run new container
  docker run -d \
    --name $APP_NAME \
    --restart unless-stopped \
    -p 4000:4000 \
    --env-file .env \
    -v ~/$APP_NAME/logs:/app/logs \
    -v ~/$APP_NAME/uploads:/app/uploads \
    $DOCKER_IMAGE
  
  # Clean up old images
  docker system prune -f
  
  echo "✅ Deployment completed successfully!"
EOF

echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo -e "${YELLOW}🌐 API available at: http://$SERVER_IP:4000${NC}"