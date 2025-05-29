#!/bin/bash

# Exit on error
set -e

echo "Building the application..."
npm run build

echo "Creating deployment package..."
tar -czf deploy.tar.gz .next package.json package-lock.json public

echo "Copying files to server..."
scp -i ~/.ssh/njal.la-key deploy.tar.gz root@80.78.30.115:/var/www/megaa.dev/

echo "Deploying on server..."
ssh -i ~/.ssh/njal.la-key root@80.78.30.115 << 'ENDSSH'
cd /var/www/megaa.dev
echo "Extracting files..."
tar -xzf deploy.tar.gz
rm deploy.tar.gz
echo "Installing dependencies..."
npm install --production
echo "Restarting application..."
pm2 restart mega-ui || pm2 start ecosystem.config.js
ENDSSH

echo "Cleaning up..."
rm deploy.tar.gz

echo "Deployment completed successfully!" 