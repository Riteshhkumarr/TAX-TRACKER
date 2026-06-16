import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FiDollarSign, FiCalendar, FiFileText, FiTag } from 'react-icons/fi'
import Input from '../common/Input'
import Button from '../common/Button'
import { INCOME_CATEGORIES, RECURRING_FREQUENCIES } from '../../utils/constants'

function IncomeForm({ onSubmit, initialData = null, loading = false }) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {
      source: '',
      category: 'salary',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      isRecurring: false,
      recurringFrequency: 'monthly',
      taxable: true,
    },
  })

  useEffect(() => {
    if (initialData) reset(initialData)
  }, [initialData, reset])

  const isRecurring = watch('isRecurring')

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      amount: parseFloat(data.amount),
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Source Name */}
      <Input
        label="Income Source"
        placeholder="e.g. Acme Corp, Client Project"
        icon={FiFileText}
        error={errors.source?.message}
        {...register('source', { required: 'Income source is required' })}
      />

      <div className="grid grid-cols-2 gap-4">
        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
          <select
            {...register('category', { required: true })}
            className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-900 dark:text-slate-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          >
            {INCOME_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <Input
          label="Amount"
          type="number"
          placeholder="0.00"
          icon={FiDollarSign}
          error={errors.amount?.message}
          {...register('amount', {
            required: 'Amount is required',
            min: { value: 0.01, message: 'Amount must be positive' },
          })}
        />
      </div>

      {/* Date */}
      <Input
        label="Date"
        type="date"
        icon={FiCalendar}
        error={errors.date?.message}
        {...register('date', { required: 'Date is required' })}
      />

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Description <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          {...register('description')}
          placeholder="Additional notes..."
          rows={2}
          className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-900 dark:text-slate-100 placeholder:text-slate-400 px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
      </div>

      {/* Toggles Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Recurring toggle */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-dark-card">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Recurring</p>
            <p className="text-xs text-slate-500">Repeat this income</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" {...register('isRecurring')} className="sr-only peer" />
            <div className="w-10 h-5 bg-slate-200 dark:bg-dark-border rounded-full peer peer-checked:bg-primary transition-colors peer-focus:ring-2 peer-focus:ring-primary/30 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
          </label>
        </div>

        {/* Taxable toggle */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-dark-card">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Taxable</p>
            <p className="text-xs text-slate-500">Subject to income tax</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" {...register('taxable')} className="sr-only peer" defaultChecked />
            <div className="w-10 h-5 bg-slate-200 dark:bg-dark-border rounded-full peer peer-checked:bg-primary transition-colors peer-focus:ring-2 peer-focus:ring-primary/30 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
          </label>
        </div>
      </div>

      {/* Recurring Frequency */}
      {isRecurring && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Recurring Frequency</label>
          <select
            {...register('recurringFrequency')}
            className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-900 dark:text-slate-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {RECURRING_FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
        >
          {initialData ? 'Update Income' : 'Add Income'}
        </Button>
      </div>
    </form>
  )
}

export default IncomeForm
