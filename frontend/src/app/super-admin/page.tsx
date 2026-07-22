"use client";

import { useState } from 'react';

type Tenant = {
  id: string;
  name: string;
  domain: string;
  status: 'ACTIVE' | 'SUSPENDED';
  plan: 'PRO' | 'ENTERPRISE';
  chatCount: number;
};

export default function SuperAdminPage() {
  const [tenants, setTenants] = useState<Tenant[]>([
    { id: '1', name: 'Acme Corp', domain: 'acme.com', status: 'ACTIVE', plan: 'ENTERPRISE', chatCount: 1450 },
    { id: '2', name: 'TechFlow', domain: 'techflow.io', status: 'ACTIVE', plan: 'PRO', chatCount: 890 },
    { id: '3', name: 'Lost Shop', domain: 'lostshop.net', status: 'SUSPENDED', plan: 'PRO', chatCount: 12 },
  ]);

  const toggleStatus = (id: string) => {
    setTenants(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' };
      }
      return t;
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      {/* Background Effect */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-neutral-950 to-neutral-950 -z-10" />
      
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Super Admin Control Panel
            </h1>
            <p className="text-neutral-400 mt-2">Manage your SaaS platform, clients (tenants), and system health.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 text-center backdrop-blur-md">
              <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Total ARR</p>
              <p className="text-xl font-bold text-emerald-400">$12,450</p>
            </div>
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 text-center backdrop-blur-md">
              <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Active Clients</p>
              <p className="text-xl font-bold text-blue-400">{tenants.filter(t => t.status === 'ACTIVE').length}</p>
            </div>
          </div>
        </header>

        {/* Tenants Table */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Registered Tenants</h2>
            <input 
              type="text" 
              placeholder="Search clients..." 
              className="bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-sm w-64"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 text-sm">
                  <th className="px-6 py-4 font-medium">Company Name</th>
                  <th className="px-6 py-4 font-medium">Domain</th>
                  <th className="px-6 py-4 font-medium">Subscription Plan</th>
                  <th className="px-6 py-4 font-medium">Messages Handled</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {tenants.map(tenant => (
                  <tr key={tenant.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{tenant.name}</td>
                    <td className="px-6 py-4 text-neutral-400">{tenant.domain}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded border ${tenant.plan === 'ENTERPRISE' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                        {tenant.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">{tenant.chatCount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1.5 w-max ${tenant.status === 'ACTIVE' ? 'text-emerald-400' : 'text-red-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${tenant.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => toggleStatus(tenant.id)}
                        className={`text-sm px-3 py-1.5 rounded transition-colors ${tenant.status === 'ACTIVE' ? 'text-red-400 hover:bg-red-400/10' : 'text-emerald-400 hover:bg-emerald-400/10'}`}
                      >
                        {tenant.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
