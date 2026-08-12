"use client";

import { useState, useEffect } from 'react';
import { Copy, Plus, Save, Settings2, Globe, Monitor, Code } from "lucide-react";

type WidgetConfig = {
  id: string;
  primaryColor: string;
  title: string;
  welcomeMessage: string;
};

type Site = {
  id: string;
  name: string;
  domain: string;
  publicKey: string;
  widgetConfig: WidgetConfig;
};

export default function WidgetSettingsPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [activeSite, setActiveSite] = useState<Site | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSiteForm, setNewSiteForm] = useState({ name: '', domain: '' });
  const [token, setToken] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchSites(storedToken);
    }
  }, []);

  const fetchSites = async (jwt: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/sites`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSites(data);
        if (data.length > 0 && !activeSite) setActiveSite(data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch sites', error);
    }
  };

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/sites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSiteForm)
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewSiteForm({ name: '', domain: '' });
        const site = await res.json();
        setSites([site, ...sites]);
        setActiveSite(site);
      }
    } catch (error) {
      console.error('Failed to create site', error);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeSite || !activeSite.widgetConfig) return;

    setIsSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/sites/${activeSite.id}/widget-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          primaryColor: activeSite.widgetConfig.primaryColor,
          title: activeSite.widgetConfig.title,
          welcomeMessage: activeSite.widgetConfig.welcomeMessage
        })
      });
      if (res.ok) {
        alert('Pengaturan widget berhasil disimpan!');
      }
    } catch (error) {
      console.error('Failed to save config', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCode = () => {
    if (!activeSite) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const code = `<iframe src="${origin}/widget/${activeSite.publicKey}" style="border: none; position: fixed; bottom: 20px; right: 20px; width: 400px; height: 600px; z-index: 999999; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.15);" id="avario-widget-iframe"></iframe>`;
    navigator.clipboard.writeText(code);
    alert('Kode embed berhasil disalin!');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Widget Settings</h1>
          <p className="text-sm text-neutral-400">
            Atur tampilan live chat widget dan pasang di website Anda.
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Website
        </button>
      </div>

      {sites.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/20">
          <Globe className="w-12 h-12 text-neutral-700 mb-4" />
          <h3 className="text-lg font-medium text-neutral-300 mb-2">Belum ada Website Terdaftar</h3>
          <p className="text-sm text-neutral-500 mb-6 text-center max-w-md">
            Daftarkan website Anda terlebih dahulu untuk mendapatkan kode embed widget Live Chat.
          </p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
          >
            Daftarkan Website
          </button>
        </div>
      ) : (
        <div className="flex gap-8">
          {/* Settings Sidebar */}
          <div className="w-[350px] shrink-0 space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
              <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Pilih Website</label>
              <select 
                value={activeSite?.id || ''} 
                onChange={e => setActiveSite(sites.find(s => s.id === e.target.value) || null)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              >
                {sites.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.domain})</option>
                ))}
              </select>
            </div>

            {activeSite && activeSite.widgetConfig && (
              <form onSubmit={handleSaveConfig} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-5">
                <div className="flex items-center gap-2 mb-2 pb-4 border-b border-neutral-800">
                  <Settings2 className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-white">Konfigurasi Tampilan</h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Warna Utama (Hex)</label>
                  <div className="flex gap-3">
                    <input 
                      type="color" 
                      value={activeSite.widgetConfig.primaryColor || '#4f46e5'} 
                      onChange={e => setActiveSite({...activeSite, widgetConfig: {...activeSite.widgetConfig, primaryColor: e.target.value}})}
                      className="w-10 h-10 rounded border-0 bg-transparent cursor-pointer p-0"
                    />
                    <input 
                      type="text" 
                      value={activeSite.widgetConfig.primaryColor || '#4f46e5'} 
                      onChange={e => setActiveSite({...activeSite, widgetConfig: {...activeSite.widgetConfig, primaryColor: e.target.value}})}
                      className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 uppercase" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Header Title</label>
                  <input 
                    type="text" 
                    value={activeSite.widgetConfig.title || ''} 
                    onChange={e => setActiveSite({...activeSite, widgetConfig: {...activeSite.widgetConfig, title: e.target.value}})}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Pesan Sapaan Pertama</label>
                  <textarea 
                    value={activeSite.widgetConfig.welcomeMessage || ''} 
                    onChange={e => setActiveSite({...activeSite, widgetConfig: {...activeSite.widgetConfig, welcomeMessage: e.target.value}})}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 h-24 resize-none" 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-colors flex justify-center items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </form>
            )}

            {activeSite && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Code className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-white">Embed Code</h3>
                </div>
                <p className="text-xs text-neutral-400 mb-3">Copy kode ini dan letakkan di dalam tag <code className="text-emerald-400">&lt;body&gt;</code> website Anda.</p>
                <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl relative group">
                  <code className="text-xs text-neutral-300 break-all font-mono">
                    &lt;iframe src="{typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/widget/{activeSite.publicKey}" style="border: none; position: fixed; bottom: 20px; right: 20px; width: 400px; height: 600px; z-index: 999999; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.15);" id="avario-widget-iframe"&gt;&lt;/iframe&gt;
                  </code>
                  <button 
                    onClick={handleCopyCode}
                    className="absolute top-2 right-2 p-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Live Preview */}
          <div className="flex-1 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-2xl p-8 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
            <div className="absolute top-4 left-4 flex items-center gap-2 text-neutral-500 font-medium text-sm">
              <Monitor className="w-4 h-4" />
              Live Preview
            </div>

            {/* Simulated Desktop Screen containing the widget */}
            <div className="w-full max-w-2xl h-[600px] bg-neutral-950 border border-neutral-800 rounded-lg shadow-2xl relative overflow-hidden">
              {/* Fake Website UI */}
              <div className="w-full h-12 border-b border-neutral-800 flex items-center px-4 gap-4">
                 <div className="font-bold text-neutral-600">{activeSite?.name || 'Your Website'}</div>
                 <div className="h-2 w-32 bg-neutral-800 rounded-full"></div>
                 <div className="h-2 w-16 bg-neutral-800 rounded-full"></div>
              </div>

              {/* The Widget Preview */}
              {activeSite && activeSite.widgetConfig && (
                <div 
                  className="absolute bottom-6 right-6 w-[360px] h-[520px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden transition-all duration-500"
                  style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}
                >
                  <div className="p-4 flex items-center justify-between" style={{ backgroundColor: activeSite.widgetConfig.primaryColor }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                         <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm leading-tight">{activeSite.widgetConfig.title || 'Live Chat'}</div>
                        <div className="text-white/80 text-xs mt-0.5">We reply immediately</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 bg-gray-50 p-4 space-y-4 overflow-y-auto">
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 flex items-center justify-center">
                         <Globe className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="bg-white p-3 rounded-2xl rounded-tl-sm text-sm text-gray-700 shadow-sm border border-gray-100 max-w-[85%] whitespace-pre-wrap">
                        {activeSite.widgetConfig.welcomeMessage || 'Hi! How can we help you today?'}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-white border-t border-gray-100">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-400">
                      Tulis pesan di sini...
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Create Site Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-800">
              <h2 className="text-xl font-bold text-white">Daftarkan Website</h2>
              <p className="text-xs text-neutral-400 mt-1">Satu widget untuk satu domain website.</p>
            </div>
            <form onSubmit={handleCreateSite} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Nama Project/Website</label>
                <input required type="text" value={newSiteForm.name} onChange={e => setNewSiteForm({...newSiteForm, name: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" placeholder="e.g. Tokopedia" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Domain (Tanpa https)</label>
                <input required type="text" value={newSiteForm.domain} onChange={e => setNewSiteForm({...newSiteForm, domain: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" placeholder="e.g. tokopedia.com" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800 mt-6">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:text-white transition-colors">Batal</button>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">Daftarkan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
