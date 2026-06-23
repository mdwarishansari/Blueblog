import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('login page renders accessible form fields', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByLabel(/email address/i)).toBeVisible()
    await expect(page.getByLabel(/^password$/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /login to account/i })).toBeVisible()
  })

  test('shows validation feedback for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel(/email address/i).fill('invalid@example.com')
    await page.getByLabel(/^password$/i).fill('wrongpassword')
    await page.getByRole('button', { name: /login to account/i }).click()

    await expect(page.getByText(/invalid credentials|login failed/i)).toBeVisible({
      timeout: 10_000,
    })
  })

  test('redirects unauthenticated admin routes to login', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('registration page links from login', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: /create writer account/i }).click()
    await expect(page).toHaveURL(/\/register/)
  })
})
