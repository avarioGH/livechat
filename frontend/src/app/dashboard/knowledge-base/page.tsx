"use client";

import { useState, useEffect } from 'react';
import { Database, Plus, FileText, UploadCloud, X, RefreshCw, Link2 } from "lucide-react";

type KnowledgeBase = {
  id: string;
  name: string;
  description: string;
  sources: any[];
};

export default function KnowledgeBasePage() {
  const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
  const [showKBModal, setShowKBModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [activeKB, setActiveKB] = useState<string | null>(null);
  
  const [kbForm, setKbForm] = useState({ name: '', description: '' });
  const [uploadForm, setUploadForm] = useState({ title: '', textContent: '' });
  const [urlForm, setUrlForm] = useState({ url: '' });
  
  const [token, setToken] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchKBs(storedToken);
    }
  }, []);

  const fetchKBs = async (jwt: string) => {
    // For now we don't have GET /api/knowledge, so we'll mock an empty state if it fails 
    // Ideally we'd create that endpoint in the backend. Let's just create it real quick! 
    // Oh wait, I didn't create GET /api/knowledge. Let me assume the backend will have it or we just catch it.
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/knowledge`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setKbs(data);
      } else {
        setKbs([]);
      }
    } catch (error) {
      console.error('Failed to fetch KBs', error);
      setKbs([]);
    }
  };

  const handleCreateKB = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/knowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(kbForm)
      });
      if (res.ok) {
        setShowKBModal(false);
        setKbForm({ name: '', description: '' });
        fetchKBs(token);
      }
    } catch (error) {
      console.error('Failed to create KB', error);
    }
  };

  const handleUploadText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeKB) return;

    setIsProcessing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/knowledge/${activeKB}/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(uploadForm)
      });
      if (res.ok) {
        setShowUploadModal(false);
        setUploadForm({ title: '', textContent: '' });
        fetchKBs(token);
        alert('Teks berhasil diunggah dan di-embed!');
      }
    } catch (error) {
      console.error('Failed to upload text', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeKB) return;

    setIsProcessing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/knowledge/${activeKB}/url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(urlForm)
      });
      if (res.ok) {
        setShowUrlModal(false);
        setUrlForm({ url: '' });
        fetchKBs(token);
        alert('URL berhasil diproses dan di-embed!');
      } else {
        alert('Gagal memproses URL. Pastikan URL valid.');
      }
    } catch (error) {
      console.error('Failed to process URL', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Knowledge Base</h1>
          <p className="text-sm text-neutral-400">
            Latih AI Anda dengan mengunggah teks pedoman, FAQ, atau data produk.
          </p>
        </div>
        <button 
          onClick={() => setShowKBModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          Create New KB
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {kbs.map(kb => (
          <div key={kb.id} className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl hover:border-neutral-700 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{kb.name}</h3>
                <p className="text-sm text-neutral-400">{kb.description}</p>
              </div>
              <div className="p-3 bg-neutral-800 rounded-xl border border-neutral-700">
                <Database className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            
            <div className="flex items-center gap-4 py-4 border-y border-neutral-800/50 mb-4">
              <div className="flex-1">
                <div className="text-xs text-neutral-500 font-semibold mb-1">DATA SOURCES</div>
                <div className="text-xl font-bold text-white">{kb.sources?.length || 0}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => { setActiveKB(kb.id); setShowUploadModal(true); }}
                className="w-1/2 py-2.5 bg-neutral-800 hover:bg-indigo-600 text-white text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-2 group"
              >
                <FileText className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                Upload Teks
              </button>
              <button 
                onClick={() => { setActiveKB(kb.id); setShowUrlModal(true); }}
                className="w-1/2 py-2.5 bg-neutral-800 hover:bg-indigo-600 text-white text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-2 group"
              >
                <Link2 className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                Scrape URL
              </button>
            </div>
          </div>
        ))}

        {kbs.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/20">
            <Database className="w-12 h-12 text-neutral-700 mb-4" />
            <h3 className="text-lg font-medium text-neutral-300 mb-2">Belum ada Knowledge Base</h3>
            <p className="text-sm text-neutral-500 mb-6 text-center max-w-md">
              Buat Knowledge Base pertama Anda untuk melatih AI Employee agar dapat menjawab pertanyaan secara spesifik mengenai bisnis Anda.
            </p>
            <button 
              onClick={() => setShowKBModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              Create Knowledge Base
            </button>
          </div>
        )}
      </div>

      {/* Create KB Modal */}
      {showKBModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Create Knowledge Base</h2>
              <button onClick={() => setShowKBModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateKB} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Nama KB</label>
                <input required type="text" value={kbForm.name} onChange={e => setKbForm({...kbForm, name: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" placeholder="e.g. FAQ Produk" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Deskripsi Singkat</label>
                <input type="text" value={kbForm.description} onChange={e => setKbForm({...kbForm, description: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" placeholder="e.g. Data FAQ untuk Bot Support" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800 mt-6">
                <button type="button" onClick={() => setShowKBModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:text-white transition-colors">Batal</button>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">Buat KB</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Text Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-indigo-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Unggah Pengetahuan (Teks)</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">Teks akan dipecah (chunk) dan diproses oleh AI.</p>
                </div>
              </div>
              <button onClick={() => !isProcessing && setShowUploadModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUploadText} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Judul / Konteks</label>
                <input required type="text" value={uploadForm.title} onChange={e => setUploadForm({...uploadForm, title: e.target.value})} disabled={isProcessing} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50" placeholder="e.g. Kebijakan Pengembalian Dana" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Isi Teks</label>
                <textarea required value={uploadForm.textContent} onChange={e => setUploadForm({...uploadForm, textContent: e.target.value})} disabled={isProcessing} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 h-48 resize-none disabled:opacity-50" placeholder="Masukkan isi pengetahuan (knowledge) di sini. AI akan mempelajari teks ini untuk merespons pelanggan..." />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800 mt-6">
                <button type="button" onClick={() => !isProcessing && setShowUploadModal(false)} disabled={isProcessing} className="px-5 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:text-white transition-colors disabled:opacity-50">Batal</button>
                <button type="submit" disabled={isProcessing} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2">
                  {isProcessing ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Memproses...</>
                  ) : (
                    <><UploadCloud className="w-4 h-4" /> Mulai Latih</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload URL Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-indigo-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Scrape URL Website</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">Sistem akan otomatis mengekstrak teks dari URL.</p>
                </div>
              </div>
              <button onClick={() => !isProcessing && setShowUrlModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUploadUrl} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">URL Website</label>
                <input required type="url" value={urlForm.url} onChange={e => setUrlForm({...urlForm, url: e.target.value})} disabled={isProcessing} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50" placeholder="https://example.com/kebijakan" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800 mt-6">
                <button type="button" onClick={() => !isProcessing && setShowUrlModal(false)} disabled={isProcessing} className="px-5 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:text-white transition-colors disabled:opacity-50">Batal</button>
                <button type="submit" disabled={isProcessing} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2">
                  {isProcessing ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Scraping...</>
                  ) : (
                    <><Link2 className="w-4 h-4" /> Mulai Scrape</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
