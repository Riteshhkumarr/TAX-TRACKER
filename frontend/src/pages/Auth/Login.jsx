import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight, Wallet, CheckCircle2, Shield, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error) {
      const message = error?.response?.data?.message || 'Invalid email or password.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Brand Panel (Left) */}
      <div className="hidden lg:flex w-1/2 bg-indigo-600 relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Background Gradients */}
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
              Master your finances with intelligent tax insights.
            </h1>
            <p className="text-indigo-100 text-lg opacity-90">
              Join thousands of freelancers and small businesses optimizing their tax deductions and financial health automatically.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 w-max border border-white/20"
          >
            <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-300">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium text-white">AI-Powered Deductions</p>
              <p className="text-sm text-indigo-200">Maximize your tax savings</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 w-max border border-white/20"
          >
            <div className="bg-cyan-500/20 p-2 rounded-full text-cyan-300">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium text-white">Real-time Analytics</p>
              <p className="text-sm text-indigo-200">Track financial health instantly</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 w-max border border-white/20"
          >
            <div className="bg-purple-500/20 p-2 rounded-full text-purple-300">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium text-white">Bank-grade Security</p>
              <p className="text-sm text-indigo-200">Your data is encrypted & safe</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Form Panel (Right) */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
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
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-slate-500 dark:text-slate-400">Enter your details to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Password</label>
                <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                {...register('password', { required: 'Password is required' })}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                {...register('remember')}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-slate-600 dark:text-slate-400">
                Remember me for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
