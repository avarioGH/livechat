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
    <div className="flex h-full p-6 gap-6">
      {/* Conversations List */}
      <div className="w-80 bg-neutral-900/50 border border-neutral-800 rounded-2xl flex flex-col overflow-hidden backdrop-blur-xl">
        <div className="p-4 border-b border-neutral-800">
          <h2 className="text-lg font-semibold mb-4">Inbox</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${activeTab === 'all' ? 'bg-indigo-500 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveTab('human')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${activeTab === 'human' ? 'bg-indigo-500 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
            >
              Needs Human
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map(conv => {
            const isAIActive = conv.assignedAIId && !conv.assignedAgentId && conv.status !== 'CLOSED';
            return (
              <div 
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${activeConvId === conv.id ? 'bg-indigo-500/20 border border-indigo-500/30' : 'hover:bg-neutral-800 border border-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium">{conv.customer?.name || 'Anonymous'}</h3>
                  {isAIActive ? (
                    <span className="text-[10px] font-bold tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">AI</span>
                  ) : (
                    <span className="text-[10px] font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">HUMAN</span>
                  )}
                </div>
                <p className="text-xs text-neutral-400 line-clamp-1">
                  {conv.messages[conv.messages.length - 1]?.content || 'No messages yet'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-neutral-900/50 border border-neutral-800 rounded-2xl flex flex-col overflow-hidden backdrop-blur-xl">
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold">
                  {activeConversation.customer?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <h2 className="font-semibold">{activeConversation.customer?.name || 'Anonymous'}</h2>
                  <p className="text-xs text-neutral-400">
                    {activeConversation.assignedAIId && !activeConversation.assignedAgentId ? 'AI is handling this chat' : 'You are chatting with customer'}
                  </p>
                </div>
              </div>
              {activeConversation.assignedAIId && !activeConversation.assignedAgentId && (
                <button 
                  onClick={handleTakeover}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Take Over Chat
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeConversation.messages.map(msg => {
                const isCustomer = msg.senderType === 'CUSTOMER';
                const isAI = msg.senderType === 'AI_EMPLOYEE';
                
                return (
                  <div key={msg.id} className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-5 py-3 ${isCustomer ? 'bg-neutral-800 text-white rounded-tl-none' : isAI ? 'bg-indigo-900/50 text-indigo-100 border border-indigo-500/30 rounded-tr-none' : 'bg-emerald-600 text-white rounded-tr-none'}`}>
                      <p className="text-sm">{msg.content}</p>
                      <div className="mt-1 flex items-center justify-end gap-2">
                        {isAI && <span className="text-[10px] text-indigo-300 font-medium">AI Bot</span>}
                        <span className="text-[10px] opacity-60">
                          {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-neutral-900 border-t border-neutral-800">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={activeConversation.assignedAIId && !activeConversation.assignedAgentId ? "Type to take over and reply..." : "Type your reply..."}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-2 p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
