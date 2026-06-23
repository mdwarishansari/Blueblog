import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
  ],
  testPathIgnorePatterns: ['<rootDir>/e2e/', '<rootDir>/node_modules/'],
  transformIgnorePatterns: [
    '/node_modules/(?!(@tiptap|happy-dom)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'lib/auth.ts',
    'lib/permissions.ts',
    'lib/rate-limit.ts',
    'lib/renderContent.ts',
    'lib/seo.ts',
    'lib/utils.ts',
    'app/api/auth/**/*.ts',
    'app/api/posts/route.ts',
    'app/api/admin/posts/route.ts',
    'app/api/contact/route.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'json-summary'],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
  },
}

export default createJestConfig(config)
