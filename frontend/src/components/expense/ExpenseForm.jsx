import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Zap, Loader2, Image as ImageIcon } from 'lucide-react';

const CATEGORIES = [
  'Housing', 'Transportation', 'Food', 'Utilities', 
  'Insurance', 'Medical', 'Saving & Debt', 'Personal', 'Entertainment', 'Other'
];

const ExpenseForm = ({ onSubmit, defaultValues = {}, isLoading = false }) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
      vendor: '',
      paymentMethod: 'Credit Card',
      description: '',
      isDeductible: false,
      deductionPercentage: 100,
      tags: '',
      ...defaultValues
    }
  });

  const [receiptFiles, setReceiptFiles] = useState([]);
  const [isCategorizing, setIsCategorizing] = useState(false);

  const isDeductible = watch('isDeductible');

  const onDrop = useCallback(acceptedFiles => {
    setReceiptFiles(acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    })));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1
  });

  const removeFile = (e) => {
    e.stopPropagation();
    setReceiptFiles([]);
  };

  const handleAICategorize = async () => {
    const title = watch('title');
    const vendor = watch('vendor');
    if (!title && !vendor) return;

    setIsCategorizing(true);
    // Simulate API call
    setTimeout(() => {
      const randomCat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      setValue('category', randomCat);
      setIsCategorizing(false);
    }, 1000);
  };

  const submitForm = (data) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
      tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
      receipt: receiptFiles[0] || null
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-6 text-slate-800 dark:text-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Title</label>
          <input
            {...register('title', { required: 'Title is required' })}
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
            placeholder="e.g. Office Supplies"
          />
          {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-2.5 text-slate-400">$</span>
            <input
              type="number"
              step="0.01"
              {...register('amount', { required: 'Amount is required' })}
              className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
              placeholder="0.00"
            />
          </div>
          {errors.amount && <p className="text-red-500 text-xs">{errors.amount.message}</p>}
        </div>

        <div className="space-y-2 relative">
          <label className="block text-sm font-medium">Category</label>
          <div className="flex gap-2">
            <select
              {...register('category', { required: 'Category is required' })}
              className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              type="button"
              onClick={handleAICategorize}
              disabled={isCategorizing || (!watch('title') && !watch('vendor'))}
              className="px-3 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 rounded-lg border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors flex items-center justify-center disabled:opacity-50"
              title="Auto-categorize with AI"
            >
              {isCategorizing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            </button>
          </div>
          {errors.category && <p className="text-red-500 text-xs">{errors.category.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Date</label>
          <input
            type="date"
            {...register('date', { required: 'Date is required' })}
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Vendor</label>
          <input
            {...register('vendor')}
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="e.g. Amazon"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Payment Method</label>
          <select
            {...register('paymentMethod')}
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cash">Cash</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
          placeholder="Optional details..."
        />
      </div>

      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-medium">Tax Deductible</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Mark if this expense can be claimed for tax purposes</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" {...register('isDeductible')} className="sr-only peer" />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <AnimatePresence>
          {isDeductible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2 overflow-hidden"
            >
              <label className="block text-sm font-medium">Deduction Percentage: {watch('deductionPercentage')}%</label>
              <input
                type="range"
                min="0"
                max="100"
                {...register('deductionPercentage')}
                className="w-full accent-indigo-600"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Tags (comma separated)</label>
        <input
          {...register('tags')}
          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="business, travel, meals"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Receipt</label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500'}
          `}
        >
          <input {...getInputProps()} />
          
          {receiptFiles.length > 0 ? (
            <div className="relative inline-block">
              <img
                src={receiptFiles[0].preview}
                alt="Receipt Preview"
                className="h-32 object-cover rounded-lg shadow-sm"
                onLoad={() => URL.revokeObjectURL(receiptFiles[0].preview)}
              />
              <button
                type="button"
                onClick={removeFile}
                className="absolute -top-2 -right-2 p-1 bg-white dark:bg-slate-800 rounded-full shadow-md text-slate-500 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2 text-slate-500 dark:text-slate-400 flex flex-col items-center">
              <Upload className="w-8 h-8 opacity-50" />
              <p className="text-sm">Drag & drop a receipt image here, or click to select</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Expense
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
