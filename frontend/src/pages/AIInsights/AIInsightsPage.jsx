import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Target, Shield, MessageSquare, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PRED_DATA = [
  { name: 'Q1', actual: 4000, predicted: 4100 },
  { name: 'Q2 (Current)', actual: 2500, predicted: 3800 },
  { name: 'Q3', actual: null, predicted: 4200 },
  { name: 'Q4', actual: null, predicted: 4500 },
];

const AIInsightsPage = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header with Health Score */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 text-cyan-300" /> AI Analysis Complete
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">Your financial health is looking strong.</h1>
            <p className="text-indigo-100 text-lg">We've analyzed your recent transactions and found 3 new opportunities to optimize your tax liability.</p>
          </div>
          
          <div className="flex-shrink-0 relative">
            <svg viewBox="0 0 120 120" className="w-40 h-40 transform -rotate-90 filter drop-shadow-lg">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
              <motion.circle 
                initial={{ strokeDasharray: "0 339" }}
                animate={{ strokeDasharray: "288 339" }} // 85%
                transition={{ duration: 2, ease: "easeOut" }}
                cx="60" cy="60" r="54" fill="none" stroke="#22d3ee" strokeWidth="12" strokeLinecap="round" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold">85</span>
              <span className="text-xs font-medium text-cyan-200 mt-1 uppercase tracking-wider">Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Shield className="w-6 h-6" /></div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Tax Optimization</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 leading-relaxed">Consider shifting $2,000 of planned Q4 equipment purchases to Q3 to offset higher expected income.</p>
          <button className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all">Review plan <ArrowRight className="w-4 h-4" /></button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><AlertTriangle className="w-6 h-6" /></div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Spending Anomalies</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 leading-relaxed">We detected 2 unusually large transactions in 'Marketing' this month that deviate from your normal pattern.</p>
          <button className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:gap-2 transition-all">View anomalies <ArrowRight className="w-4 h-4" /></button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Target className="w-6 h-6" /></div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Smart Budgeting</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 leading-relaxed">You are on track to save 15% more than last quarter. Keep dining expenses under $400 this month to hit your goal.</p>
          <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:gap-2 transition-all">Set budget <ArrowRight className="w-4 h-4" /></button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prediction Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tax Liability Prediction</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Actual vs AI Forecast</p>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-indigo-600"></div> Actual</span>
              <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-cyan-400"></div> Predicted</span>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PRED_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
                <Bar dataKey="actual" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Bar dataKey="predicted" fill="#22d3ee" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ChatBot Mock */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
          <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white"><Sparkles className="w-5 h-5" /></div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">TaxTracker AI</h4>
              <p className="text-xs text-emerald-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Online</p>
            </div>
          </div>
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white flex-shrink-0"><Sparkles className="w-4 h-4" /></div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                Hi Alex! I noticed you recently bought a laptop. Did you know you might be able to fully deduct it this year under Section 179?
              </div>
            </div>
            <div className="flex gap-3 flex-row-reverse">
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex-shrink-0"></div>
              <div className="bg-indigo-600 p-3 rounded-2xl rounded-tr-none text-sm text-white">
                Really? How does that work?
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white flex-shrink-0"><Sparkles className="w-4 h-4" /></div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                Section 179 allows you to deduct the full purchase price of qualifying equipment in the year it's put into service, rather than depreciating it over time. I can flag this transaction for you!
              </div>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="relative">
              <input type="text" placeholder="Ask AI a tax question..." className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button className="absolute right-2 top-2 p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg"><MessageSquare className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsPage;
