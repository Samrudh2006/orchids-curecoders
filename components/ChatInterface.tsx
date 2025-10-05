import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useVoiceFeatures } from '../hooks/useVoiceFeatures';
import { X, Send, MessageCircle, Trash2, Lightbulb, Mic } from './Icons';

const ChatInterface: React.FC = () => {
  const {
    messages,
    isTyping,
    isChatOpen,
    toggleChat,
    sendMessage,
    clearChat,
    suggestQueries
  } = useChat();
  
  const { explainFeature } = useVoiceFeatures();
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isChatOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const message = inputValue.trim();
    setInputValue('');
    setShowSuggestions(false);
    await sendMessage(message);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isChatOpen) {
    return (
      <button
        onClick={toggleChat}
        onMouseEnter={() => explainFeature('help')}
        className="fixed bottom-20 right-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white p-4 rounded-full shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-110 z-40"
        aria-label="Open AI Chat Assistant"
      >
        <MessageCircle className="w-6 h-6" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col z-50 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white dark:border-slate-800 rounded-full"></div>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm">ARIA Chat</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pharmaceutical AI Assistant</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="p-2 text-slate-400 hover:text-cyan-600 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            title="Show suggestions"
          >
            <Lightbulb className="w-4 h-4" />
          </button>
          <button
            onClick={clearChat}
            className="p-2 text-slate-400 hover:text-orange-600 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={toggleChat}
            className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggestions Panel */}
      {showSuggestions && (
        <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">💡 Try these pharmaceutical queries:</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {suggestQueries.slice(0, 4).map((query, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(query)}
                className="w-full text-left text-xs text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded transition-colors"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : message.type === 'system'
                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </div>
              <div
                className={`text-xs mt-1 opacity-70 ${
                  message.type === 'user' ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl px-4 py-2 max-w-[85%]">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">ARIA is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about pharmaceutical research..."
              disabled={isTyping}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none text-sm placeholder-slate-400 dark:placeholder-slate-500 pr-10"
              maxLength={500}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              {inputValue.length}/500
            </div>
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-400 text-white p-3 rounded-xl transition-all duration-200 disabled:cursor-not-allowed hover:scale-105"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="flex items-center justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Connected to pharmaceutical intelligence</span>
          </div>
          <button
            onClick={() => explainFeature('help')}
            className="flex items-center space-x-1 hover:text-cyan-600 transition-colors"
          >
            <Mic className="w-3 h-3" />
            <span>Voice help</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;