"use client";

import { useState } from "react";
import { Link as LinkIcon, Database, CheckCircle2, UploadCloud, RefreshCw, FileText, Globe, MessageCircleQuestion, Plus } from "lucide-react";

export default function KnowledgeBasePage() {
  const [activeTab, setActiveTab] = useState<'all' | 'documents' | 'links' | 'qa'>('all');

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">AI Knowledge Base</h1>
          <p className="text-sm text-neutral-400 max-w-2xl">
            Latih AI Anda dengan dokumen, website, dan FAQ agar bisa menjawab pertanyaan pelanggan dengan lebih pintar dan akurat.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium rounded-lg transition-colors border border-neutral-700">
            <RefreshCw className="w-4 h-4" />
            Sync All
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20">
            <Plus className="w-4 h-4" />
            Tambah Data
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between">
          <span className="text-xs font-bold text-neutral-500 tracking-wider mb-2">DATA SOURCES</span>
          <div className="text-3xl font-bold text-white mb-1">1</div>
          <span className="text-xs text-neutral-400">Aktif terhubung</span>
        </div>
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between">
          <span className="text-xs font-bold text-neutral-500 tracking-wider mb-2">VECTOR CHUNKS</span>
          <div className="text-3xl font-bold text-white mb-1">10</div>
          <span className="text-xs text-neutral-400">Pecahan memori AI</span>
        </div>
        <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden">
          <Database className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-900/30" />
          <span className="text-xs font-bold text-emerald-600 tracking-wider mb-2 z-10">SYNC STATUS</span>
          <div className="text-2xl font-bold text-emerald-400 mb-1 z-10">Healthy</div>
          <span className="text-xs text-emerald-600/80 z-10">Semua data terindeks</span>
        </div>
        <button className="bg-indigo-950/20 border border-indigo-900/50 border-dashed rounded-2xl p-5 backdrop-blur-xl flex flex-col items-center justify-center gap-2 hover:bg-indigo-900/20 transition-colors group">
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <UploadCloud className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-sm font-bold text-indigo-400">Upload Dokumen</span>
          <span className="text-xs text-indigo-500/60">PDF, DOCX, TXT</span>
        </button>
      </div>

      {/* Data List Section */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl backdrop-blur-xl overflow-hidden">
        <div className="flex border-b border-neutral-800 p-2 gap-1">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'all' ? 'bg-indigo-500/10 text-indigo-400' : 'text-neutral-400 hover:text-white'}`}
          >
            All
          </button>
          <button 
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'documents' ? 'bg-indigo-500/10 text-indigo-400' : 'text-neutral-400 hover:text-white'}`}
          >
            <FileText className="w-4 h-4" /> Documents
          </button>
          <button 
            onClick={() => setActiveTab('links')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'links' ? 'bg-indigo-500/10 text-indigo-400' : 'text-neutral-400 hover:text-white'}`}
          >
            <Globe className="w-4 h-4" /> Website Links
          </button>
          <button 
            onClick={() => setActiveTab('qa')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'qa' ? 'bg-indigo-500/10 text-indigo-400' : 'text-neutral-400 hover:text-white'}`}
          >
            <MessageCircleQuestion className="w-4 h-4" /> Q&A
          </button>
        </div>

        <div className="w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider w-1/3">Sumber Data</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider w-1/4">Detail</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status Sinkronisasi</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Dummy row representing the screenshot */}
              <tr className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <LinkIcon className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm mb-1">kebijakan pelanggan</p>
                      <p className="text-xs text-neutral-500 truncate w-64">fa6aefe7-e5a5-40cd-92ec-d8cd26f8197a</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-neutral-300">URL</p>
                  <p className="text-xs text-neutral-500">URL Link &bull; 10 chunks</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Synced
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-xs font-medium text-neutral-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          {activeTab !== 'all' && (
            <div className="p-12 text-center text-neutral-500 text-sm">
              Tidak ada data lain di kategori ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
