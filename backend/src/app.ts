import express, { Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import routes from './routes'
import { errorHandler, notFoundHandler } from './middlewares/error.middleware'
import { apiLimiter } from './middlewares/rateLimit.middleware'
import { stream } from './utils/logger'

class App {
  public app: Application

  constructor() {
    this.app = express()
    this.initializeMiddlewares()
    this.initializeRoutes()
    this.initializeErrorHandling()
  }

  private initializeMiddlewares() {
  // Security headers
  this.app.use(helmet())

  // CORS (DEV)
  this.app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  )

  // Rate limit ONLY protected routes
  this.app.use('/api/auth', apiLimiter)
  this.app.use('/api/admin', apiLimiter)
  this.app.use('/api/users', apiLimiter)

  // Request logging
  this.app.use(
    morgan(
      ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
      { stream }
    )
  )

  // Body parsers
  this.app.use(express.json({ limit: '10mb' }))
  this.app.use(express.urlencoded({ extended: true, limit: '10mb' }))
  this.app.use(cookieParser())

  // Static files
  this.app.use('/uploads', express.static('uploads'))
}


  private initializeRoutes() {
    // API routes
    this.app.use('/api', routes)

    // Root endpoint
    this.app.get('/', (_req, res) => {
      res.json({
        message: 'Welcome to BlueBlog API',
        version: '1.0.0',
        docs: '/api/health',
        status: 'operational',
      })
    })
  }

  private initializeErrorHandling() {
    // Handle 404
    this.app.use('*', notFoundHandler)

    // Handle errors
    this.app.use(errorHandler)
  }

  public getApp(): Application {
    return this.app
  }
}

export default new App().app