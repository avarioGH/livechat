"use client";

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

type Message = {
  id: string;
  content: string;
  sender: 'CUSTOMER' | 'AI' | 'HUMAN_ADMIN';
  createdAt: string;
};

export default function WidgetPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // In a real app, this comes from URL params (?tenantId=xxx)
  const tenantId = 'test-tenant-id';
  // Generate a random customer ID for this session
  const [conversationId] = useState(`conv_${Math.random().toString(36).substring(7)}`);

  useEffect(() => {
    // Connect to Socket.io backend
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('join_conversation', conversationId);

    newSocket.on('new_message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
      scrollToBottom();
    });

    return () => {
      newSocket.close();
    };
  }, [conversationId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = () => {
    if (!inputText.trim() || !socket) return;

    socket.emit('send_message', {
      conversationId,
      content: inputText,
      sender: 'CUSTOMER',
      tenantId
    });

    setInputText('');
  };

  return (
    <div className="fixed bottom-0 right-0 p-4 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center">
            <div>
              <h2 className="font-bold text-lg">Live Support</h2>
              <p className="text-xs text-blue-100">Usually replies instantly</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50">
            {messages.length === 0 && (
              <div className="text-center text-neutral-400 mt-10 text-sm">
                Send a message to start chatting!
              </div>
            )}
            {messages.map(msg => {
              const isCustomer = msg.sender === 'CUSTOMER';
              return (
                <div key={msg.id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isCustomer ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-neutral-800 border border-neutral-200 rounded-tl-none shadow-sm'}`}>
                    <p className="text-sm">{msg.content}</p>
                    <span className={`text-[10px] mt-1 block ${isCustomer ? 'text-indigo-200 text-right' : 'text-neutral-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 bg-neutral-100 border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button 
              onClick={handleSend}
              className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-indigo-600 rounded-full shadow-xl shadow-indigo-600/30 flex items-center justify-center text-white hover:scale-110 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </button>
      )}
    </div>
  );
}
