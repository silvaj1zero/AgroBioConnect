import jsPDF from 'jspdf'
import { generateQRDataUrl } from './qr-generator'
import type { ProductionBatch, QualityReport, Biofactory } from '@/types/database'

/**
 * Generate a compliance certificate PDF for a batch
 */
export async function generateComplianceCertificate(opts: {
  batch: ProductionBatch
  biofactory?: Biofactory
  reports: QualityReport[]
  organizationName?: string
}): Promise<jsPDF> {
  const { batch, biofactory, reports, organizationName } = opts
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const w = doc.internal.pageSize.getWidth()
  let y = 20

  // Header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(27, 67, 50) // #1B4332
  doc.text('AgroBioConnect', w / 2, y, { align: 'center' })
  y += 8
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100)
  doc.text('Certificado de Conformidade', w / 2, y, { align: 'center' })
  y += 12

  // Divider
  doc.setDrawColor(27, 67, 50)
  doc.setLineWidth(0.5)
  doc.line(20, y, w - 20, y)
  y += 10

  // Batch Info
  doc.setFontSize(10)
  doc.setTextColor(0)
  doc.setFont('helvetica', 'bold')
  doc.text('Dados do Lote', 20, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  const info = [
    ['Número do Lote:', batch.batch_number],
    ['Data de Produção:', formatDate(batch.production_date)],
    ['Volume:', batch.volume_liters ? `${batch.volume_liters} L` : '—'],
    ['Status:', translateStatus(batch.status)],
    ['Concentração:', batch.organism_concentration ?? '—'],
  ]
  if (batch.expiry_date) info.push(['Validade:', formatDate(batch.expiry_date)])

  for (const [label, value] of info) {
    doc.setFont('helvetica', 'bold')
    doc.text(label, 25, y)
    doc.setFont('helvetica', 'normal')
    doc.text(value, 70, y)
    y += 5
  }
  y += 5

  // Biofactory
  if (biofactory) {
    doc.setFont('helvetica', 'bold')
    doc.text('Biofábrica', 20, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.text(`${biofactory.name}`, 25, y); y += 5
    doc.text(`${biofactory.address_city}, ${biofactory.address_state}`, 25, y); y += 5
    if (biofactory.mapa_registration) {
      doc.text(`Registro MAPA: ${biofactory.mapa_registration}`, 25, y); y += 5
    }
    y += 5
  }

  // Organization
  if (organizationName) {
    doc.setFont('helvetica', 'bold')
    doc.text('Organização:', 20, y)
    doc.setFont('helvetica', 'normal')
    doc.text(organizationName, 70, y)
    y += 10
  }

  // Quality Reports
  if (reports.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.text('Laudos Laboratoriais', 20, y)
    y += 6

    for (const r of reports) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.text(`Laudo ${r.report_number} — ${formatDate(r.report_date)}`, 25, y)
      y += 5
      doc.setFont('helvetica', 'normal')
      const items: string[] = []
      if (r.ufc_ml != null) items.push(`UFC/mL: ${r.ufc_ml.toExponential(1)}`)
      if (r.purity_percentage != null) items.push(`Pureza: ${r.purity_percentage}%`)
      if (r.ph_value != null) items.push(`pH: ${r.ph_value}`)
      if (r.viability_percentage != null) items.push(`Viabilidade: ${r.viability_percentage}%`)
      doc.text(items.join('  |  '), 25, y)
      y += 5
      const flags: string[] = []
      if (r.salmonella_present) flags.push('Salmonella: DETECTADA')
      if (r.ecoli_present) flags.push('E. coli: DETECTADA')
      if (flags.length) {
        doc.setTextColor(200, 0, 0)
        doc.text(flags.join('  |  '), 25, y)
        doc.setTextColor(0)
        y += 5
      }
      y += 3
    }
    doc.setFontSize(10)
  }

  // QR Code
  y += 5
  const qrDataUrl = await generateQRDataUrl(batch.batch_number, 512)
  doc.addImage(qrDataUrl, 'PNG', w / 2 - 20, y, 40, 40)
  y += 45
  doc.setFontSize(7)
  doc.setTextColor(100)
  doc.text('Escaneie o QR code para verificar a rastreabilidade online', w / 2, y, { align: 'center' })

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15
  doc.setFontSize(7)
  doc.setTextColor(150)
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')} — AgroBioConnect`, w / 2, footerY, { align: 'center' })
  doc.text('Este documento é gerado eletronicamente e não requer assinatura.', w / 2, footerY + 4, { align: 'center' })

  return doc
}

/**
 * Generate a field notebook report PDF
 */
export async function generateFieldNotebookReport(opts: {
  entries: Array<{
    entry_date: string
    activity_type: string
    field_name?: string
    description: string
    weather_conditions?: string
    temperature_celsius?: number
    products_used?: any[]
  }>
  organizationName?: string
  dateRange?: { from: string; to: string }
}): Promise<jsPDF> {
  const { entries, organizationName, dateRange } = opts
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const w = doc.internal.pageSize.getWidth()
  let y = 20

  // Header
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(27, 67, 50)
  doc.text('Caderno de Campo Digital', w / 2, y, { align: 'center' })
  y += 7
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100)
  if (organizationName) {
    doc.text(organizationName, w / 2, y, { align: 'center' })
    y += 5
  }
  if (dateRange) {
    doc.text(`Período: ${formatDate(dateRange.from)} a ${formatDate(dateRange.to)}`, w / 2, y, { align: 'center' })
    y += 5
  }
  y += 5

  doc.setDrawColor(27, 67, 50)
  doc.setLineWidth(0.3)
  doc.line(20, y, w - 20, y)
  y += 8

  // Table header
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Data', 20, y)
  doc.text('Tipo', 45, y)
  doc.text('Talhão', 80, y)
  doc.text('Descrição', 105, y)
  y += 2
  doc.line(20, y, w - 20, y)
  y += 4

  // Rows
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  for (const e of entries) {
    if (y > 270) {
      doc.addPage()
      y = 20
    }
    doc.text(formatDate(e.entry_date), 20, y)
    doc.text(e.activity_type ?? '—', 45, y)
    doc.text(e.field_name ?? '—', 80, y)
    const desc = e.description.length > 60 ? e.description.substring(0, 57) + '...' : e.description
    doc.text(desc, 105, y)
    y += 5
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 10
  doc.setFontSize(6)
  doc.setTextColor(150)
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')} — AgroBioConnect`, w / 2, footerY, { align: 'center' })

  return doc
}

/**
 * Export data as CSV
 */
export function exportCSV(headers: string[], rows: string[][], filename: string) {
  const bom = '\uFEFF' // UTF-8 BOM for Excel
  const csv = bom + [headers.join(';'), ...rows.map((r) => r.map(escapeCSV).join(';'))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function escapeCSV(val: string): string {
  if (val.includes(';') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`
  }
  return val
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR')
  } catch {
    return dateStr
  }
}

function translateStatus(status: string): string {
  const map: Record<string, string> = {
    in_production: 'Em Produção',
    quality_control: 'Controle de Qualidade',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    distributed: 'Distribuído',
  }
  return map[status] ?? status
}
