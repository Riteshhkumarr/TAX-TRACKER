import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, AlertTriangle, MoreVertical, Edit2, Trash2, Calendar } from 'lucide-react';

const DUMMY_DATA = [
  { id: 1, date: '2026-05-20', title: 'Office Supplies', category: 'Housing', vendor: 'Staples', amount: 150.50, deductible: true, anomaly: false },
  { id: 2, date: '2026-05-18', title: 'Client Dinner', category: 'Food', vendor: 'Steakhouse', amount: 350.00, deductible: true, anomaly: true },
  { id: 3, date: '2026-05-15', title: 'Uber Ride', category: 'Transportation', vendor: 'Uber', amount: 24.50, deductible: true, anomaly: false },
  { id: 4, date: '2026-05-10', title: 'Software Subscription', category: 'Utilities', vendor: 'Adobe', amount: 59.99, deductible: true, anomaly: false },
  { id: 5, date: '2026-05-05', title: 'Personal Coffee', category: 'Personal', vendor: 'Starbucks', amount: 5.50, deductible: false, anomaly: false },
];

const ExpenseTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expenses, setExpenses] = useState(DUMMY_DATA);
  const [activeMenu, setActiveMenu] = useState(null);

  const filteredExpenses = expenses.filter(exp => 
    exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.vendor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors">
            <Calendar className="w-4 h-4" />
            Date Range
          </button>
          <button className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Vendor</th>
              <th className="px-6 py-4 font-medium text-right">Amount</th>
              <th className="px-6 py-4 font-medium text-center">Deductible</th>
              <th className="px-6 py-4 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((expense, i) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={expense.id} 
                className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group"
              >
                <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                  {new Date(expense.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  {expense.title}
                  {expense.anomaly && (
                    <span title="Unusual spending detected" className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                      <AlertTriangle className="w-3 h-3" />
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {expense.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{expense.vendor}</td>
                <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-slate-100">
                  ${expense.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-center">
                  {expense.deductible ? (
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                  ) : (
                    <span className="inline-block w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                  )}
                </td>
                <td className="px-6 py-4 text-center relative">
                  <button 
                    onClick={() => setActiveMenu(activeMenu === expense.id ? null : expense.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {activeMenu === expense.id && (
                    <div className="absolute right-8 top-8 w-32 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg py-1 z-10">
                      <button className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
                        <Edit2 className="w-4 h-4" /> Edit
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400">
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  )}
                </td>
              </motion.tr>
            ))}
            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                  No expenses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <span className="text-sm text-slate-500 dark:text-slate-400">Showing 1 to {filteredExpenses.length} of {filteredExpenses.length} entries</span>
        <div className="flex gap-1">
          <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-sm disabled:opacity-50 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-950">Prev</button>
          <button className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm font-medium">1</button>
          <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-sm disabled:opacity-50 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-950">Next</button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTable;
