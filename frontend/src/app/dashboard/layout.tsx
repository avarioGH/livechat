"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview', href: '/dashboard' },
    { name: 'Inbox & Live Chat', href: '/dashboard/inbox' },
    { name: 'AI Employees / Training', href: '/dashboard/ai' },
    { name: 'Knowledge Base', href: '/dashboard/knowledge-base' },
    { name: 'Team Settings', href: '/dashboard/team' },
    { name: 'Billing & Plan', href: '/dashboard/billing' },
  ];

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Avario LiveChat
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                    : 'hover:bg-neutral-800 text-neutral-400 hover:text-white border border-transparent'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          
          <div className="pt-4 mt-4 border-t border-neutral-800">
            {/* The widget preview URL uses a dummy siteId for now */}
            <Link href="/widget/demo-site-id" target="_blank" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-neutral-300 hover:text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              Customer Livechat
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center font-semibold text-indigo-400">
              AD
            </div>
            <div>
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-neutral-500">Acme Corp</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-neutral-950 to-neutral-950 -z-10" />
        {children}
      </main>
    </div>
  );
}
