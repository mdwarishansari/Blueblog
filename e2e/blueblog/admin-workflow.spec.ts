import { test, expect } from '@playwright/test'

const adminEmail = process.env['E2E_ADMIN_EMAIL']
const adminPassword = process.env['E2E_ADMIN_PASSWORD']

test.describe('Admin publish workflow', () => {
  test.beforeEach(async () => {
    test.skip(
      !adminEmail || !adminPassword,
      'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run authenticated admin tests'
    )
  })

  test('admin can login and reach dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email address/i).fill(adminEmail!)
    await page.getByLabel(/^password$/i).fill(adminPassword!)
    await page.getByRole('button', { name: /login to account/i }).click()

    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15_000 })
    await expect(page.locator('main')).toBeVisible()
  })

  test('admin posts page loads after login', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email address/i).fill(adminEmail!)
    await page.getByLabel(/^password$/i).fill(adminPassword!)
    await page.getByRole('button', { name: /login to account/i }).click()
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15_000 })

    await page.goto('/admin/posts')
    await expect(page.locator('main')).toBeVisible()
  })
})

test.describe('Role permissions (unauthenticated)', () => {
  test('writer cannot access admin posts without login', async ({ page }) => {
    await page.goto('/admin/posts')
    await expect(page).toHaveURL(/\/login/)
  })
})
