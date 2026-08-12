"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Plus, Bot, Settings2, Trash2, X } from "lucide-react";

type AIEmployee = {
  id: string;
  name: string;
  role: string;
  provider: string;
  model: string;
  isActive: boolean;
  communicationStyle: string;
  knowledgeSources: any[];
};

export default function AIEmployeesPage() {
  const [employees, setEmployees] = useState<AIEmployee[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: '', provider: 'OPENAI', model: 'gpt-4o-mini', systemInstruction: '', communicationStyle: 'Professional' });
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchEmployees(storedToken);
    }
  }, []);

  const fetchEmployees = async (jwt: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/employees`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setEmployees(data);
    } catch (error) {
      console.error('Failed to fetch AI employees', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', role: '', provider: 'OPENAI', model: 'gpt-4o-mini', systemInstruction: '', communicationStyle: 'Professional' });
        fetchEmployees(token);
      }
    } catch (error) {
      console.error('Failed to create AI employee', error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">AI Employees</h1>
          <p className="text-sm text-neutral-400">
            Kelola staf virtual Anda yang siap melayani pelanggan 24/7 tanpa henti.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          Hire New AI
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(ai => (
          <div key={ai.id} className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl flex flex-col hover:border-neutral-700 transition-colors">
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">{ai.name}</h2>
                  <p className="text-sm font-medium text-indigo-400">{ai.role}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded border ${ai.isActive ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-neutral-800 border-neutral-700'}`}>
                <span className={`text-[10px] font-bold tracking-wider uppercase ${ai.isActive ? 'text-emerald-400' : 'text-neutral-400'}`}>
                  {ai.isActive ? 'ONLINE' : 'OFFLINE'}
                </span>
                {ai.isActive && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
              </div>
            </div>

            <div className="text-xs font-semibold text-neutral-500 mb-4 tracking-wider">AI PROFILE</div>
            
            <div className="space-y-3 mb-6 flex-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-400">Gaya Komunikasi</span>
                <span className="font-medium text-white">{ai.communicationStyle}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-400">Akses Knowledge</span>
                <span className="font-medium text-indigo-400">{ai.knowledgeSources?.length || 0} Sumber</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-400">Engine</span>
                <span className="font-medium text-white">{ai.model}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-950/50 border border-neutral-800/50 mb-6">
              <div>
                <div className="text-xs text-neutral-500 flex items-center gap-1 mb-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                  CHATS HANDLED
                </div>
                <div className="text-xl font-bold text-white">-</div>
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
              <Link href={`/dashboard/ai/${ai.id}`} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-neutral-800 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-colors group">
                <Settings2 className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                Train AI / Settings
              </Link>
              <button className="p-3 bg-neutral-800 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 border border-transparent hover:border-red-500/30 rounded-xl transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Hire New AI Card */}
        <button onClick={() => setShowModal(true)} className="min-h-[320px] bg-neutral-900/20 border border-dashed border-indigo-500/30 rounded-2xl p-6 flex flex-col items-center justify-center hover:bg-indigo-500/5 hover:border-indigo-500/50 transition-all group">
          <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-indigo-500" />
          </div>
          <h3 className="text-lg font-bold text-indigo-400 mb-2">Tambah AI Baru</h3>
          <p className="text-sm text-neutral-500 text-center max-w-[200px]">
            Hire agent virtual baru untuk divisi spesifik di bisnis Anda.
          </p>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Hire New AI Employee</h2>
                <p className="text-xs text-neutral-400 mt-1">Konfigurasi agen virtual Anda.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Nama AI</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" placeholder="e.g. Alex" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Role</label>
                  <input required type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" placeholder="e.g. Sales" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Gaya Komunikasi</label>
                <input required type="text" value={formData.communicationStyle} onChange={e => setFormData({...formData, communicationStyle: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" placeholder="e.g. Profesional, Ramah, Gaul" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">System Instruction (Custom Prompt)</label>
                <textarea required value={formData.systemInstruction} onChange={e => setFormData({...formData, systemInstruction: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 h-28 resize-none" placeholder="Kamu adalah asisten customer service yang membantu pelanggan mengatasi masalah..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Provider</label>
                  <select value={formData.provider} onChange={e => setFormData({...formData, provider: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 appearance-none">
                    <option value="OPENAI">OpenAI</option>
                    <option value="GEMINI">Google Gemini</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Model</label>
                  <select value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 appearance-none">
                    <option value="gpt-4o-mini">gpt-4o-mini</option>
                    <option value="gpt-4o">gpt-4o</option>
                    <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                    <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:text-white transition-colors">Batal</button>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">Hire AI Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
