#!/bin/bash

# Update system
apt update && apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Nginx
apt install -y nginx

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx

# Create application directory
mkdir -p /var/www/megaa.dev
chown -R $USER:$USER /var/www/megaa.dev

# Configure Nginx
cat > /etc/nginx/sites-available/megaa.dev << 'EOL'
server {
    listen 80;
    server_name megaa.dev www.megaa.dev;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOL

# Enable the site
ln -s /etc/nginx/sites-available/megaa.dev /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Install PM2 globally
npm install -g pm2

# Create PM2 ecosystem file
cat > /var/www/megaa.dev/ecosystem.config.js << 'EOL'
module.exports = {
  apps: [{
    name: 'mega-ui',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOL

# Setup automatic PM2 startup
pm2 startup
pm2 save

# Wait for DNS propagation (5 minutes)
echo "Waiting for DNS propagation..."
sleep 300

# Setup SSL with Let's Encrypt
certbot --nginx -d megaa.dev -d www.megaa.dev --non-interactive --agree-tos --email your-email@example.com

# Set proper permissions
chown -R $USER:$USER /var/www/megaa.dev
chmod -R 755 /var/www/megaa.dev 