import { test, expect } from '@playwright/test'

test.describe('Public Routes', () => {
  test('trace page shows not found for invalid batch', async ({ page }) => {
    await page.goto('/trace/INVALID-BATCH-123')
    await expect(page.getByText(/não encontrado/i)).toBeVisible()
  })

  test('404 page renders for unknown routes', async ({ page }) => {
    await page.goto('/nonexistent-page')
    await expect(page.getByText(/404|não encontrada/i)).toBeVisible()
  })
})

test.describe('Protected Routes', () => {
  test('products page redirects to login', async ({ page }) => {
    await page.goto('/products')
    await expect(page).toHaveURL(/\/login/)
  })

  test('fields page redirects to login', async ({ page }) => {
    await page.goto('/fields')
    await expect(page).toHaveURL(/\/login/)
  })

  test('batches page redirects to login', async ({ page }) => {
    await page.goto('/batches')
    await expect(page).toHaveURL(/\/login/)
  })

  test('compliance page redirects to login', async ({ page }) => {
    await page.goto('/compliance')
    await expect(page).toHaveURL(/\/login/)
  })

  test('traceability page redirects to login', async ({ page }) => {
    await page.goto('/traceability')
    await expect(page).toHaveURL(/\/login/)
  })
})
