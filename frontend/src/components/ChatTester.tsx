import { useState } from "react";
import { Send, RotateCcw } from "lucide-react";

type ChatMessage = {
  id: string;
  role: "user" | "ai";
  text: string;
};

export default function ChatTester({ agentName }: { agentName: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", role: "ai", text: `Halo! Saya ${agentName === 'sarah' ? 'Sarah' : 'Agen AI'}, ada yang bisa saya bantu hari ini?` }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Simulate AI thinking and replying
    setTimeout(() => {
      const aiMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: "ai", 
        text: "Maaf, ini adalah mode simulasi (Testing). Koneksi ke knowledge base dan OpenAI/Gemini belum disambungkan sepenuhnya di tampilan ini." 
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  const handleReset = () => {
    setMessages([{ id: Date.now().toString(), role: "ai", text: `Halo! Saya ${agentName === 'sarah' ? 'Sarah' : 'Agen AI'}, ada yang bisa saya bantu hari ini?` }]);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0b] rounded-xl border border-neutral-800 overflow-hidden">
      <div className="flex justify-between items-center p-3 border-b border-neutral-800 bg-neutral-900/50">
        <span className="text-xs font-medium text-neutral-400">Sandbox Environment</span>
        <button onClick={handleReset} className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors">
          <RotateCcw className="w-3 h-3" />
          Reset Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-neutral-900 border-t border-neutral-800">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ketik pesan untuk test..."
            className="w-full bg-black border border-neutral-700 rounded-xl py-2.5 pl-3 pr-10 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button 
            onClick={handleSend}
            className="absolute right-1.5 top-1.5 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
