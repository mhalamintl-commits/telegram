import React, { useState } from 'react';
import { X, Mail, Lock, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { User } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, rememberMe: boolean) => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSuccessfullyRegistered, setIsSuccessfullyRegistered] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form validations
    if (!email || !password) {
      setError('Please fill in all credentials fields.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please provide a valid electronic email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!isLoginTab && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLoginTab ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server authorization failed');
      }

      if (!isLoginTab) {
        setIsSuccessfullyRegistered(true);
        setTimeout(() => {
          setIsLoginTab(true);
          setIsSuccessfullyRegistered(false);
          setPassword('');
          setConfirmPassword('');
        }, 1500);
      } else {
        onSuccess(data.user, rememberMe);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Error executing credential operation');
    } finally {
      setLoading(false);
    }
  };

  const autofillAdmin = () => {
    setEmail('admin@teleflow.com');
    setPassword('adminpassword');
    setIsLoginTab(true);
    setError(null);
  };

  const autofillUser = () => {
    setEmail('user@teleflow.com');
    setPassword('password123');
    setIsLoginTab(true);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-[#06070a] opacity-80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal element */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#1e2230] bg-[#0d0e12] p-6 shadow-2xl md:p-8">
        
        {/* Top glow */}
        <div className="absolute -top-24 -left-20 h-48 w-48 rounded-full bg-indigo-500 opacity-20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 h-48 w-48 rounded-full bg-violet-500 opacity-20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="close_auth_modal"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-gray-400 hover:bg-[#1a1c24] hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20">
            <svg className="h-7 w-7 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {isLoginTab ? 'Welcome to TeleFlow' : 'Create Account'}
          </h2>
          <p className="mt-1 text-xs text-gray-400">
            {isLoginTab ? '24/7 autonomous Post forwarding system.' : 'Register and create routing forwarder rules in seconds.'}
          </p>
        </div>

        {/* Tabs switcher */}
        <div className="mb-6 flex rounded-lg bg-[#14161f] p-1 border border-[#1e2230]">
          <button
            id="tab_login_select"
            type="button"
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
              isLoginTab 
                ? 'bg-[#1e2230] text-white shadow' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => { setIsLoginTab(true); setError(null); }}
          >
            Sign In
          </button>
          <button
            id="tab_register_select"
            type="button"
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
              !isLoginTab 
                ? 'bg-[#1e2230] text-white shadow' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => { setIsLoginTab(false); setError(null); }}
          >
            Sign Up
          </button>
        </div>

        {/* Auto fills badge bar */}
        <div className="mb-4 flex flex-wrap gap-2 justify-center text-[11px] text-gray-400">
          <span>Sandbox Logins:</span>
          <button
            id="btn_autofill_admin"
            onClick={autofillAdmin}
            className="rounded border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-yellow-400 hover:bg-yellow-500/20 transition-all font-mono"
          >
            Admin (100% Free Acc)
          </button>
          <button
            id="btn_autofill_user"
            onClick={autofillUser}
            className="rounded border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-indigo-400 hover:bg-indigo-500/20 transition-all font-mono"
          >
            Regular User
          </button>
        </div>

        {/* Form Body */}
        {isSuccessfullyRegistered ? (
          <div className="my-8 text-center py-6 text-green-400">
            <CheckCircle className="mx-auto h-12 w-12 mb-3 text-green-500 animate-bounce" />
            <p className="font-semibold text-sm">Account Created Successfully!</p>
            <p className="text-xs text-gray-400 mt-1">Redirecting you to the sign in interface...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-500" />
                <input
                  id="auth_email_input"
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full rounded-lg border border-[#1e2230] bg-[#14161f] py-2 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-500" />
                <input
                  id="auth_password_input"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[#1e2230] bg-[#14161f] py-2 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {!isLoginTab && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-500" />
                  <input
                    id="auth_confirmpwd_input"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-[#1e2230] bg-[#14161f] py-2 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            {isLoginTab && (
              <div className="flex items-center">
                <input
                  id="remember_me_checkbox"
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#1e2230] bg-[#14161f] text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember_me_checkbox" className="ml-2 block text-[11px] text-gray-400 cursor-pointer">
                  Remember my session
                </label>
              </div>
            )}

            {/* Error notifications */}
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-xs animate-shake">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit buttons */}
            <button
              id="submit_auth_form"
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-white py-2.5 text-xs shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>{isLoginTab ? 'Sign In Securely' : 'Complete Account Registration'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Legal policy disclaimer */}
        <p className="mt-6 text-center text-[10px] text-gray-500">
          By continuing, you agree with TeleFlow terms on autonomous automated user API listeners. No spam forwarding permitted.
        </p>
      </div>
    </div>
  );
}
