"use client";

import { useState } from 'react';

type Document = {
  id: string;
  title: string;
  type: string;
  date: string;
};

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<Document[]>([
    { id: '1', title: 'Refund Policy & SOP', type: 'TXT', date: 'Oct 12, 2026' },
    { id: '2', title: 'Product Pricing 2026', type: 'PDF', date: 'Oct 10, 2026' },
  ]);

  const handleUpload = () => {
    // Dummy upload action
    const newDoc = {
      id: Date.now().toString(),
      title: 'New SOP Document',
      type: 'TXT',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setDocuments([...documents, newDoc]);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            Knowledge Base
          </h1>
          <p className="text-neutral-400 mt-2">
            Upload documents, SOPs, and pricing data to train your AI on your specific business.
          </p>
        </div>
        <button 
          onClick={handleUpload}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          Upload Document
        </button>
      </div>

      {/* Upload Zone */}
      <div className="mb-8 border-2 border-dashed border-neutral-700 hover:border-emerald-500/50 transition-colors rounded-2xl p-10 bg-neutral-900/30 text-center cursor-pointer">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
        </div>
        <h3 className="text-lg font-medium text-neutral-200">Drag & Drop files here</h3>
        <p className="text-sm text-neutral-500 mt-2">Supports .TXT, .PDF, .CSV (Max 10MB)</p>
      </div>

      {/* Documents List */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl backdrop-blur-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-neutral-800 text-sm font-medium text-neutral-400 bg-neutral-950/50">
          <div className="col-span-6">Document Title</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-3">Date Uploaded</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        
        <div className="divide-y divide-neutral-800">
          {documents.map(doc => (
            <div key={doc.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-neutral-800/50 transition-colors">
              <div className="col-span-6 flex items-center gap-3">
                <div className={`w-8 h-8 rounded bg-neutral-800 flex items-center justify-center text-xs font-bold ${doc.type === 'PDF' ? 'text-red-400' : 'text-blue-400'}`}>
                  {doc.type}
                </div>
                <span className="font-medium">{doc.title}</span>
              </div>
              <div className="col-span-2 text-sm text-neutral-400">
                {doc.type}
              </div>
              <div className="col-span-3 text-sm text-neutral-400">
                {doc.date}
              </div>
              <div className="col-span-1 flex justify-end">
                <button className="p-2 text-neutral-500 hover:text-red-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>
            </div>
          ))}
          {documents.length === 0 && (
            <div className="p-8 text-center text-neutral-500">
              No documents found. Upload one to train your AI!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
