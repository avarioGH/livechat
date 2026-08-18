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



      {isFetching && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 backdrop-blur-sm rounded-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
    </div>
  );
}
