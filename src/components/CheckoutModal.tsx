import React, { useState } from 'react';
import { ShieldCheck, CreditCard, Lock, Loader2, DollarSign, X } from 'lucide-react';

interface CheckoutModalProps {
  invoiceId: string;
  amount: number;
  planId: string;
  paymentUrl: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckoutModal({ invoiceId, amount, planId, paymentUrl, onClose, onSuccess }: CheckoutModalProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    setProcessing(true);
    setError('');
    
    try {
      // Simulate connection latency before redirecting
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Securely redirect to DorjiPay gateway checkout page
      window.location.href = paymentUrl;
    } catch (err: any) {
      setError(err.message || 'Payment redirection failed. Try again.');
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 font-sans backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#1e2230] bg-[#0d0e12] shadow-2xl">
        <div className="absolute top-0 right-0 p-3">
          <button onClick={onClose} disabled={processing} className="rounded-lg p-1.5 text-gray-500 hover:bg-[#1e2230] hover:text-white transition-colors cursor-pointer disabled:opacity-50">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="bg-[#14161f] px-6 py-8 text-center border-b border-[#1e2230]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10 mb-4 ring-4 ring-[#0d0e12]">
            <ShieldCheck className="h-7 w-7 text-indigo-400" />
          </div>
          <h2 className="text-xl font-extrabold text-white">DorjiPay</h2>
          <p className="text-xs text-gray-400 mt-1 max-w-[200px] mx-auto leading-relaxed">Integrated Bhutan Regional Node <br/>256-bit encrypted handshake</p>
        </div>
        
        <div className="p-6">
          <div className="rounded-xl bg-[#14161f] border border-[#1e2230] p-4 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Subscription Plan</span>
              <span className="font-bold text-white">{planId}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Order ID</span>
              <span className="font-mono text-xs text-gray-500">{invoiceId}</span>
            </div>
            <div className="border-t border-[#1e2230] my-3"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-300">Total Charged</span>
              <div className="flex items-center text-white">
                <DollarSign className="h-4 w-4 text-indigo-400" />
                <span className="text-2xl font-extrabold">{amount}.00</span>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center text-xs font-semibold text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handlePay}
              disabled={processing}
              className="relative w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow hover:bg-indigo-500 transition-colors cursor-pointer overflow-hidden disabled:opacity-75 disabled:cursor-not-allowed group"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Processing Secure Handshake...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Lock className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                  Confirm & Pay Securely
                </span>
              )}
              
              {/* Highlight sweep animation */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
            </button>
            <p className="text-center text-[10px] text-gray-500 font-medium">
              By confirming, you agree to Dorji Payments Terms of Service and Privacy Directive.
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
