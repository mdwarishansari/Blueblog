import express, { Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import routes from './routes'
import { errorHandler, notFoundHandler } from './middlewares/error.middleware'
import { apiLimiter } from './middlewares/rateLimit.middleware'
import logger, { stream } from './utils/logger'

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

    // CORS configuration
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
    this.app.use(
      cors({
        origin: (origin, callback) => {
          // Allow requests with no origin (like mobile apps or curl requests)
          if (!origin) return callback(null, true)
          
          if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.'
            return callback(new Error(msg), false)
          }
          return callback(null, true)
        },
        credentials: true,
        optionsSuccessStatus: 200,
      })
    )

    // Rate limiting
    this.app.use('/api/', apiLimiter)

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

    // Static files (optional)
    this.app.use('/uploads', express.static('uploads'))
  }

  private initializeRoutes() {
    // API routes
    this.app.use('/api', routes)

    // Root endpoint
    this.app.get('/', (req, res) => {
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