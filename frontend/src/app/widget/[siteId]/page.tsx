"use client";

import { useEffect, useState, useRef } from 'react';
import { Send, Globe, X, User } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

export default function WidgetPage({ params }: { params: { siteId: string } }) {
  const [config, setConfig] = useState<any>(null);
  const [messages, setMessages] = useState<{ id: string; content: string; senderType: string }[]>([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Fetch widget config
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/sites/${params.siteId}/widget-config`);
        if (res.ok) {
          const data = await res.json();
          setConfig(data.config);
          setOrganizationId(data.organizationId);
          
          if (data.config?.welcomeMessage) {
            setMessages([{ id: 'welcome', content: data.config.welcomeMessage, senderType: 'AI_EMPLOYEE' }]);
          }
        }
      } catch (e) {
        console.error('Failed to load widget config', e);
      }
    };
    
    fetchConfig();
  }, [params.siteId]);

  useEffect(() => {
    if (organizationId) {
      const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
        auth: { token: 'guest' } // We might need to generate a guest token or modify backend to allow guest sockets
      });

      newSocket.on('connect', () => {
        // Authenticate as a guest for this organization
        newSocket.emit('authenticate', { 
           isGuest: true, 
           organizationId: organizationId 
        });
        
        // Let's create a local conversation ID for this session
        const localConvId = localStorage.getItem(`conv_${params.siteId}`) || `guest_${Math.random().toString(36).substring(7)}`;
        localStorage.setItem(`conv_${params.siteId}`, localConvId);
        setConversationId(localConvId);
        
        newSocket.emit('join_conversation', { conversationId: localConvId });
      });

      newSocket.on('new_message', (msg) => {
        if (msg.senderType !== 'CUSTOMER') {
           setMessages(prev => [...prev, msg]);
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [organizationId, params.siteId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket || !conversationId) return;

    const newMessage = {
      id: Date.now().toString(),
      conversationId: conversationId,
      content: input,
      senderType: 'CUSTOMER'
    };

    // Add to local state immediately
    setMessages(prev => [...prev, newMessage]);
    
    // Emit to backend
    socket.emit('send_message', newMessage);
    
    setInput('');
  };

  if (!config) {
    return <div className="h-screen w-screen bg-gray-50 animate-pulse"></div>;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-white overflow-hidden" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div 
        className="p-4 flex items-center justify-between shadow-sm z-10 shrink-0" 
        style={{ backgroundColor: config.primaryColor || '#4f46e5' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
             <Globe className="w-5 h-5 text-white" />
          </div>
          <div className="overflow-hidden">
            <div className="text-white font-bold text-base leading-tight truncate">{config.title || 'Live Chat'}</div>
            <div className="text-white/80 text-xs mt-0.5 truncate flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> We reply immediately
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-gray-50 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg, idx) => {
          const isCustomer = msg.senderType === 'CUSTOMER';
          return (
            <div key={msg.id || idx} className={`flex gap-2 ${isCustomer ? 'flex-row-reverse' : ''}`}>
              {!isCustomer && (
                <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 flex items-center justify-center">
                   <Globe className="w-4 h-4 text-gray-400" />
                </div>
              )}
              <div 
                className={`p-3 rounded-2xl max-w-[85%] whitespace-pre-wrap text-[15px] shadow-sm ${
                  isCustomer 
                    ? 'rounded-tr-sm text-white' 
                    : 'bg-white rounded-tl-sm text-gray-800 border border-gray-100'
                }`}
                style={isCustomer ? { backgroundColor: config.primaryColor || '#4f46e5' } : {}}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-100 shrink-0">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tulis pesan..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-full pl-5 pr-12 py-3 text-sm text-gray-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 p-2 bg-indigo-600 text-white rounded-full disabled:opacity-50 hover:bg-indigo-700 transition-colors"
            style={{ backgroundColor: config.primaryColor || '#4f46e5' }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="text-center mt-2">
           <a href="https://avario.com" target="_blank" className="text-[10px] text-gray-400 hover:text-gray-500 transition-colors">
              Powered by Avario LiveChat
           </a>
        </div>
      </div>
    </div>
  );
}
