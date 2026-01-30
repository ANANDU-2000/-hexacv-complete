/* ==============================================
PM2 Ecosystem Configuration for HexaCV Backend
==============================================
This file configures PM2 process manager for production
*/

module.exports = {
  apps: [{
    name: 'hexacv-backend',
    script: './dist/server.js',
    instances: 1,
    exec_mode: 'cluster',
    
    // Environment variables
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    
    // Logging
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Auto-restart configuration
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    
    // Restart on crash
    min_uptime: '10s',
    max_restarts: 10,
    
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 10000,
    
    // Source map support
    node_args: '--enable-source-maps'
  }]
}
