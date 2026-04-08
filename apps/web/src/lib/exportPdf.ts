import jsPDF from 'jspdf'
import type { Contract, ContractClause } from '@/types/api'

export function exportAnalysisReport(contract: Contract, clauses: ContractClause[]) {
  const doc = new jsPDF()
  const margin = 20
  let y = margin

  function addText(text: string, fontSize: number, isBold = false, color: [number, number, number] = [224, 230, 240]) {
    doc.setFontSize(fontSize)
    doc.setTextColor(...color)
    if (isBold) doc.setFont('helvetica', 'bold')
    else doc.setFont('helvetica', 'normal')

    const lines = doc.splitTextToSize(text, 170)
    for (const line of lines) {
      if (y > 275) {
        doc.addPage()
        y = margin
      }
      doc.text(line, margin, y)
      y += fontSize * 0.5
    }
  }

  doc.setFillColor(10, 14, 26)
  doc.rect(0, 0, 210, 297, 'F')

  addText('SENTINEL AI', 24, true, [0, 212, 255])
  y += 2
  addText('CONTRACT RISK ANALYSIS REPORT', 10, true, [94, 110, 138])
  y += 8

  addText(contract.name, 16, true)
  y += 2
  addText(`Generated: ${new Date().toLocaleDateString()}`, 8, false, [94, 110, 138])
  y += 8

  const riskColor: [number, number, number] =
    (contract.risk_score ?? 0) <= 25 ? [0, 255, 136] :
    (contract.risk_score ?? 0) <= 50 ? [255, 170, 0] :
    (contract.risk_score ?? 0) <= 75 ? [255, 102, 51] :
    [255, 51, 102]

  addText(`RISK SCORE: ${contract.risk_score ?? 'N/A'}/100`, 18, true, riskColor)
  y += 8

  if (contract.summary) {
    addText('SUMMARY', 12, true, [0, 212, 255])
    y += 2
    addText(contract.summary, 9)
    y += 6
  }

  if (contract.key_obligations && contract.key_obligations.length > 0) {
    addText('KEY OBLIGATIONS', 12, true, [0, 212, 255])
    y += 2
    for (const ob of contract.key_obligations) {
      addText(`• ${ob}`, 9)
    }
    y += 6
  }

  if (contract.red_flags && contract.red_flags.length > 0) {
    addText('RED FLAGS', 12, true, [255, 51, 102])
    y += 2
    for (const rf of contract.red_flags) {
      addText(`⚠ ${rf}`, 9, false, [255, 51, 102])
    }
    y += 6
  }

  if (clauses.length > 0) {
    addText('CLAUSE ANALYSIS', 12, true, [0, 212, 255])
    y += 4

    for (const clause of clauses) {
      if (y > 250) {
        doc.addPage()
        doc.setFillColor(10, 14, 26)
        doc.rect(0, 0, 210, 297, 'F')
        y = margin
      }

      const clauseRiskColor: [number, number, number] =
        clause.risk_level === 'low' ? [0, 255, 136] :
        clause.risk_level === 'medium' ? [255, 170, 0] :
        clause.risk_level === 'high' ? [255, 102, 51] :
        [255, 51, 102]

      addText(`[${clause.risk_level.toUpperCase()}] ${clause.category}`, 10, true, clauseRiskColor)
      y += 1
      addText(clause.raw_text, 8, false, [160, 170, 190])
      y += 1
      addText(`Rationale: ${clause.rationale}`, 8, false, [94, 110, 138])
      y += 4
    }
  }

  doc.save(`sentinel-report-${contract.name.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`)
}
