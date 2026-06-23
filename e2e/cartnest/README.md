/**
 * CartNest E2E tests are maintained in the separate CartNest repository.
 * This placeholder documents the required coverage scope for portfolio parity:
 * - Register / Login
 * - Product browsing
 * - Cart operations
 * - Checkout flow
 * - Seller dashboard
 * - Admin actions
 *
 * Blocker: CartNest is not part of the BlueBlog monorepo/workspace.
 */
import { test } from '@playwright/test'

test.describe('CartNest (external project)', () => {
  test.skip(true, 'CartNest lives in ../CartNest — run E2E from that repository')
})
