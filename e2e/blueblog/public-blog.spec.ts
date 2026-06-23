import { test, expect } from '@playwright/test'

test.describe('Public blog reading', () => {
  test('homepage loads with navigation and main content', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('main')).toBeVisible()
    await expect(page.getByRole('link', { name: /home/i }).first()).toBeVisible()
  })

  test('blog listing page is accessible', async ({ page }) => {
    await page.goto('/blog')

    await expect(page).toHaveURL(/\/blog/)
    await expect(page.locator('main')).toBeVisible()
  })

  test('about and contact pages render semantic main landmarks', async ({ page }) => {
    await page.goto('/about')
    await expect(page.locator('main')).toBeVisible()

    await page.goto('/contact')
    await expect(page.locator('main')).toBeVisible()
  })

  test('robots.txt and sitemap.xml are served', async ({ request }) => {
    const robots = await request.get('/robots.txt')
    expect(robots.ok()).toBeTruthy()
    expect(await robots.text()).toContain('Sitemap')

    const sitemap = await request.get('/sitemap.xml')
    expect(sitemap.ok()).toBeTruthy()
    expect(await sitemap.text()).toContain('<urlset')
  })
})
