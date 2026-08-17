"use client";

import { useState, useEffect } from 'react';

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState<'FREE' | 'PRO' | 'ENTERPRISE'>('FREE');
  const [nextBillingDate, setNextBillingDate] = useState<string | null>(null);
  const [aiWallet, setAiWallet] = useState<{ balance: number, totalUsed: number }>({ balance: 0, totalUsed: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    // In a real app, tenantId is derived from auth context
    const tenantId = 'test-tenant-id';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/api/billing?organizationId=${tenantId}`)
      .then(res => res.json())
      .then(data => {
        if (data.plan) setCurrentPlan(data.plan);
        if (data.nextBillingDate) setNextBillingDate(new Date(data.nextBillingDate).toLocaleDateString());
        if (data.aiWallet) setAiWallet(data.aiWallet);
      })
      .catch(err => console.error('Failed to fetch billing:', err))
      .finally(() => setIsFetching(false));
  }, []);

  const handleCheckout = async (plan: string) => {
    setIsLoading(true);
    try {
      // In a real app, tenantId is derived from auth context
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/billing/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: 'test-tenant-id', plan })
      });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      }
    } catch (error) {
      console.error(error);
      alert('Checkout failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          Billing & Subscription
        </h1>
        <p className="text-neutral-400 mt-2">
          Manage your subscription plan, payment methods, and billing history.
        </p>
      </div>

      {/* Current Plan Status */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-400 font-medium uppercase tracking-wider mb-1">Current Plan</p>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">{currentPlan}</h2>
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full">
              ACTIVE
            </span>
          </div>
          {nextBillingDate && (
            <p className="text-sm text-neutral-500 mt-2">Your next billing cycle is on {nextBillingDate}.</p>
          )}
        </div>
        <div>
          <button className="px-4 py-2 border border-neutral-700 hover:bg-neutral-800 rounded-lg text-sm transition-colors">
            Manage Billing Settings
          </button>
        </div>
      </div>

      {/* AI Token Wallet */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-400 font-medium uppercase tracking-wider mb-1">AI Credits (Tokens)</p>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">{aiWallet.balance.toLocaleString()} <span className="text-sm font-normal text-neutral-500">Available</span></h2>
          </div>
          <p className="text-sm text-neutral-500 mt-2">Total Used: {aiWallet.totalUsed.toLocaleString()} tokens</p>
        </div>
        <div>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition-colors shadow-lg shadow-indigo-500/20">
            Recharge Credits
          </button>
        </div>
      </div>

      {/* Pricing Plans */}
      <h3 className="text-xl font-semibold mb-6">Upgrade your plan</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pro Plan */}
        <div className="bg-neutral-900/40 border border-neutral-800 hover:border-indigo-500/50 transition-colors rounded-2xl p-8 flex flex-col">
          <h4 className="text-xl font-bold text-white mb-2">Pro Plan</h4>
          <div className="flex items-end gap-1 mb-6">
            <span className="text-4xl font-bold">$49</span>
            <span className="text-neutral-500 mb-1">/month</span>
          </div>
          <ul className="space-y-3 mb-8 flex-1 text-sm text-neutral-300">
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Up to 5,000 AI Chats / mo
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              GPT-4o & Gemini Flash Support
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Knowledge Base Integration (RAG)
            </li>
          </ul>
          <button 
            onClick={() => handleCheckout('PRO')}
            disabled={isLoading || currentPlan === 'PRO'}
            className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-semibold rounded-xl transition-colors"
          >
            {currentPlan === 'PRO' ? 'Current Plan' : 'Upgrade to Pro'}
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-gradient-to-b from-indigo-900/30 to-neutral-900/40 border border-indigo-500/30 hover:border-indigo-400 transition-colors rounded-2xl p-8 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
            Most Popular
          </div>
          <h4 className="text-xl font-bold text-white mb-2">Enterprise Plan</h4>
          <div className="flex items-end gap-1 mb-6">
            <span className="text-4xl font-bold">$199</span>
            <span className="text-neutral-500 mb-1">/month</span>
          </div>
          <ul className="space-y-3 mb-8 flex-1 text-sm text-neutral-300">
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Unlimited AI Chats
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Custom AI Persona Fine-Tuning
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              White-label Widget
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              24/7 Priority Support
            </li>
          </ul>
          <button 
            onClick={() => handleCheckout('ENTERPRISE')}
            disabled={isLoading || currentPlan === 'ENTERPRISE'}
            className="w-full py-3 bg-white text-indigo-600 hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 font-semibold rounded-xl transition-colors"
          >
            {currentPlan === 'ENTERPRISE' ? 'Current Plan' : 'Upgrade to Enterprise'}
          </button>
        </div>

      </div>

      {isFetching && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 backdrop-blur-sm rounded-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
    </div>
  );
}
