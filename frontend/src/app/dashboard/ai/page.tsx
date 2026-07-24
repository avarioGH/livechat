"use client";

import Link from "next/link";
import { Plus, Bot, Settings2, Trash2 } from "lucide-react";

export default function AIEmployeesPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">AI Employees</h1>
          <p className="text-sm text-neutral-400">
            Kelola staf virtual Anda yang siap melayani pelanggan 24/7 tanpa henti.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20">
          <Plus className="w-4 h-4" />
          Hire New AI
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Existing AI Card */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl flex flex-col hover:border-neutral-700 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">sarah</h2>
                <p className="text-sm font-medium text-indigo-400">customer service</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">ONLINE</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          <div className="text-xs font-semibold text-neutral-500 mb-4 tracking-wider">AI PROFILE</div>
          
          <div className="space-y-3 mb-6 flex-1">
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-400">Gaya Komunikasi</span>
              <span className="font-medium text-white">Warm & Approachable</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-400">Akses Knowledge</span>
              <span className="font-medium text-indigo-400">0 Dokumen</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-950/50 border border-neutral-800/50 mb-6">
            <div>
              <div className="text-xs text-neutral-500 flex items-center gap-1 mb-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                CHATS HANDLED
              </div>
              <div className="text-xl font-bold text-white">0</div>
            </div>
            <div>
              <div className="text-xs text-neutral-500 flex items-center gap-1 mb-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                AVG RESPONSE
              </div>
              <div className="text-xl font-bold text-white">-</div>
            </div>
          </div>

          <div className="flex gap-2 mt-auto">
            <Link href="/dashboard/ai/sarah" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-neutral-800 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-colors group">
              <Settings2 className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
              Train AI / Settings
            </Link>
            <button className="p-3 bg-neutral-800 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 border border-transparent hover:border-red-500/30 rounded-xl transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hire New AI Card */}
        <button className="min-h-[320px] bg-neutral-900/20 border border-dashed border-indigo-500/30 rounded-2xl p-6 flex flex-col items-center justify-center hover:bg-indigo-500/5 hover:border-indigo-500/50 transition-all group">
          <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-indigo-500" />
          </div>
          <h3 className="text-lg font-bold text-indigo-400 mb-2">Tambah AI Baru</h3>
          <p className="text-sm text-neutral-500 text-center max-w-[200px]">
            Hire agent virtual baru untuk divisi spesifik di bisnis Anda.
          </p>
        </button>

      </div>
    </div>
  );
}
