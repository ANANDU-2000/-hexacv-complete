import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'

dotenv.config()

const app: Express = express()
const PORT = process.env.ADMIN_API_PORT || 3002

// Middleware
app.use(helmet())
app.use(compression())
app.use(cors({
  origin: process.env.ADMIN_FRONTEND_URL || 'http://localhost:5174',
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'hexaresume-admin-api'
  })
})

// Placeholder route
app.get('/api/admin', (req: Request, res: Response) => {
  res.json({ 
    message: 'HexaResume Admin API - Ready for Phase 7 implementation',
    version: '2.0.0',
    features: {
      authentication: 'JWT-based (to be implemented)',
      authorization: 'RBAC (to be implemented)',
      auditLogs: 'Comprehensive logging (to be implemented)',
      endpoints: [
        'POST /api/admin/auth/login',
        'POST /api/admin/auth/logout',
        'GET /api/admin/templates',
        'PATCH /api/admin/templates/:id',
        'GET /api/admin/analytics/conversion-funnel',
        'GET /api/admin/analytics/role-demand',
        'GET /api/admin/analytics/template-performance',
        'GET /api/admin/audit-logs'
      ]
    }
  })
})

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err)
  
  // Log to audit if admin request
  if (req.path.startsWith('/api/admin')) {
    // TODO: Log to audit_logs table
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`🔐 Admin API running on http://localhost:${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🛡️  Security: JWT + RBAC (Phase 7 implementation ready)`)
})

export default app
import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'

dotenv.config()

const app: Express = express()
const PORT = process.env.ADMIN_API_PORT || 3002

// Middleware
app.use(helmet())
app.use(compression())
app.use(cors({
  origin: process.env.ADMIN_FRONTEND_URL || 'http://localhost:5174',
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'hexaresume-admin-api'
  })
})

// Placeholder route
app.get('/api/admin', (req: Request, res: Response) => {
  res.json({ 
    message: 'HexaResume Admin API - Ready for Phase 7 implementation',
    version: '2.0.0',
    features: {
      authentication: 'JWT-based (to be implemented)',
      authorization: 'RBAC (to be implemented)',
      auditLogs: 'Comprehensive logging (to be implemented)',
      endpoints: [
        'POST /api/admin/auth/login',
        'POST /api/admin/auth/logout',
        'GET /api/admin/templates',
        'PATCH /api/admin/templates/:id',
        'GET /api/admin/analytics/conversion-funnel',
        'GET /api/admin/analytics/role-demand',
        'GET /api/admin/analytics/template-performance',
        'GET /api/admin/audit-logs'
      ]
    }
  })
})

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err)
  
  // Log to audit if admin request
  if (req.path.startsWith('/api/admin')) {
    // TODO: Log to audit_logs table
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`🔐 Admin API running on http://localhost:${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🛡️  Security: JWT + RBAC (Phase 7 implementation ready)`)
})

export default app
