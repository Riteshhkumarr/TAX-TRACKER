import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiEdit2, FiTrash2, FiSearch, FiChevronUp, FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { formatCurrency, formatDate } from '../../utils/formatters'
import Badge from '../common/Badge'

const PAGE_SIZE = 10

function IncomeTable({ incomes = [], onEdit, onDelete, loading = false }) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return incomes.filter((item) =>
      [item.source, item.category, item.description]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  }, [incomes, search])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va = a[sortKey]
      let vb = b[sortKey]
      if (sortKey === 'date') {
        va = new Date(va).getTime()
        vb = new Date(vb).getTime()
      }
      if (sortKey === 'amount') {
        va = Number(va)
        vb = Number(vb)
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
    setPage(1)
  }

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <FiChevronUp size={12} className="opacity-30" />
    return sortDir === 'asc' ? <FiChevronUp size={12} className="text-primary" /> : <FiChevronDown size={12} className="text-primary" />
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <div className="skeleton h-4 flex-1 rounded" />
            <div className="skeleton h-4 w-20 rounded" />
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-4 w-16 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Search bar */}
      <div className="mb-4 flex items-center gap-2 bg-slate-100 dark:bg-dark-card rounded-xl px-3 py-2.5 max-w-sm">
        <FiSearch size={16} className="text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search income..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="bg-transparent text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none flex-1"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-dark-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-dark-card border-b border-slate-200 dark:border-dark-border">
              {[
                { key: 'date', label: 'Date' },
                { key: 'source', label: 'Source' },
                { key: 'category', label: 'Category' },
                { key: 'amount', label: 'Amount' },
                { key: 'taxable', label: 'Taxable' },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => toggleSort(key)}
                  className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 select-none"
                >
                  <span className="flex items-center gap-1">
                    {label} <SortIcon col={key} />
                  </span>
                </th>
              ))}
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
            <AnimatePresence>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <p className="text-2xl mb-2">📭</p>
                    <p className="text-sm">No income records found</p>
                  </td>
                </tr>
              ) : (
                paginated.map((item, i) => (
                  <motion.tr
                    key={item._id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-slate-50 dark:hover:bg-dark-card/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(item.date)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 dark:text-white">{item.source}</p>
                      {item.description && (
                        <p className="text-xs text-slate-400 truncate max-w-40">{item.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="primary" size="sm">{item.category}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-success">{formatCurrency(item.amount)}</span>
                      {item.isRecurring && (
                        <span className="ml-1.5 text-xs text-slate-400">↻ {item.recurringFrequency}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={item.taxable ? 'warning' : 'default'} size="sm">
                        {item.taxable ? 'Taxable' : 'Non-taxable'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit?.(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => onDelete?.(item._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-danger hover:bg-danger/10 transition-colors"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <p className="text-slate-500 dark:text-slate-400">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-dark-card text-slate-600 dark:text-slate-400"
            >
              <FiChevronLeft size={16} />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-sm font-medium ${
                  page === i + 1
                    ? 'bg-primary text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-card'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-dark-card text-slate-600 dark:text-slate-400"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default IncomeTable
