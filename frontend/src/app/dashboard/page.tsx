"use client";

import { BarChart3, Users, MessageSquare, Zap } from "lucide-react";

export default function DashboardOverview() {
  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Overview</h1>
        <p className="text-sm text-neutral-400">
          Ringkasan performa AI dan analitik live chat Anda hari ini.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Total Chats</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-1">1,248</p>
          <p className="text-xs text-emerald-400">+12% dari minggu lalu</p>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">AI Resolution Rate</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-1">85.4%</p>
          <p className="text-xs text-emerald-400">+5.2% dari minggu lalu</p>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Active Users</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-1">342</p>
          <p className="text-xs text-emerald-400">Sedang online</p>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Avg Response Time</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-1">0.8s</p>
          <p className="text-xs text-emerald-400">-0.2s dari minggu lalu</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl min-h-[300px] flex flex-col items-center justify-center">
          <BarChart3 className="w-12 h-12 text-neutral-700 mb-4" />
          <p className="text-neutral-500 font-medium">Grafik Aktivitas akan segera hadir (Coming Soon)</p>
        </div>
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4">Aktivitas Terbaru</h3>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
             <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mb-3">
               <span className="text-neutral-500">?</span>
             </div>
             <p className="text-neutral-500 text-sm">Belum ada aktivitas yang tercatat hari ini.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
