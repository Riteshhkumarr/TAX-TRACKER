import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BarChart3, List, X, Receipt, Upload, AlertTriangle } from 'lucide-react';
import ExpenseForm from '../../components/expense/ExpenseForm';
import ExpenseTable from '../../components/expense/ExpenseTable';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const MOCK_MONTHLY = [
  { name: 'Jan', amount: 1200 }, { name: 'Feb', amount: 1500 }, { name: 'Mar', amount: 800 },
  { name: 'Apr', amount: 2100 }, { name: 'May', amount: 1700 }, { name: 'Jun', amount: 1900 },
];
const MOCK_PIE = [{ name: 'Housing', value: 400 }, { name: 'Food', value: 300 }, { name: 'Transport', value: 300 }];
const COLORS = ['#6366F1', '#06B6D4', '#F59E0B'];

const ExpensePage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Expense Tracker</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track spending and find tax deductions automatically.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" /> Receipt
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Expense
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-8 text-white flex items-center justify-between shadow-lg shadow-rose-500/20">
        <div>
          <p className="text-rose-100 font-medium mb-1">Total Expenses (YTD)</p>
          <h2 className="text-4xl font-bold">$12,845.50</h2>
          <div className="flex items-center gap-2 mt-2 text-rose-100 text-sm">
            <span className="bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">$4,230 Tax Deductible</span>
          </div>
        </div>
        <div className="hidden md:flex w-16 h-16 bg-white/20 backdrop-blur-md rounded-full items-center justify-center">
          <Receipt className="w-8 h-8 text-white" />
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto">
        <button onClick={() => setActiveTab('all')} className={`flex items-center gap-2 pb-3 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'all' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <List className="w-4 h-4" /> All Expenses
        </button>
        <button onClick={() => setActiveTab('analytics')} className={`flex items-center gap-2 pb-3 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'analytics' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <BarChart3 className="w-4 h-4" /> Analytics
        </button>
        <button onClick={() => setActiveTab('anomalies')} className={`flex items-center gap-2 pb-3 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'anomalies' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <AlertTriangle className="w-4 h-4" /> Anomalies <span className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 text-xs px-1.5 py-0.5 rounded-full ml-1">2</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'all' && (
          <motion.div key="all" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <ExpenseTable />
          </motion.div>
        )}
        
        {activeTab === 'analytics' && (
          <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">Category Breakdown</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={MOCK_PIE} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {MOCK_PIE.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">Monthly Trend</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_MONTHLY}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
                    <Bar dataKey="amount" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'anomalies' && (
          <motion.div key="anomalies" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 flex gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-900 dark:text-amber-300">Unusual "Software" spend</h4>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">You spent $450 on "AWS" on May 18. This is 200% higher than your average monthly software spend.</p>
                <div className="mt-3 flex gap-2">
                  <button className="text-xs font-medium px-3 py-1.5 bg-amber-200 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 rounded-lg hover:bg-amber-300 transition-colors">Verify</button>
                  <button className="text-xs font-medium px-3 py-1.5 text-amber-700 dark:text-amber-400 hover:bg-amber-200/50 rounded-lg transition-colors">Dismiss</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 m-auto w-full max-w-3xl h-fit max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl z-50 p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6 sticky top-0 bg-white dark:bg-slate-900 pt-2 pb-4 border-b border-slate-100 dark:border-slate-800 z-10">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Expense</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <ExpenseForm onSubmit={(data) => { console.log(data); setIsModalOpen(false); }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpensePage;
