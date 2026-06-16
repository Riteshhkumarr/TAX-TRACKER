const PDFDocument = require('pdfkit');

/**
 * Generate a professional tax report PDF
 * @param {object} data - Report data
 * @param {object} data.user - User object
 * @param {number} data.year - Tax year
 * @param {number} data.totalIncome - Total income
 * @param {number} data.totalExpenses - Total expenses
 * @param {number} data.totalDeductions - Total deductions
 * @param {number} data.taxableIncome - Taxable income
 * @param {number} data.estimatedTax - Estimated tax
 * @param {number} data.effectiveRate - Effective tax rate
 * @param {Array} data.monthlyBreakdown - Monthly data array
 * @param {Array} data.incomes - Income records
 * @param {Array} data.expenses - Expense records
 * @param {object} data.taxBreakdown - Tax bracket breakdown
 * @returns {PDFDocument} PDF document stream
 */
const generateTaxReportPDF = (data) => {
  const doc = new PDFDocument({ margin: 50, size: 'LETTER' });

  const {
    user,
    year,
    totalIncome = 0,
    totalExpenses = 0,
    totalDeductions = 0,
    taxableIncome = 0,
    estimatedTax = 0,
    effectiveRate = 0,
    monthlyBreakdown = [],
    taxBreakdown = []
  } = data;

  const colors = {
    primary: '#1a56db',
    secondary: '#374151',
    accent: '#10b981',
    danger: '#ef4444',
    light: '#f3f4f6',
    border: '#e5e7eb',
    white: '#ffffff'
  };

  const fmt = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtPct = (n) => `${Number(n || 0).toFixed(2)}%`;

  // ── HEADER ──────────────────────────────────────────────────────────────────
  doc.rect(0, 0, doc.page.width, 100).fill(colors.primary);

  doc.fillColor(colors.white).fontSize(26).font('Helvetica-Bold')
    .text('TAX REPORT', 50, 28);

  doc.fontSize(12).font('Helvetica')
    .text(`Tax Year: ${year}`, 50, 60)
    .text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 50, 76);

  // Right side header
  doc.fontSize(12).text(`Prepared for:`, 350, 40, { align: 'right', width: 200 })
    .font('Helvetica-Bold').fontSize(14)
    .text(user.name || 'N/A', 350, 56, { align: 'right', width: 200 })
    .font('Helvetica').fontSize(11)
    .text(user.email || '', 350, 74, { align: 'right', width: 200 });

  doc.moveDown(4);

  // ── SUMMARY BOXES ─────────────────────────────────────────────────────────
  doc.fillColor(colors.secondary).fontSize(16).font('Helvetica-Bold')
    .text('Financial Summary', 50, 120);

  const boxY = 148;
  const boxW = 115;
  const boxH = 70;
  const summaryItems = [
    { label: 'Total Income', value: fmt(totalIncome), color: colors.accent },
    { label: 'Total Expenses', value: fmt(totalExpenses), color: colors.danger },
    { label: 'Deductions', value: fmt(totalDeductions), color: colors.primary },
    { label: 'Taxable Income', value: fmt(taxableIncome), color: colors.secondary }
  ];

  summaryItems.forEach((item, i) => {
    const x = 50 + i * (boxW + 10);
    doc.rect(x, boxY, boxW, boxH).fill(colors.light);
    doc.fillColor(item.color).fontSize(9).font('Helvetica-Bold')
      .text(item.label.toUpperCase(), x + 8, boxY + 10, { width: boxW - 16, align: 'center' });
    doc.fillColor(colors.secondary).fontSize(13).font('Helvetica-Bold')
      .text(item.value, x + 4, boxY + 30, { width: boxW - 8, align: 'center' });
  });

  // ── TAX DUE BOX ──────────────────────────────────────────────────────────
  const taxBoxX = 50 + 4 * (boxW + 10);
  doc.rect(taxBoxX, boxY, boxW + 10, boxH).fill(colors.primary);
  doc.fillColor(colors.white).fontSize(9).font('Helvetica-Bold')
    .text('EST. TAX DUE', taxBoxX + 8, boxY + 10, { width: boxW + 10 - 16, align: 'center' });
  doc.fontSize(13).text(fmt(estimatedTax), taxBoxX + 4, boxY + 30, { width: boxW + 10 - 8, align: 'center' });
  doc.fontSize(9).text(`Rate: ${fmtPct(effectiveRate)}`, taxBoxX + 4, boxY + 52, { width: boxW + 10 - 8, align: 'center' });

  doc.moveDown(6);

  // ── TAX BRACKET BREAKDOWN ─────────────────────────────────────────────────
  if (taxBreakdown && taxBreakdown.length > 0) {
    const tY = doc.y + 10;
    doc.fillColor(colors.secondary).fontSize(14).font('Helvetica-Bold')
      .text('Tax Bracket Breakdown', 50, tY);

    const headerY = tY + 24;
    doc.rect(50, headerY, 510, 20).fill(colors.primary);
    doc.fillColor(colors.white).fontSize(9).font('Helvetica-Bold')
      .text('Bracket', 55, headerY + 5, { width: 160 })
      .text('Rate', 220, headerY + 5, { width: 60, align: 'center' })
      .text('Taxable Amount', 285, headerY + 5, { width: 130, align: 'right' })
      .text('Tax', 420, headerY + 5, { width: 130, align: 'right' });

    let rowY = headerY + 20;
    taxBreakdown.forEach((row, i) => {
      const bg = i % 2 === 0 ? colors.white : colors.light;
      doc.rect(50, rowY, 510, 18).fill(bg);
      doc.fillColor(colors.secondary).fontSize(9).font('Helvetica')
        .text(row.bracket, 55, rowY + 4, { width: 160 })
        .text(row.rate, 220, rowY + 4, { width: 60, align: 'center' })
        .text(fmt(row.taxableAmount), 285, rowY + 4, { width: 130, align: 'right' })
        .text(fmt(row.tax), 420, rowY + 4, { width: 130, align: 'right' });
      rowY += 18;
    });

    doc.moveDown(1);
  }

  // ── MONTHLY BREAKDOWN ─────────────────────────────────────────────────────
  if (monthlyBreakdown && monthlyBreakdown.length > 0) {
    doc.addPage();

    doc.fillColor(colors.secondary).fontSize(16).font('Helvetica-Bold')
      .text('Monthly Income & Expense Breakdown', 50, 50);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const mHeaderY = 80;
    doc.rect(50, mHeaderY, 510, 20).fill(colors.primary);
    doc.fillColor(colors.white).fontSize(9).font('Helvetica-Bold')
      .text('Month', 55, mHeaderY + 5, { width: 80 })
      .text('Income', 140, mHeaderY + 5, { width: 130, align: 'right' })
      .text('Expenses', 275, mHeaderY + 5, { width: 130, align: 'right' })
      .text('Net', 410, mHeaderY + 5, { width: 140, align: 'right' });

    let mRowY = mHeaderY + 20;
    let grandIncome = 0, grandExpenses = 0;

    monthlyBreakdown.forEach((row, i) => {
      const bg = i % 2 === 0 ? colors.white : colors.light;
      const monthName = months[(row.month || i + 1) - 1] || `M${i + 1}`;
      const income = row.income || 0;
      const expenses = row.expenses || 0;
      const net = income - expenses;
      grandIncome += income;
      grandExpenses += expenses;

      doc.rect(50, mRowY, 510, 18).fill(bg);
      doc.fillColor(colors.secondary).fontSize(9).font('Helvetica')
        .text(`${monthName} ${year}`, 55, mRowY + 4, { width: 80 })
        .text(fmt(income), 140, mRowY + 4, { width: 130, align: 'right' })
        .text(fmt(expenses), 275, mRowY + 4, { width: 130, align: 'right' });

      const netColor = net >= 0 ? colors.accent : colors.danger;
      doc.fillColor(netColor).text(fmt(net), 410, mRowY + 4, { width: 140, align: 'right' });
      mRowY += 18;
    });

    // Totals row
    doc.rect(50, mRowY, 510, 20).fill(colors.secondary);
    doc.fillColor(colors.white).fontSize(9).font('Helvetica-Bold')
      .text('TOTAL', 55, mRowY + 5, { width: 80 })
      .text(fmt(grandIncome), 140, mRowY + 5, { width: 130, align: 'right' })
      .text(fmt(grandExpenses), 275, mRowY + 5, { width: 130, align: 'right' })
      .text(fmt(grandIncome - grandExpenses), 410, mRowY + 5, { width: 140, align: 'right' });
  }

  // ── FOOTER ────────────────────────────────────────────────────────────────
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill(colors.light);
    doc.fillColor(colors.secondary).fontSize(8).font('Helvetica')
      .text(
        `Tax Tracker Report | Tax Year ${year} | Generated ${new Date().toISOString()} | Page ${i + 1} of ${range.count}`,
        50,
        doc.page.height - 24,
        { align: 'center', width: doc.page.width - 100 }
      );
  }

  doc.end();
  return doc;
};

module.exports = { generateTaxReportPDF };
