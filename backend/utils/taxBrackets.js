/**
 * 2024 US Federal Tax Brackets (Single filer)
 */
const TAX_BRACKETS_2024 = [
  { min: 0,       max: 11600,   rate: 0.10 },
  { min: 11601,   max: 47150,   rate: 0.12 },
  { min: 47151,   max: 100525,  rate: 0.22 },
  { min: 100526,  max: 191950,  rate: 0.24 },
  { min: 191951,  max: 243725,  rate: 0.32 },
  { min: 243726,  max: 609350,  rate: 0.35 },
  { min: 609351,  max: Infinity, rate: 0.37 }
];

/**
 * Standard deduction for 2024
 */
const STANDARD_DEDUCTION_2024 = 14600; // Single filer

/**
 * Calculate federal income tax using progressive brackets
 * @param {number} taxableIncome - Taxable income after deductions
 * @returns {object} Tax calculation breakdown
 */
const calculateFederalTax = (taxableIncome) => {
  if (taxableIncome <= 0) {
    return {
      taxableIncome: 0,
      totalTax: 0,
      effectiveRate: 0,
      marginalRate: 0,
      breakdown: []
    };
  }

  let totalTax = 0;
  const breakdown = [];
  let marginalRate = 0;

  for (const bracket of TAX_BRACKETS_2024) {
    if (taxableIncome <= bracket.min - 1) break;

    const bracketMin = bracket.min;
    const bracketMax = Math.min(taxableIncome, bracket.max);
    const taxableInBracket = bracketMax - bracketMin + 1;

    if (taxableInBracket <= 0) continue;

    const taxInBracket = taxableInBracket * bracket.rate;
    totalTax += taxInBracket;
    marginalRate = bracket.rate;

    breakdown.push({
      bracket: `${bracketMin === 0 ? '$0' : '$' + bracketMin.toLocaleString()} - ${bracket.max === Infinity ? 'Above' : '$' + bracket.max.toLocaleString()}`,
      rate: `${(bracket.rate * 100).toFixed(0)}%`,
      taxableAmount: Math.round(taxableInBracket),
      tax: Math.round(taxInBracket * 100) / 100
    });
  }

  const effectiveRate = taxableIncome > 0 ? (totalTax / taxableIncome) * 100 : 0;

  return {
    taxableIncome: Math.round(taxableIncome * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    marginalRate: marginalRate * 100,
    breakdown
  };
};

/**
 * Get the marginal tax bracket for a given income
 * @param {number} income - Annual income
 * @returns {number} Marginal tax rate as percentage
 */
const getMarginalRate = (income) => {
  for (let i = TAX_BRACKETS_2024.length - 1; i >= 0; i--) {
    if (income >= TAX_BRACKETS_2024[i].min) {
      return TAX_BRACKETS_2024[i].rate * 100;
    }
  }
  return 10;
};

/**
 * Quarterly estimated tax deadlines for 2024
 */
const getQuarterlyDeadlines = (year) => {
  return [
    {
      quarter: 'Q1',
      period: `Jan 1 - Mar 31, ${year}`,
      dueDate: new Date(`${year}-04-15`),
      description: 'Q1 Estimated Tax Payment Due'
    },
    {
      quarter: 'Q2',
      period: `Apr 1 - May 31, ${year}`,
      dueDate: new Date(`${year}-06-17`),
      description: 'Q2 Estimated Tax Payment Due'
    },
    {
      quarter: 'Q3',
      period: `Jun 1 - Aug 31, ${year}`,
      dueDate: new Date(`${year}-09-16`),
      description: 'Q3 Estimated Tax Payment Due'
    },
    {
      quarter: 'Q4',
      period: `Sep 1 - Dec 31, ${year}`,
      dueDate: new Date(`${year + 1}-01-15`),
      description: 'Q4 Estimated Tax Payment Due'
    },
    {
      quarter: 'Annual',
      period: `Full Year ${year}`,
      dueDate: new Date(`${year + 1}-04-15`),
      description: 'Annual Tax Return Filing Due'
    }
  ];
};

module.exports = {
  TAX_BRACKETS_2024,
  STANDARD_DEDUCTION_2024,
  calculateFederalTax,
  getMarginalRate,
  getQuarterlyDeadlines
};
