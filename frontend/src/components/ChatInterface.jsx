import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, MapPin, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatInterface({ session }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hello! I'm your AI Travel Agent. Tell me where you want to go and I'll craft the perfect itinerary for you."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ question: userMessage.content }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.answer || "Sorry, I couldn't generate a plan." }
        ]);
      } else {
        const errorText = await response.text();
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `❌ Error: ${errorText}` }
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `❌ Network Error: Could not reach the server.` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-[80vh] flex flex-col backdrop-blur-xl bg-white/70 border border-amber-200/60 rounded-3xl shadow-2xl overflow-hidden relative z-10">
      
      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-b border-amber-200/60 bg-white/80 backdrop-blur-md">
        <div className="p-2 bg-amber-100 rounded-xl text-orange-500 shadow-sm border border-amber-200/50">
          <MapPin className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            🌍 AI Trip Planner
          </h1>
          <p className="text-xs text-slate-500 font-medium tracking-wide border-b-0">POWERED BY GRAPH AGENTS</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-3xl p-5 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white rounded-tr-sm shadow-orange-500/20'
                  : 'bg-white text-slate-800 rounded-tl-sm border border-amber-200/50'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-headings:text-orange-500 prose-a:text-blue-500">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-[15px] leading-relaxed">{msg.content}</p>
              )}
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white rounded-3xl rounded-tl-sm p-5 border border-amber-200/50 shadow-sm flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
              <span className="text-sm font-medium text-slate-500 animate-pulse">Crafting your itinerary...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-5 border-t border-amber-200/60 bg-white/80 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Plan a 5-day luxury trip to Kyoto, Japan..."
            className="w-full bg-white/60 border border-amber-200 rounded-2xl py-4 pl-6 pr-16 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all shadow-inner"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-xl transition-colors shadow-md flex items-center justify-center group"
          >
            <Send className="w-5 h-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
}
