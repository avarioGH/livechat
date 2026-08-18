"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { name: 'Inbox & Live Chat', href: '/dashboard/inbox', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { name: 'AI Employees / Training', href: '/dashboard/ai', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { name: 'Knowledge Base', href: '/dashboard/knowledge-base', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4' },
    { name: 'Team Settings', href: '/dashboard/team', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { name: 'Billing & Plan', href: '/dashboard/billing', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  ];

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-neutral-100 font-sans selection:bg-indigo-500/30">
      {/* Dynamic Background Glow */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[120px]" />
      </div>

      {/* Sidebar */}
      <aside className="w-[280px] bg-[#0F0F11]/80 backdrop-blur-2xl border-r border-white/[0.05] flex flex-col z-10 shadow-2xl relative">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
              Avario
            </h1>
          </div>
        </div>
        
        <div className="px-6 py-2">
           <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">Menu</div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 relative group overflow-hidden ${
                  isActive 
                    ? 'text-white bg-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] ring-1 ring-white/[0.05]' 
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                )}
                <svg className={`w-4.5 h-4.5 transition-colors ${isActive ? 'text-indigo-400' : 'text-neutral-500 group-hover:text-neutral-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                </svg>
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
          
          <div className="pt-6 mt-4">
            <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 px-2">External</div>
            <Link href="/widget/demo-site-id" target="_blank" className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 transition-all duration-300 text-indigo-300 hover:text-indigo-200 ring-1 ring-indigo-500/20 group">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              <span className="text-sm font-medium">Customer Livechat</span>
              <svg className="w-3.5 h-3.5 ml-auto opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </Link>
          </div>
        </nav>

        <div className="p-4 m-4 relative group">
          <button className="w-full rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.1] backdrop-blur-md p-3 transition-all flex items-center justify-between group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
                  AD
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#121214]"></div>
              </div>
              <div className="flex-1 overflow-hidden text-left">
                <p className="text-sm font-semibold text-white truncate">Admin User</p>
                <p className="text-[11px] text-neutral-400 truncate">Acme Corporation</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
          </button>
          
          {/* Hover Menu (Appears on hover for smooth UI) */}
          <div className="absolute bottom-[calc(100%-10px)] left-4 right-4 bg-[#1a1a1f] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 z-50">
            <div className="p-1.5">
              <button className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                Profile Settings
              </button>
              <div className="h-px w-full bg-white/[0.05] my-1"></div>
              <button className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-7xl mx-auto w-full h-full">
           {children}
        </div>
      </main>
    </div>
  );
}
