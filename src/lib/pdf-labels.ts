import jsPDF from 'jspdf'
import { generateQRDataUrl, getTraceUrl, type QRData } from './qr-generator'

/**
 * Generate a printable PDF label for a batch with QR code
 * Label size: ~100mm x 60mm (fits standard label printers)
 */
export async function generateBatchLabel(data: QRData): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [100, 60] })

  // QR code image
  const qrDataUrl = await generateQRDataUrl(data.batchNumber, 512)
  doc.addImage(qrDataUrl, 'PNG', 4, 4, 30, 30)

  // Title
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('AgroBio', 38, 8)

  // Batch info
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`Lote: ${data.batchNumber}`, 38, 14)

  if (data.productName) {
    doc.text(`Produto: ${data.productName}`, 38, 19)
  }

  doc.text(`Produção: ${formatDate(data.productionDate)}`, 38, 24)

  if (data.expiryDate) {
    doc.text(`Validade: ${formatDate(data.expiryDate)}`, 38, 29)
  }

  // URL at bottom
  doc.setFontSize(5)
  doc.setTextColor(100)
  const url = getTraceUrl(data.batchNumber)
  doc.text(url, 4, 38)

  // Border
  doc.setDrawColor(200)
  doc.rect(1, 1, 98, 58)

  return doc
}

/**
 * Generate a multi-label PDF sheet (A4, 2x5 grid = 10 labels per page)
 */
export async function generateLabelSheet(items: QRData[]): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const labelW = 95
  const labelH = 55
  const marginX = 10
  const marginY = 10
  const cols = 2
  const rows = 5

  for (let i = 0; i < items.length; i++) {
    if (i > 0 && i % (cols * rows) === 0) {
      doc.addPage()
    }

    const pageIdx = i % (cols * rows)
    const col = pageIdx % cols
    const row = Math.floor(pageIdx / cols)
    const x = marginX + col * labelW
    const y = marginY + row * labelH

    const data = items[i]
    const qrDataUrl = await generateQRDataUrl(data.batchNumber, 512)

    // QR
    doc.addImage(qrDataUrl, 'PNG', x + 2, y + 2, 25, 25)

    // Text
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0)
    doc.text('AgroBio', x + 30, y + 7)

    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(`Lote: ${data.batchNumber}`, x + 30, y + 12)
    if (data.productName) {
      doc.text(`Produto: ${data.productName}`, x + 30, y + 16)
    }
    doc.text(`Produção: ${formatDate(data.productionDate)}`, x + 30, y + 20)
    if (data.expiryDate) {
      doc.text(`Validade: ${formatDate(data.expiryDate)}`, x + 30, y + 24)
    }

    // URL
    doc.setFontSize(4.5)
    doc.setTextColor(100)
    doc.text(getTraceUrl(data.batchNumber), x + 2, y + 30)

    // Border
    doc.setDrawColor(200)
    doc.rect(x, y, labelW, labelH)
  }

  return doc
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('pt-BR')
  } catch {
    return dateStr
  }
}
