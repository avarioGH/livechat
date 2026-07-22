"use client";

import { useState } from 'react';

export default function AIPersonasPage() {
  const [provider, setProvider] = useState('OPENAI');
  const [name, setName] = useState('Customer Support Bot');
  const [prompt, setPrompt] = useState('You are a helpful customer support agent for our company. Always be polite, concise, and helpful. If you do not know the answer based on the knowledge base, advise the customer to wait for a human agent.');
  const [isActive, setIsActive] = useState(true);

  const handleSave = () => {
    // In a real app, this would be an API call to save to PostgreSQL
    alert('AI Settings Saved Successfully!');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          AI Persona Configuration
        </h1>
        <p className="text-neutral-400 mt-2">
          Design your AI employee\'s character, behavior, and select the AI model provider.
        </p>
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl space-y-8">
        
        {/* Toggle AI Active */}
        <div className="flex items-center justify-between p-4 bg-neutral-950 rounded-xl border border-neutral-800">
          <div>
            <h3 className="font-semibold text-lg">AI Automation Status</h3>
            <p className="text-sm text-neutral-400">When active, the AI will automatically reply to new customer messages.</p>
          </div>
          <button 
            onClick={() => setIsActive(!isActive)}
            className={`w-14 h-8 rounded-full transition-colors relative ${isActive ? 'bg-indigo-500' : 'bg-neutral-700'}`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform ${isActive ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {/* AI Provider */}
        <div>
          <label className="block text-sm font-medium mb-2">AI Engine Provider</label>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setProvider('OPENAI')}
              className={`p-4 rounded-xl border flex items-center justify-center gap-3 transition-colors ${provider === 'OPENAI' ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-600'}`}
            >
              <span className="font-bold">OpenAI (GPT-4o)</span>
            </button>
            <button 
              onClick={() => setProvider('GEMINI')}
              className={`p-4 rounded-xl border flex items-center justify-center gap-3 transition-colors ${provider === 'GEMINI' ? 'bg-blue-500/20 border-blue-500 text-white' : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-600'}`}
            >
              <span className="font-bold">Google Gemini</span>
            </button>
          </div>
        </div>

        {/* AI Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Bot Name</label>
          <input 
            type="text" 
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="e.g. Support Assistant"
          />
        </div>

        {/* System Prompt */}
        <div>
          <label className="block text-sm font-medium mb-2">System Prompt & Behavior</label>
          <p className="text-xs text-neutral-500 mb-3">Instruct your AI on how to behave, what tone to use, and any strict rules to follow.</p>
          <textarea 
            rows={6}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-neutral-800">
          <button 
            onClick={handleSave}
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            Save AI Settings
          </button>
        </div>

      </div>
    </div>
  );
}
