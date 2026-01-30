import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'

// Import routes (modular structure ready)
// import templatesRoutes from './modules/templates/templates.routes.js'
// import ordersRoutes from './modules/orders/orders.routes.js'
// import analyticsRoutes from './modules/analytics/analytics.routes.js'

dotenv.config()

const app: Express = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(compression())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'hexaresume-api'
  })
})

// API Routes (will be modularized)
// app.use('/api/templates', templatesRoutes)
// app.use('/api/orders', ordersRoutes)
// app.use('/api/analytics', analyticsRoutes)

// Placeholder route
app.get('/api', (req: Request, res: Response) => {
  res.json({ 
    message: 'HexaResume API - Modular structure ready',
    version: '2.0.0',
    status: 'restructured'
  })
})

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err)
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
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔧 API structure: Modular (Phase 6 ready)`)
})

export default app
import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'

// Import routes (modular structure ready)
// import templatesRoutes from './modules/templates/templates.routes.js'
// import ordersRoutes from './modules/orders/orders.routes.js'
// import analyticsRoutes from './modules/analytics/analytics.routes.js'

dotenv.config()

const app: Express = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(compression())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'hexaresume-api'
  })
})

// API Routes (will be modularized)
// app.use('/api/templates', templatesRoutes)
// app.use('/api/orders', ordersRoutes)
// app.use('/api/analytics', analyticsRoutes)

// Placeholder route
app.get('/api', (req: Request, res: Response) => {
  res.json({ 
    message: 'HexaResume API - Modular structure ready',
    version: '2.0.0',
    status: 'restructured'
  })
})

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err)
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
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔧 API structure: Modular (Phase 6 ready)`)
})

export default app
