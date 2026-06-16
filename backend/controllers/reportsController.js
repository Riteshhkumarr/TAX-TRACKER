const ExcelJS = require('exceljs');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const TaxRecord = require('../models/TaxRecord');
const { generateTaxReportPDF } = require('../utils/pdfGenerator');
const { calculateFederalTax, STANDARD_DEDUCTION_2024 } = require('../utils/taxBrackets');

// ─── Helper: gather report data ────────────────────────────────────────────
const getReportData = async (userId, year) => {
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31T23:59:59`);

  const [incomes, expenses, taxRecord] = await Promise.all([
    Income.find({ userId, date: { $gte: startDate, $lte: endDate } }).sort({ date: 1 }),
    Expense.find({ userId, date: { $gte: startDate, $lte: endDate } }).sort({ date: 1 }),
    TaxRecord.findOne({ userId, year, quarter: 'Annual' })
  ]);

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalDeductibleExpenses = expenses.reduce((s, e) =>
    s + (e.isDeductible ? (e.amount * e.deductionPercentage / 100) : 0), 0);
  const applicableDeduction = Math.max(STANDARD_DEDUCTION_2024, totalDeductibleExpenses);
  const taxableIncome = Math.max(0, totalIncome - applicableDeduction);
  const taxCalc = calculateFederalTax(taxableIncome);

  // Monthly breakdown
  const monthlyMap = {};
  for (let m = 1; m <= 12; m++) {
    monthlyMap[m] = { month: m, income: 0, expenses: 0 };
  }

  incomes.forEach((i) => {
    const m = new Date(i.date).getMonth() + 1;
    monthlyMap[m].income += i.amount;
  });

  expenses.forEach((e) => {
    const m = new Date(e.date).getMonth() + 1;
    monthlyMap[m].expenses += e.amount;
  });

  const monthlyBreakdown = Object.values(monthlyMap);

  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    totalDeductions: Math.round(applicableDeduction * 100) / 100,
    taxableIncome: taxCalc.taxableIncome,
    estimatedTax: taxCalc.totalTax,
    effectiveRate: taxCalc.effectiveRate,
    taxBreakdown: taxCalc.breakdown,
    monthlyBreakdown,
    incomes,
    expenses,
    taxRecord
  };
};

// ─── Generate PDF ──────────────────────────────────────────────────────────
exports.generatePDF = async (req, res, next) => {
  try {
    const year = parseInt(req.params.year);
    if (isNaN(year) || year < 2000 || year > 2100) {
      return res.status(400).json({ success: false, message: 'Invalid year.' });
    }

    const reportData = await getReportData(req.user._id, year);

    const doc = generateTaxReportPDF({
      user: req.user,
      year,
      ...reportData
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="tax-report-${year}.pdf"`);

    doc.pipe(res);
  } catch (error) {
    next(error);
  }
};

// ─── Generate Excel ────────────────────────────────────────────────────────
exports.generateExcel = async (req, res, next) => {
  try {
    const year = parseInt(req.params.year);
    if (isNaN(year) || year < 2000 || year > 2100) {
      return res.status(400).json({ success: false, message: 'Invalid year.' });
    }

    const reportData = await getReportData(req.user._id, year);
    const { totalIncome, totalExpenses, totalDeductions, taxableIncome, estimatedTax, effectiveRate, monthlyBreakdown, incomes, expenses } = reportData;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Tax Tracker';
    workbook.created = new Date();

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // ── SUMMARY SHEET ────────────────────────────────────────────────────────
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { key: 'label', width: 30 },
      { key: 'value', width: 20 }
    ];

    const addSummaryRow = (label, value, bold = false, numFmt = null) => {
      const row = summarySheet.addRow({ label, value });
      if (bold) {
        row.getCell('label').font = { bold: true };
        row.getCell('value').font = { bold: true };
      }
      if (numFmt) row.getCell('value').numFmt = numFmt;
      return row;
    };

    summarySheet.addRow(['TAX SUMMARY REPORT', '']).getCell('label').font = { size: 16, bold: true, color: { argb: 'FF1A56DB' } };
    summarySheet.addRow([`Tax Year: ${year}`, '']);
    summarySheet.addRow([`Prepared for: ${req.user.name}`, '']);
    summarySheet.addRow([`Email: ${req.user.email}`, '']);
    summarySheet.addRow([`Generated: ${new Date().toLocaleDateString()}`, '']);
    summarySheet.addRow([]);

    addSummaryRow('INCOME & EXPENSES', '', true);
    addSummaryRow('Total Income', totalIncome, false, '"$"#,##0.00');
    addSummaryRow('Total Expenses', totalExpenses, false, '"$"#,##0.00');
    addSummaryRow('Total Deductions', totalDeductions, false, '"$"#,##0.00');
    addSummaryRow('Taxable Income', taxableIncome, true, '"$"#,##0.00');
    summarySheet.addRow([]);

    addSummaryRow('TAX CALCULATION', '', true);
    addSummaryRow('Estimated Federal Tax', estimatedTax, false, '"$"#,##0.00');
    addSummaryRow('Effective Tax Rate', effectiveRate / 100, false, '0.00%');
    summarySheet.addRow([]);

    addSummaryRow('MONTHLY BREAKDOWN', '', true);
    const mbHeaderRow = summarySheet.addRow(['Month', 'Income', 'Expenses', 'Net']);
    mbHeaderRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A56DB' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    });

    monthlyBreakdown.forEach((mb) => {
      const net = mb.income - mb.expenses;
      const row = summarySheet.addRow([months[mb.month - 1], mb.income, mb.expenses, net]);
      row.getCell(2).numFmt = '"$"#,##0.00';
      row.getCell(3).numFmt = '"$"#,##0.00';
      row.getCell(4).numFmt = '"$"#,##0.00';
      if (net < 0) row.getCell(4).font = { color: { argb: 'FFEF4444' } };
    });

    // ── INCOME SHEET ─────────────────────────────────────────────────────────
    const incomeSheet = workbook.addWorksheet('Income');
    incomeSheet.columns = [
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Source', key: 'source', width: 25 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Currency', key: 'currency', width: 10 },
      { header: 'Taxable', key: 'taxable', width: 10 },
      { header: 'Recurring', key: 'isRecurring', width: 12 },
      { header: 'Description', key: 'description', width: 30 }
    ];

    const incomeHeaderRow = incomeSheet.getRow(1);
    incomeHeaderRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    });

    incomes.forEach((inc) => {
      const row = incomeSheet.addRow({
        date: new Date(inc.date).toLocaleDateString(),
        source: inc.source,
        category: inc.category,
        amount: inc.amount,
        currency: inc.currency,
        taxable: inc.taxable ? 'Yes' : 'No',
        isRecurring: inc.isRecurring ? 'Yes' : 'No',
        description: inc.description || ''
      });
      row.getCell('amount').numFmt = '"$"#,##0.00';
    });

    // Total row
    const incomeTotalRow = incomeSheet.addRow({ source: 'TOTAL', amount: totalIncome });
    incomeTotalRow.getCell('source').font = { bold: true };
    incomeTotalRow.getCell('amount').numFmt = '"$"#,##0.00';
    incomeTotalRow.getCell('amount').font = { bold: true };

    // ── EXPENSES SHEET ───────────────────────────────────────────────────────
    const expenseSheet = workbook.addWorksheet('Expenses');
    expenseSheet.columns = [
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Title', key: 'title', width: 25 },
      { header: 'Category', key: 'category', width: 18 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Vendor', key: 'vendor', width: 20 },
      { header: 'Payment Method', key: 'paymentMethod', width: 16 },
      { header: 'Deductible', key: 'isDeductible', width: 12 },
      { header: 'Deduction %', key: 'deductionPercentage', width: 14 },
      { header: 'Deductible Amt', key: 'deductibleAmt', width: 16 },
      { header: 'Description', key: 'description', width: 30 }
    ];

    const expenseHeaderRow = expenseSheet.getRow(1);
    expenseHeaderRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEF4444' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    });

    expenses.forEach((exp) => {
      const deductibleAmt = exp.isDeductible ? (exp.amount * exp.deductionPercentage / 100) : 0;
      const row = expenseSheet.addRow({
        date: new Date(exp.date).toLocaleDateString(),
        title: exp.title,
        category: exp.category,
        amount: exp.amount,
        vendor: exp.vendor || '',
        paymentMethod: exp.paymentMethod,
        isDeductible: exp.isDeductible ? 'Yes' : 'No',
        deductionPercentage: exp.deductionPercentage,
        deductibleAmt,
        description: exp.description || ''
      });
      row.getCell('amount').numFmt = '"$"#,##0.00';
      row.getCell('deductibleAmt').numFmt = '"$"#,##0.00';
    });

    const expenseTotalRow = expenseSheet.addRow({ title: 'TOTAL', amount: totalExpenses });
    expenseTotalRow.getCell('title').font = { bold: true };
    expenseTotalRow.getCell('amount').numFmt = '"$"#,##0.00';
    expenseTotalRow.getCell('amount').font = { bold: true };

    // Write to response
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="tax-report-${year}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

// ─── Get Summary ───────────────────────────────────────────────────────────
exports.getSummary = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const userId = req.user._id;

    const reportData = await getReportData(userId, year);

    const {
      totalIncome, totalExpenses, totalDeductions,
      taxableIncome, estimatedTax, effectiveRate,
      taxBreakdown, monthlyBreakdown, taxRecord
    } = reportData;

    res.json({
      success: true,
      year,
      data: {
        summary: {
          totalIncome,
          totalExpenses,
          totalDeductions,
          netIncome: Math.round((totalIncome - totalExpenses) * 100) / 100,
          taxableIncome,
          estimatedTax,
          effectiveRate,
          savingsRate: totalIncome > 0
            ? Math.round(((totalIncome - totalExpenses - estimatedTax) / totalIncome) * 10000) / 100
            : 0
        },
        taxBreakdown,
        monthlyBreakdown,
        taxRecord: taxRecord || null,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};
