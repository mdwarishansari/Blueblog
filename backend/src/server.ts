import app from './app'
import prisma from './utils/prisma'
import logger from './utils/logger'

const PORT = process.env.PORT || 4000

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing server...')

  try {
    await prisma.$disconnect()
    logger.info('Database connection closed')

    process.exit(0)
  } catch (error) {
    logger.error('Error during shutdown:', error)
    process.exit(1)
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  process.exit(1)
})

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Handle shutdown signals
process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`)
  logger.info(`📚 API Documentation: http://localhost:${PORT}/api/health`)
  logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)
})

export default server