#!/bin/bash
cd /var/www/viurl
git pull origin main
npm install
npm run build
pm2 restart viurl
echo "Deployment completed at $(date)" >> deploy.log
