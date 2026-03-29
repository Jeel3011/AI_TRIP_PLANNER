import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Loader2, Mail, Lock, LogIn, UserPlus, Globe } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Check your email to verify your account!');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
      {/* Background shadow overlay - Light mode subtle tint */}
      <div className="absolute inset-0 bg-amber-50/20 backdrop-blur-sm z-0"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md backdrop-blur-xl bg-white/70 border border-amber-200/60 rounded-3xl shadow-2xl overflow-hidden p-8"
      >
        <div className="text-center mb-8">
          <div className="mx-auto bg-amber-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-orange-500 shadow-sm border border-amber-200">
            <Globe className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            {isLogin ? 'Welcome Back' : 'Join the Journey'}
          </h2>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            {isLogin ? 'Sign in to access your travel planner.' : 'Create an account to save your itineraries.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {/* Email input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/50 border border-amber-200 focus:border-orange-400 rounded-xl py-3 pl-11 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all shadow-inner"
                placeholder="nomad@example.com"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/50 border border-amber-200 focus:border-orange-400 rounded-xl py-3 pl-11 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all shadow-inner"
                placeholder="••••••••"
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-200 text-center">
                {error}
              </motion.div>
            )}
            {message && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-emerald-700 text-sm bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 rounded-xl text-white font-semibold tracking-wide shadow-md shadow-orange-500/30 flex justify-center items-center gap-2 transition-all hover:-translate-y-0.5"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isLogin ? (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Sign Up
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-slate-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </span>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-orange-500 font-semibold hover:text-orange-600 hover:underline transition-colors"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
