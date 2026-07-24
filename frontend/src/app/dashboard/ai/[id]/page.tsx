"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Save, Bot, MessageSquarePlus, Sparkles, X } from "lucide-react";
import ChatTester from "@/components/ChatTester";

export default function AITrainingPage({ params }: { params: { id: string } }) {
  const [isTesterOpen, setIsTesterOpen] = useState(false);

  return (
    <div className="flex h-full bg-[#0a0a0b]">
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isTesterOpen ? 'mr-96' : ''} overflow-y-auto`}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex justify-between items-center px-8 py-5 border-b border-neutral-800 bg-[#0a0a0b]/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/ai" className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">{params.id === 'sarah' ? 'sarah' : 'New Agent'}</h1>
                <p className="text-xs font-medium text-indigo-400">Konfigurasi Lanjutan</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsTesterOpen(!isTesterOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium rounded-lg transition-colors border border-neutral-700"
            >
              <MessageSquarePlus className="w-4 h-4" />
              Test Chatbot
            </button>
            <button className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20">
              <Save className="w-4 h-4" />
              Simpan Perubahan
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8">
          {/* Left Column: Identity & Style */}
          <div className="flex-1 space-y-6">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-neutral-400 tracking-wider mb-6">IDENTITY & STYLE</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Agent Name</label>
                  <input type="text" defaultValue="sarah" className="w-full bg-transparent border-b border-neutral-800 pb-2 text-white font-medium focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Agent Role</label>
                  <input type="text" defaultValue="customer service" className="w-full bg-transparent border-b border-neutral-800 pb-2 text-white font-medium focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Language</label>
                  <input type="text" defaultValue="Indonesian" className="w-full bg-transparent border-b border-neutral-800 pb-2 text-white font-medium focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Communication Style</label>
                  <input type="text" defaultValue="Friendly, helpful, professional" className="w-full bg-transparent border-b border-neutral-800 pb-2 text-white font-medium focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Tone</label>
                  <input type="text" defaultValue="Warm & Approachable" className="w-full bg-transparent border-b border-neutral-800 pb-2 text-white font-medium focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Address User with</label>
                  <input type="text" defaultValue="Kak" className="w-full bg-transparent border-b border-neutral-800 pb-2 text-white font-medium focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Allowed Emojis</label>
                  <input type="text" defaultValue="😊 👍 🙏" className="w-full bg-transparent border-b border-neutral-800 pb-2 text-white font-medium focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Disallowed Emojis</label>
                  <input type="text" defaultValue="😡 💩" className="w-full bg-transparent border-b border-neutral-800 pb-2 text-white font-medium focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Date Format</label>
                  <input type="text" defaultValue="DD MMM YYYY" className="w-full bg-transparent border-b border-neutral-800 pb-2 text-white font-medium focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Number Format</label>
                  <input type="text" defaultValue="Rp #.###" className="w-full bg-transparent border-b border-neutral-800 pb-2 text-white font-medium focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-2">Instructions</label>
                <textarea 
                  rows={4}
                  placeholder="Contoh: Jawab to the point. Jangan mengulang info yang sama..."
                  className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold text-neutral-400 tracking-wider">ALUR PERCAKAPAN (SOP)</h2>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 text-xs font-bold rounded-lg border border-fuchsia-500/20 transition-colors">
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate dengan AI
                </button>
              </div>
              <div className="text-center p-8 border border-dashed border-neutral-800 rounded-xl bg-neutral-950/30">
                <p className="text-sm text-neutral-500">Belum ada SOP. Tambahkan alur langkah demi langkah agar AI tahu apa yang harus ditanyakan secara berurutan.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Knowledge Base */}
          <div className="w-full lg:w-80">
            <div className="bg-[#051114] border border-emerald-900/30 rounded-2xl p-6 sticky top-24">
              <h2 className="text-emerald-400 font-bold mb-4">Knowledge Base</h2>
              <div className="border border-dashed border-emerald-900/50 rounded-xl p-4 text-center bg-emerald-950/10">
                <p className="text-sm text-emerald-600/80">Belum ada dokumen. Silakan tambah di menu Knowledge Base.</p>
              </div>
              <Link href="/dashboard/knowledge-base" className="block text-center mt-4 text-xs font-medium text-emerald-500 hover:text-emerald-400 transition-colors">
                Kelola Knowledge Base &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-out Tester Drawer */}
      <div className={`fixed top-0 right-0 w-96 h-full bg-neutral-900 border-l border-neutral-800 shadow-2xl transform transition-transform duration-300 z-50 flex flex-col ${isTesterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white">Chat Tester</h3>
          </div>
          <button onClick={() => setIsTesterOpen(false)} className="p-1 hover:bg-neutral-800 rounded-lg text-neutral-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 bg-black p-4">
          <ChatTester agentName={params.id} />
        </div>
      </div>
    </div>
  );
}
