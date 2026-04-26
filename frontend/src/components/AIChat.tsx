import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Mic, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from '../config';


interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm Aurora, your GrowthOS AI coach. How can I help you level up today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('speechRecognition' in window)) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    // @ts-ignore
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      // Automatically send if it's a command
      if (transcript.toLowerCase().includes("complete") || transcript.toLowerCase().includes("set reminder")) {
         // logic could be added here
      }
    };

    recognition.start();
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        message: userMessage,
        history: messages.map(m => ({
           role: m.role === 'assistant' ? 'model' : 'user',
           parts: [{ text: m.content }]
        }))
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to my neural network. Please check if the backend is running!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] md:h-[600px] glass-card overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5">
        <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400">
          <Bot size={24} />
        </div>
        <div>
          <h3 className="font-bold">Coach Aurora</h3>
          <div className="flex items-center gap-1 text-[10px] text-green-500">
            <Sparkles size={10} />
            <span>AI Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-purple-600/20 border border-purple-500/30 text-white rounded-tr-none' 
                : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
            }`}>
              <div className="flex items-center gap-2 mb-1 text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                <span>{msg.role}</span>
              </div>
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none">
              <Loader2 className="animate-spin text-purple-500" size={20} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <div className="relative flex items-center gap-2">
          <button 
            onClick={startListening}
            className={`p-2.5 glass-button transition-all ${isListening ? 'text-red-500 animate-pulse bg-red-500/10' : 'text-gray-400 hover:text-white'}`}
          >
            <Mic size={20} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message or use voice..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-purple-500/50 transition-all text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="p-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white shadow-lg shadow-purple-900/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
