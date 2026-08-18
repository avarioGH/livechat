"use client";

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

type Message = {
  id: string;
  content: string;
  senderId: string;
  senderType: 'CUSTOMER' | 'AI_EMPLOYEE' | 'HUMAN_AGENT' | 'SYSTEM';
  createdAt: string;
};

type Conversation = {
  id: string;
  status: string;
  assignedAIId: string | null;
  assignedAgentId: string | null;
  customer: { name: string, email: string };
  messages: Message[];
};

export default function InboxPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'human' | 'ai'>('all');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Basic auth extraction from localStorage
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!token || !user) return;

    // Fetch initial conversations
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/conversations`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
         if (Array.isArray(data)) {
           setConversations(data);
           if (data.length > 0 && !activeConvId) {
             setActiveConvId(data[0].id);
           }
         }
      })
      .catch(err => console.error('Failed to fetch conversations', err));

    // Connect to Socket.io backend
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
    setSocket(newSocket);

    // Join organization room
    newSocket.emit('join_organization', user.organizationId);

    newSocket.on('new_message', (msg: Message & { conversationId: string }) => {
      setConversations(prev => prev.map(conv => {
        if (conv.id === msg.conversationId) {
           // Prevent duplicates if optimistic UI already added it
           if (conv.messages.find(m => m.id === msg.id)) return conv;
           return { ...conv, messages: [...conv.messages, msg] };
        }
        return conv;
      }));
    });

    newSocket.on('new_conversation', (conv: Conversation) => {
      setConversations(prev => {
        // Prevent duplicates
        if (prev.find(c => c.id === conv.id)) return prev;
        return [conv, ...prev];
      });
    });

    return () => {
      newSocket.close();
    };
  }, [token, user]);

  const activeConversation = conversations.find(c => c.id === activeConvId);

  const handleSend = () => {
    if (!replyText.trim() || !socket || !activeConversation || !user) return;

    // Send to backend
    socket.emit('send_message', {
      conversationId: activeConversation.id,
      content: replyText,
      senderId: user.id,
      senderType: 'HUMAN_AGENT',
      organizationId: user.organizationId
    });

    // Optimistic UI update
    const newMessage: Message = {
      id: `temp-${Date.now()}`,
      content: replyText,
      senderId: user.id,
      senderType: 'HUMAN_AGENT',
      createdAt: new Date().toISOString()
    };
    
    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversation.id) {
        return { ...conv, messages: [...conv.messages, newMessage] };
      }
      return conv;
    }));
    
    setReplyText('');
  };

  const handleTakeover = () => {
    if (!socket || !activeConversation || !user) return;
    socket.emit('take_over', { conversationId: activeConversation.id, agentId: user.id });
    
    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversation.id) {
        return { ...conv, assignedAgentId: user.id, assignedAIId: null, status: 'ASSIGNED' };
      }
      return conv;
    }));
  };

  return (
    <div className="flex h-full p-8 gap-6 max-w-[1600px] mx-auto">
      {/* Conversations List */}
      <div className="w-[340px] bg-[#0F0F11]/80 backdrop-blur-xl border border-white/[0.05] shadow-2xl rounded-3xl flex flex-col overflow-hidden relative">
        <div className="absolute top-[-50px] left-[-50px] w-[150px] h-[150px] bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="p-5 border-b border-white/[0.05] relative z-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            Inbox
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${activeTab === 'all' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/[0.03] text-neutral-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.05]'}`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveTab('human')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${activeTab === 'human' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/[0.03] text-neutral-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.05]'}`}
            >
              Needs Human
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 relative z-10 custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
              <div className="w-12 h-12 rounded-full bg-neutral-800/50 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
              </div>
              <p className="text-sm font-medium text-neutral-400">Inbox kosong</p>
              <p className="text-xs text-neutral-500 mt-1">Belum ada obrolan masuk.</p>
            </div>
          ) : (
            conversations.map(conv => {
              const isAIActive = conv.assignedAIId && !conv.assignedAgentId && conv.status !== 'CLOSED';
              const isActive = activeConvId === conv.id;
              return (
                <div 
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20' 
                      : 'hover:bg-white/[0.02] border border-transparent'
                  }`}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />}
                  
                  <div className="flex justify-between items-start mb-1.5">
                    <h3 className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-neutral-300 group-hover:text-white'} transition-colors truncate pr-2`}>
                      {conv.customer?.name || 'Anonymous User'}
                    </h3>
                    {isAIActive ? (
                      <span className="text-[9px] font-bold tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 shrink-0">AI MODE</span>
                    ) : (
                      <span className="text-[9px] font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">HUMAN</span>
                    )}
                  </div>
                  <p className={`text-xs line-clamp-1 ${isActive ? 'text-indigo-200/70' : 'text-neutral-500'}`}>
                    {conv.messages[conv.messages.length - 1]?.content || 'No messages yet...'}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-[#0F0F11]/80 backdrop-blur-xl border border-white/[0.05] rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
        <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/[0.05] flex justify-between items-center bg-black/20 backdrop-blur-md relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-indigo-500/30 ring-2 ring-white/10">
                  {activeConversation.customer?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div>
                  <h2 className="font-bold text-lg text-white tracking-tight">{activeConversation.customer?.name || 'Anonymous Visitor'}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <p className="text-xs text-neutral-400 font-medium">
                      {activeConversation.assignedAIId && !activeConversation.assignedAgentId ? 'Sedang ditangani oleh AI' : 'Sedang ditangani oleh Anda'}
                    </p>
                  </div>
                </div>
              </div>
              {activeConversation.assignedAIId && !activeConversation.assignedAgentId && (
                <button 
                  onClick={handleTakeover}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 9V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2h8a2 2 0 002-2V9H10z"></path></svg>
                  Take Over Chat
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 relative z-10 custom-scrollbar bg-black/10">
              {activeConversation.messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-neutral-500 text-sm">
                  Belum ada pesan dalam percakapan ini.
                </div>
              ) : (
                activeConversation.messages.map(msg => {
                  const isCustomer = msg.senderType === 'CUSTOMER';
                  const isAI = msg.senderType === 'AI_EMPLOYEE';
                  
                  return (
                    <div key={msg.id} className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm ${
                        isCustomer 
                          ? 'bg-neutral-800/80 text-white rounded-tl-sm border border-neutral-700/50' 
                          : isAI 
                            ? 'bg-indigo-900/40 text-indigo-100 border border-indigo-500/30 rounded-tr-sm' 
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-sm shadow-indigo-500/20'
                      }`}>
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <div className="mt-2 flex items-center justify-end gap-2">
                          {isAI && <span className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider bg-indigo-500/20 px-1.5 py-0.5 rounded">AI Bot</span>}
                          <span className="text-[10px] font-medium opacity-60">
                            {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Area */}
            <div className="p-5 bg-black/40 border-t border-white/[0.05] relative z-10 backdrop-blur-lg">
              <div className="relative flex items-center bg-neutral-900/80 border border-neutral-700/50 rounded-2xl overflow-hidden focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
                <input 
                  type="text" 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={activeConversation.assignedAIId && !activeConversation.assignedAgentId ? "Ketik pesan untuk mengambil alih obrolan..." : "Ketik balasan Anda di sini..."}
                  className="w-full bg-transparent py-4 pl-5 pr-16 focus:outline-none text-sm text-white placeholder:text-neutral-500"
                />
                <button 
                  onClick={handleSend}
                  disabled={!replyText.trim()}
                  className="absolute right-2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 transition-colors shadow-lg"
                >
                  <svg className="w-4 h-4 translate-x-[-1px] translate-y-[1px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative z-10">
            <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Inbox Live Chat</h3>
            <p className="text-sm text-neutral-500 max-w-[280px]">
              Pilih percakapan dari daftar di sebelah kiri untuk mulai membaca atau membalas pesan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
