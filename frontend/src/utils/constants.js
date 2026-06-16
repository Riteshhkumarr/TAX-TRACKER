// ===== INCOME CATEGORIES =====
export const INCOME_CATEGORIES = [
  { value: 'salary', label: 'Salary', icon: '💼', color: '#6366F1' },
  { value: 'freelance', label: 'Freelance', icon: '💻', color: '#8B5CF6' },
  { value: 'business', label: 'Business', icon: '🏢', color: '#06B6D4' },
  { value: 'investment', label: 'Investment', icon: '📈', color: '#10B981' },
  { value: 'rental', label: 'Rental Income', icon: '🏠', color: '#F59E0B' },
  { value: 'dividend', label: 'Dividends', icon: '💰', color: '#EF4444' },
  { value: 'capital_gains', label: 'Capital Gains', icon: '📊', color: '#EC4899' },
  { value: 'royalties', label: 'Royalties', icon: '🎵', color: '#14B8A6' },
  { value: 'pension', label: 'Pension', icon: '👴', color: '#8B5CF6' },
  { value: 'other', label: 'Other', icon: '📌', color: '#64748B' },
]

// ===== EXPENSE CATEGORIES =====
export const EXPENSE_CATEGORIES = [
  { value: 'office', label: 'Office Supplies', icon: '🖊️', color: '#6366F1' },
  { value: 'travel', label: 'Travel', icon: '✈️', color: '#06B6D4' },
  { value: 'meals', label: 'Meals & Entertainment', icon: '🍽️', color: '#F59E0B' },
  { value: 'software', label: 'Software & Subscriptions', icon: '💾', color: '#8B5CF6' },
  { value: 'hardware', label: 'Hardware & Equipment', icon: '🖥️', color: '#10B981' },
  { value: 'marketing', label: 'Marketing & Advertising', icon: '📣', color: '#EF4444' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥', color: '#EC4899' },
  { value: 'education', label: 'Education & Training', icon: '🎓', color: '#14B8A6' },
  { value: 'rent', label: 'Rent & Utilities', icon: '🏢', color: '#F97316' },
  { value: 'insurance', label: 'Insurance', icon: '🛡️', color: '#6366F1' },
  { value: 'legal', label: 'Legal & Professional', icon: '⚖️', color: '#0EA5E9' },
  { value: 'taxes', label: 'Taxes & Fees', icon: '🏛️', color: '#64748B' },
  { value: 'vehicle', label: 'Vehicle & Transport', icon: '🚗', color: '#F59E0B' },
  { value: 'home_office', label: 'Home Office', icon: '🏠', color: '#10B981' },
  { value: 'charitable', label: 'Charitable Donations', icon: '❤️', color: '#EF4444' },
  { value: 'other', label: 'Other', icon: '📌', color: '#94A3B8' },
]

// ===== PAYMENT METHODS =====
export const PAYMENT_METHODS = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'check', label: 'Check' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'other', label: 'Other' },
]

// ===== 2024 US FEDERAL TAX BRACKETS =====
export const TAX_BRACKETS = {
  single: [
    { min: 0, max: 11600, rate: 0.10, label: '10%' },
    { min: 11600, max: 47150, rate: 0.12, label: '12%' },
    { min: 47150, max: 100525, rate: 0.22, label: '22%' },
    { min: 100525, max: 191950, rate: 0.24, label: '24%' },
    { min: 191950, max: 243725, rate: 0.32, label: '32%' },
    { min: 243725, max: 609350, rate: 0.35, label: '35%' },
    { min: 609350, max: Infinity, rate: 0.37, label: '37%' },
  ],
  married_jointly: [
    { min: 0, max: 23200, rate: 0.10, label: '10%' },
    { min: 23200, max: 94300, rate: 0.12, label: '12%' },
    { min: 94300, max: 201050, rate: 0.22, label: '22%' },
    { min: 201050, max: 383900, rate: 0.24, label: '24%' },
    { min: 383900, max: 487450, rate: 0.32, label: '32%' },
    { min: 487450, max: 731200, rate: 0.35, label: '35%' },
    { min: 731200, max: Infinity, rate: 0.37, label: '37%' },
  ],
  married_separately: [
    { min: 0, max: 11600, rate: 0.10, label: '10%' },
    { min: 11600, max: 47150, rate: 0.12, label: '12%' },
    { min: 47150, max: 100525, rate: 0.22, label: '22%' },
    { min: 100525, max: 191950, rate: 0.24, label: '24%' },
    { min: 191950, max: 243725, rate: 0.32, label: '32%' },
    { min: 243725, max: 365600, rate: 0.35, label: '35%' },
    { min: 365600, max: Infinity, rate: 0.37, label: '37%' },
  ],
  head_of_household: [
    { min: 0, max: 16550, rate: 0.10, label: '10%' },
    { min: 16550, max: 63100, rate: 0.12, label: '12%' },
    { min: 63100, max: 100500, rate: 0.22, label: '22%' },
    { min: 100500, max: 191950, rate: 0.24, label: '24%' },
    { min: 191950, max: 243700, rate: 0.32, label: '32%' },
    { min: 243700, max: 609350, rate: 0.35, label: '35%' },
    { min: 609350, max: Infinity, rate: 0.37, label: '37%' },
  ],
}

// Standard deductions 2024
export const STANDARD_DEDUCTIONS = {
  single: 14600,
  married_jointly: 29200,
  married_separately: 14600,
  head_of_household: 21900,
}

// ===== MONTHS =====
export const MONTHS = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
]

export const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

// ===== CHART COLORS =====
export const CHART_COLORS = [
  '#6366F1', '#8B5CF6', '#06B6D4', '#10B981',
  '#F59E0B', '#EF4444', '#EC4899', '#14B8A6',
  '#F97316', '#0EA5E9', '#84CC16', '#A855F7',
]

// ===== FILING STATUS OPTIONS =====
export const FILING_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married_jointly', label: 'Married Filing Jointly' },
  { value: 'married_separately', label: 'Married Filing Separately' },
  { value: 'head_of_household', label: 'Head of Household' },
]

// ===== TAX YEAR OPTIONS =====
export const TAX_YEARS = [2024, 2023, 2022, 2021, 2020]

// ===== RECURRING FREQUENCIES =====
export const RECURRING_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
]
