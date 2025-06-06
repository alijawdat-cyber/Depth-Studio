import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import dashboardRoutes from './api/dashboards'
import usersRoutes from './api/users'
import brandsRoutes from './api/brands'
import campaignsRoutes from './api/campaigns'
import tasksRoutes from './api/tasks'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Parse allowed origins from environment
const getAllowedOrigins = (): string[] => {
  const origins = process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:3000'
  return origins.split(',').map(origin => origin.trim())
}

// ======================================
// Middleware
// ======================================
app.use(cors({
  origin: getAllowedOrigins(),
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Debug middleware in development
if (process.env.DEBUG_MODE === 'true') {
  app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.path} - ${new Date().toISOString()}`)
    next()
  })
}

// ======================================
// Routes
// ======================================

// Health check with environment info
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Depth Studio API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID || 'depth-studio',
      region: process.env.DATABASE_REGION || 'nam5'
    }
  })
})

// Configuration endpoint (development only)
if (process.env.NODE_ENV === 'development') {
  app.get('/config', (req, res) => {
    res.status(200).json({
      success: true,
      environment: process.env.NODE_ENV,
      port: PORT,
      cors: {
        allowedOrigins: getAllowedOrigins()
      },
      firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID,
        databaseRegion: process.env.DATABASE_REGION
      }
    })
  })
}

// API Routes
app.use('/api/dashboards', dashboardRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/brands', brandsRoutes)
app.use('/api/campaigns', campaignsRoutes)
app.use('/api/tasks', tasksRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /health',
      'GET /api/dashboards',
      ...(process.env.NODE_ENV === 'development' ? ['GET /config'] : [])
    ]
  })
})

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err)
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// ======================================
// Start Server
// ======================================
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Depth Studio API running on port ${PORT}`)
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🌐 CORS Origins: ${getAllowedOrigins().join(', ')}`)
    console.log(`🔗 Health check: http://localhost:${PORT}/health`)
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚙️ Config endpoint: http://localhost:${PORT}/config`)
    }
  })
}

export default app 