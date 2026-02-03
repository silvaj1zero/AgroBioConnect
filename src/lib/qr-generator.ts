import QRCode from 'qrcode'

const BASE_URL = typeof window !== 'undefined'
  ? `${window.location.origin}/trace`
  : 'https://agrobio.ai/trace'

export interface QRData {
  batchId: string
  batchNumber: string
  productName?: string
  productionDate: string
  expiryDate?: string
}

/**
 * Build the public traceability URL for a batch
 */
export function getTraceUrl(batchNumber: string): string {
  return `${BASE_URL}/${encodeURIComponent(batchNumber)}`
}

/**
 * Generate QR code as data URL (PNG base64)
 */
export async function generateQRDataUrl(batchNumber: string, size = 256): Promise<string> {
  const url = getTraceUrl(batchNumber)
  return QRCode.toDataURL(url, {
    width: size,
    margin: 2,
    color: { dark: '#1B4332', light: '#FFFFFF' },
    errorCorrectionLevel: 'M',
  })
}

/**
 * Generate QR code as canvas element
 */
export async function generateQRCanvas(
  canvas: HTMLCanvasElement,
  batchNumber: string,
  size = 256
): Promise<void> {
  const url = getTraceUrl(batchNumber)
  await QRCode.toCanvas(canvas, url, {
    width: size,
    margin: 2,
    color: { dark: '#1B4332', light: '#FFFFFF' },
    errorCorrectionLevel: 'M',
  })
}
