import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, FileSpreadsheet, ChevronDown, Filter, Loader2 } from 'lucide-react';

const MOCK_DATA = [
  { month: 'January', income: 8500, expense: 3200, tax: 1200, net: 4100 },
  { month: 'February', income: 9200, expense: 2800, tax: 1300, net: 5100 },
  { month: 'March', income: 7800, expense: 4100, tax: 1000, net: 2700 },
  { month: 'April', income: 11500, expense: 3500, tax: 1800, net: 6200 },
];

const ReportsPage = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = (type) => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      // alert mock
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Financial Reports</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Generate, view, and export your financial summaries.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <select className="appearance-none pl-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
              <option>Fiscal Year 2024</option>
              <option>Fiscal Year 2023</option>
              <option>Custom Date Range</option>
            </select>
            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
          <button className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Income</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">$37,000.00</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Expenses</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">$13,600.00</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Est. Tax Paid/Owed</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">$5,300.00</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Net Profit</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">$18,100.00</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Monthly Breakdown</h3>
          
          <div className="flex gap-2">
            <button onClick={() => handleExport('pdf')} disabled={isExporting} className="px-3 py-1.5 text-sm bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-lg font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50">
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} PDF
            </button>
            <button onClick={() => handleExport('excel')} disabled={isExporting} className="px-3 py-1.5 text-sm bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-lg font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50">
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />} Excel
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-xs border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Month</th>
                <th className="px-6 py-4 font-medium text-right">Gross Income</th>
                <th className="px-6 py-4 font-medium text-right">Expenses</th>
                <th className="px-6 py-4 font-medium text-right">Tax Liability</th>
                <th className="px-6 py-4 font-medium text-right">Net Income</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {MOCK_DATA.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{row.month}</td>
                  <td className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400">${row.income.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-rose-600 dark:text-rose-400">-${row.expense.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-amber-600 dark:text-amber-400">-${row.tax.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">${row.net.toLocaleString()}</td>
                </tr>
              ))}
              <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold text-slate-900 dark:text-white">
                <td className="px-6 py-4">Total</td>
                <td className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400">$37,000</td>
                <td className="px-6 py-4 text-right text-rose-600 dark:text-rose-400">-$13,600</td>
                <td className="px-6 py-4 text-right text-amber-600 dark:text-amber-400">-$5,300</td>
                <td className="px-6 py-4 text-right">$18,100</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
