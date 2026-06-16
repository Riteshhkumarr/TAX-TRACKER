import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Receipt, PieChart as PieChartIcon, Wallet, ArrowRight, AlertCircle, Clock, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';

const MOCK_AREA_DATA = [
  { name: 'Jan', income: 4000, expense: 2400 },
  { name: 'Feb', income: 3000, expense: 1398 },
  { name: 'Mar', income: 2000, expense: 9800 },
  { name: 'Apr', income: 2780, expense: 3908 },
  { name: 'May', income: 1890, expense: 4800 },
  { name: 'Jun', income: 2390, expense: 3800 },
  { name: 'Jul', income: 3490, expense: 4300 },
];

const MOCK_PIE_DATA = [
  { name: 'Housing', value: 400 },
  { name: 'Food', value: 300 },
  { name: 'Transport', value: 300 },
  { name: 'Utilities', value: 200 },
];
const COLORS = ['#6366F1', '#06B6D4', '#F59E0B', '#10B981'];

const RECENT_TRANSACTIONS = [
  { id: 1, title: 'Client Payment - Acme Corp', amount: 2500, type: 'income', date: 'Today, 2:30 PM' },
  { id: 2, title: 'Office Supplies', amount: -120.5, type: 'expense', date: 'Yesterday, 10:00 AM' },
  { id: 3, title: 'Software Subscription', amount: -49.99, type: 'expense', date: 'May 18, 2026' },
  { id: 4, title: 'Freelance Design Work', amount: 850, type: 'income', date: 'May 15, 2026' },
];

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const CardSkeleton = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse">
      <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-xl mb-4"></div>
      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
      <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
      <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Good morning, Alex!</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here's your financial overview for May 2026.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/income" className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors">
            Add Income
          </Link>
          <Link to="/expense" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm shadow-indigo-500/20">
            Add Expense
          </Link>
        </div>
      </div>

      {/* Tax Deadline Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start sm:items-center gap-4 text-amber-900 dark:text-amber-200"
      >
        <div className="bg-amber-500/20 p-2 rounded-full mt-1 sm:mt-0">
          <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold">Quarterly Estimated Tax Deadline Approaching</h4>
          <p className="text-sm opacity-90 mt-0.5">Q2 payments are due on June 15, 2026 (in 24 days).</p>
        </div>
        <Link to="/tax" className="hidden sm:flex px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
          Calculate Now
        </Link>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <>
            <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
          </>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><DollarSign className="w-24 h-24 text-emerald-500 -mr-8 -mt-8" /></div>
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4"><DollarSign className="w-6 h-6" /></div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Income</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">$45,231.89</h3>
              <div className="flex items-center gap-1 mt-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                <TrendingUp className="w-4 h-4" /> <span>+12.5%</span> <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">vs last month</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Receipt className="w-24 h-24 text-rose-500 -mr-8 -mt-8" /></div>
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center mb-4"><Receipt className="w-6 h-6" /></div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Expenses</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">$12,845.50</h3>
              <div className="flex items-center gap-1 mt-2 text-sm text-rose-600 dark:text-rose-400 font-medium">
                <TrendingUp className="w-4 h-4" /> <span>+4.1%</span> <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">vs last month</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><PieChartIcon className="w-24 h-24 text-amber-500 -mr-8 -mt-8" /></div>
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-4"><PieChartIcon className="w-6 h-6" /></div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Est. Tax Liability</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">$6,470.00</h3>
              <div className="flex items-center gap-1 mt-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="font-medium text-amber-600 dark:text-amber-400">20%</span> effective rate
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Wallet className="w-24 h-24 text-indigo-500 -mr-8 -mt-8" /></div>
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-4"><Wallet className="w-6 h-6" /></div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Net Balance</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">$25,916.39</h3>
              <div className="flex items-center gap-1 mt-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                <TrendingUp className="w-4 h-4" /> <span>+15.2%</span> <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">vs last month</span>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cash Flow Overview</h3>
            <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg px-3 py-1.5 outline-none">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          {isLoading ? (
            <div className="h-[300px] bg-slate-100 dark:bg-slate-800/50 rounded-xl animate-pulse"></div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_AREA_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expense" stroke="#F43F5E" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Financial Health Score */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl shadow-sm p-6 text-white relative overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
          
          <div className="relative z-10 w-full">
            <h3 className="text-lg font-medium text-indigo-100 mb-8">Financial Health Score</h3>
            
            {/* Simple Gauge representation */}
            <div className="relative w-48 h-48 mx-auto mb-6">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                <motion.circle 
                  initial={{ strokeDasharray: "0 283" }}
                  animate={{ strokeDasharray: "237.5 283" }} // 84%
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  cx="50" cy="50" r="45" fill="none" stroke="#4ADE80" strokeWidth="8" strokeLinecap="round" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold">84</span>
                <span className="text-sm font-medium text-indigo-200 mt-1">Excellent</span>
              </div>
            </div>
            
            <p className="text-sm text-indigo-100 leading-relaxed px-4">
              Your savings rate is in the top 15% of similar profiles. Keep tracking deductions to optimize taxes!
            </p>
          </div>
        </div>
      </div>

      {/* Row 3: Pie Chart & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Expenses by Category</h3>
          {isLoading ? (
            <div className="h-[250px] bg-slate-100 dark:bg-slate-800/50 rounded-xl animate-pulse"></div>
          ) : (
            <>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={MOCK_PIE_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {MOCK_PIE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {MOCK_PIE_DATA.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">{item.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
            <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">View All</button>
          </div>
          
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="space-y-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                    <div className="flex-1 space-y-2"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div><div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div></div>
                    <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                {RECENT_TRANSACTIONS.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600'}`}>
                        {tx.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{tx.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{tx.date}</p>
                      </div>
                    </div>
                    <div className={`font-semibold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                      {tx.type === 'income' ? '+' : ''}{tx.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 4: AI Insights */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-indigo-500" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Assistant Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-500/20">
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Tax Optimization</h4>
            <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-4">You have $1,200 in uncategorized expenses that could be deductible. Would you like me to categorize them?</p>
            <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:gap-2 transition-all">Review expenses <ArrowRight className="w-4 h-4" /></button>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-500/20">
            <h4 className="font-semibold text-emerald-900 dark:text-emerald-300 mb-2">Spending Pattern</h4>
            <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-4">Your software subscriptions have increased by 15% this quarter. Consider reviewing unused tools.</p>
            <button className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:gap-2 transition-all">View subscriptions <ArrowRight className="w-4 h-4" /></button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-amber-50 dark:bg-amber-500/10 rounded-2xl p-5 border border-amber-100 dark:border-amber-500/20">
            <h4 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">Anomaly Detected</h4>
            <p className="text-sm text-amber-700 dark:text-amber-400 mb-4">Unusually high charge ($450) from "AWS Services". Is this expected for your current usage?</p>
            <button className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:gap-2 transition-all">Verify charge <ArrowRight className="w-4 h-4" /></button>
          </motion.div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
