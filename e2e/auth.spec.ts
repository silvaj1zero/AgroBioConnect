import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('login page renders tabs', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('AgroBioConnect')).toBeVisible()
    await expect(page.getByRole('tab', { name: /magic link/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /senha/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /cadastro/i })).toBeVisible()
  })

  test('shows validation on empty email submit', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /enviar link/i }).click()
    // Should stay on login page (no navigation)
    await expect(page).toHaveURL(/\/login/)
  })
})
