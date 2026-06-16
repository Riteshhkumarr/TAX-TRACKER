import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight, Wallet, CheckCircle2, Shield, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  const password = watch('password', '');
  
  // Basic password strength logic
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length > 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthColors = ['bg-slate-200 dark:bg-slate-700', 'bg-red-500', 'bg-amber-500', 'bg-emerald-400', 'bg-emerald-600'];
  const strengthText = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password, taxBracket: data.taxBracket || 22 });
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      const message = error?.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Brand Panel (Left) */}
      <div className="hidden lg:flex w-1/2 bg-indigo-600 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-indigo-500/50 blur-[120px]" />
          <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-cyan-400/30 blur-[120px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <Wallet className="w-8 h-8" />
            <span className="text-2xl font-bold tracking-tight">TaxTracker AI</span>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6 max-w-lg"
          >
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Start maximizing your tax returns today.
            </h1>
            <p className="text-indigo-100 text-lg opacity-90">
              Create an account in less than 2 minutes and let AI handle the heavy lifting of categorizing expenses and finding deductions.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 space-y-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 w-max border border-white/20">
            <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-300">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium text-white">AI-Powered Deductions</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 w-max border border-white/20">
            <div className="bg-cyan-500/20 p-2 rounded-full text-cyan-300">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium text-white">Real-time Analytics</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Form Panel (Right) */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 overflow-y-auto">
        <div className="lg:hidden flex items-center gap-2 mb-10 text-indigo-600 dark:text-indigo-400">
          <Wallet className="w-8 h-8" />
          <span className="text-2xl font-bold tracking-tight">TaxTracker AI</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto space-y-8"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
            <p className="text-slate-500 dark:text-slate-400">Start your journey to financial clarity.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                placeholder="John Doe"
              />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <input
                type="email"
                {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
              
              {/* Password Strength */}
              {password && (
                <div className="pt-1 space-y-1.5">
                  <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden">
                    {[1, 2, 3, 4].map(level => (
                      <div key={level} className={`flex-1 ${level <= strength ? strengthColors[strength] : strengthColors[0]} transition-colors duration-300`} />
                    ))}
                  </div>
                  <p className={`text-xs text-right font-medium ${strength > 2 ? 'text-emerald-500' : 'text-slate-500'}`}>
                    {strengthText[strength]}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <input
                type="password"
                {...register('confirmPassword', { 
                  required: 'Please confirm password',
                  validate: val => val === password || 'Passwords do not match'
                })}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tax Bracket (Optional)</label>
              <select
                {...register('taxBracket')}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
              >
                <option value="">Select an estimated bracket</option>
                <option value="10">10% ($0 - $11,000)</option>
                <option value="12">12% ($11,001 - $44,725)</option>
                <option value="22">22% ($44,726 - $95,375)</option>
                <option value="24">24% ($95,376 - $182,100)</option>
                <option value="32">32% ($182,101 - $231,250)</option>
                <option value="35">35% ($231,251 - $578,125)</option>
                <option value="37">37% ($578,126+)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 group disabled:opacity-70 mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
