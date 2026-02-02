import { test, expect } from '@playwright/test'

test.describe('QR Traceability (Public)', () => {
  test('trace page renders header and branding', async ({ page }) => {
    await page.goto('/trace/LOT-TEST-001')
    // Should show the AgroBioConnect branding even for not found
    await expect(page.getByText('AgroBioConnect')).toBeVisible()
  })

  test('scanner page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/scanner')
    await expect(page).toHaveURL(/\/login/)
  })
})
