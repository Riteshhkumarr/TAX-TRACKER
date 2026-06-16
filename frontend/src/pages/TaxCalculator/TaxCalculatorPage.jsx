import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Calendar as CalendarIcon, Info, TrendingDown, Clock, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const BRACKET_DATA = [
  { name: '10%', range: '$0 - $11,600', max: 1160, fill: '#6366F1' },
  { name: '12%', range: '$11,601 - $47,150', max: 4266, fill: '#8B5CF6' },
  { name: '22%', range: '$47,151 - $100,525', max: 11742, fill: '#EC4899' },
  { name: '24%', range: '$100,526 - $191,950', max: 21942, fill: '#F43F5E' },
];

const TaxCalculatorPage = () => {
  const [income, setIncome] = useState(85000);
  const [deductions, setDeductions] = useState(14600); // Standard deduction

  // Mock calculation
  const taxableIncome = Math.max(0, income - deductions);
  const effectiveRate = 14.5;
  const marginalRate = 22;
  const estimatedTax = 12325;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Tax Calculator 2024</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time estimations based on IRS tax brackets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Financial Details</h3>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Filing Status</label>
                <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option>Single</option>
                  <option>Married Filing Jointly</option>
                  <option>Head of Household</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Estimated Gross Income</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-400">$</span>
                  <input 
                    type="number" 
                    value={income}
                    onChange={(e) => setIncome(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Deductions</label>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer hover:underline">Use Itemized</span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-400">$</span>
                  <input 
                    type="number" 
                    value={deductions}
                    onChange={(e) => setDeductions(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> Applying 2024 Standard Deduction
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Calculator className="w-32 h-32 -mr-10 -mt-10" /></div>
            <div className="relative z-10">
              <p className="text-indigo-100 font-medium mb-1">Estimated Tax Liability</p>
              <h2 className="text-4xl font-bold mb-4">${estimatedTax.toLocaleString()}</h2>
              
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-indigo-400/30">
                <div>
                  <p className="text-xs text-indigo-200 mb-1">Effective Rate <Info className="w-3 h-3 inline ml-1 opacity-50" /></p>
                  <p className="text-xl font-bold">{effectiveRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-indigo-200 mb-1">Marginal Rate <Info className="w-3 h-3 inline ml-1 opacity-50" /></p>
                  <p className="text-xl font-bold">{marginalRate}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts & Details Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Tax Bracket Breakdown (2024)</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={BRACKET_DATA} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600 }} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
                  <Bar dataKey="max" radius={[0, 4, 4, 0]} barSize={24}>
                    {BRACKET_DATA.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
               {BRACKET_DATA.map((b, i) => (
                 <div key={i} className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                   <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{b.name}</p>
                   <p className="text-[10px] text-slate-500 mt-1">{b.range}</p>
                 </div>
               ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-500" /> Quarterly Payments Schedule
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { q: 'Q1', due: 'April 15', amount: estimatedTax/4, status: 'paid' },
                { q: 'Q2', due: 'June 15', amount: estimatedTax/4, status: 'upcoming' },
                { q: 'Q3', due: 'Sept 15', amount: estimatedTax/4, status: 'pending' },
                { q: 'Q4', due: 'Jan 15', amount: estimatedTax/4, status: 'pending' },
              ].map((quarter, i) => (
                <div key={i} className={`p-4 rounded-xl border ${quarter.status === 'upcoming' ? 'border-amber-400 bg-amber-50 dark:bg-amber-500/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-900 dark:text-white">{quarter.q}</span>
                    {quarter.status === 'paid' && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                    {quarter.status === 'upcoming' && <Clock className="w-4 h-4 text-amber-500 animate-pulse" />}
                  </div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white my-1">${quarter.amount.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Due: {quarter.due}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxCalculatorPage;
