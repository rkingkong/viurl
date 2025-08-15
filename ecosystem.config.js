module.exports = {
  apps: [
    {
      name: 'viurl-backend',
      script: './server.js',
      cwd: '/var/www/viurl',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'viurl-frontend',
      script: 'npm',
      args: 'run preview',
      cwd: '/var/www/viurl/client',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 4173
      }
    }
  ]
};
