import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Minimize2, Maximize2, Bot, User, Sparkles, Settings, Mic, MicOff, Trash2 } from './Icons';
import { useVoiceAssistant } from '../context/VoiceAssistantContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
}

const STORAGE_KEY = 'curecoders_chat_history';

const getInitialMessage = (): Message => ({
  id: '1',
  content: "Hello! I'm your AI assistant for CureCoders pharmaceutical platform. I can help you with questions about drug discovery, market analysis, document uploads, and navigating our features. What would you like to know?",
  sender: 'bot',
  timestamp: new Date()
});

const AIChatbot: React.FC = () => {
  const { speak, isEnabled, toggleVoice, isSpeaking } = useVoiceAssistant();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const restored = parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        if (restored.length > 0) {
          setMessages(restored);
        }
      } catch (e) {
        console.error('Failed to restore chat history:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const clearHistory = () => {
    setMessages([getInitialMessage()]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const getChatbotResponse = async (userMessage: string): Promise<string> => {
    const appKnowledge = `
    CureCoders is an AI-powered pharmaceutical intelligence platform that provides:
    
    CORE FEATURES:
    - Multi-Agent AI System: Deploys specialized agents for Market Data, Patents, Clinical Trials, and Competitive Intelligence
    - Advanced PDF Reports: Professional reports with Chart.js visualizations, market analysis, and strategic insights  
    - Document Management: Upload and analyze internal documents (PDF, Word, Excel, PowerPoint)
    - Excel/PowerPoint Export: Multi-sheet workbooks and presentation-ready slides
    - Voice Assistant ARIA: Professional pharmaceutical guidance and feature explanations
    - Dark/Light Theme: Professional styling optimized for pharmaceutical industry
    - Advanced Search: Powerful filtering and search capabilities across research history
    - Drag & Drop Upload: Intuitive document management with visual feedback

    PHARMACEUTICAL FOCUS:
    - Market Intelligence: Competitive landscape analysis, market sizing, growth rates
    - Patent Analysis: IP landscape assessment, freedom to operate, expiration tracking
    - Clinical Trial Data: Phase analysis, endpoint tracking, regulatory milestones
    - Competitive Research: Competitor strategies, product portfolios, market positioning
    
    HOW TO USE:
    1. Enter pharmaceutical research query in the workspace
    2. AI agents analyze different aspects (market, patents, clinical, competitive)
    3. Comprehensive results with charts and strategic insights
    4. Export professional reports for stakeholders
    5. Upload internal documents for integrated analysis
    
    The platform is designed for pharmaceutical professionals, researchers, and strategic decision makers.
    `;

    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('how') && (lowerMessage.includes('use') || lowerMessage.includes('work'))) {
      return "To use CureCoders:\n\n1. **Enter Query**: Type your pharmaceutical research question in the workspace\n2. **AI Analysis**: Our specialized agents analyze market data, patents, clinical trials, and competitive intelligence\n3. **Review Results**: Get comprehensive insights with charts and visualizations\n4. **Export Reports**: Generate professional PDFs, Excel, or PowerPoint presentations\n5. **Upload Documents**: Add your internal files for integrated analysis\n\nTry queries like 'diabetes drug market' or 'COVID-19 vaccine patents' to see the system in action!";
    }
    
    if (lowerMessage.includes('agent') || lowerMessage.includes('ai system')) {
      return "CureCoders uses a **Multi-Agent AI System** with specialized agents:\n\n🔬 **Market Data Agent**: Analyzes market size, growth rates, competitive landscape\n📋 **Patent Agent**: Tracks IP landscape, expiration dates, freedom to operate\n🏥 **Clinical Agent**: Monitors trials, phases, endpoints, regulatory milestones\n🏢 **Competitive Agent**: Assesses competitor strategies and positioning\n\nThey work together to provide comprehensive pharmaceutical intelligence!";
    }
    
    if (lowerMessage.includes('voice') || lowerMessage.includes('aria')) {
      return "**ARIA** is your AI voice assistant! Features:\n\n🎙️ **Voice Guidance**: Explains features and guides you through the platform\n📊 **Chart Narration**: Describes data visualizations and insights\n🗣️ **Status Updates**: Announces when agents complete their analysis\n⚙️ **Easy Control**: Click the microphone button to enable/disable\n\nARIA makes complex pharmaceutical data more accessible and helps during presentations!";
    }
    
    if (lowerMessage.includes('export') || lowerMessage.includes('report')) {
      return "**Professional Export Options**:\n\n📄 **PDF Reports**: Interactive charts, market analysis, patent landscapes\n📊 **Excel Workbooks**: Multi-sheet detailed data, competitive analysis\n📋 **PowerPoint**: Presentation-ready slides for stakeholder meetings\n\nAll exports include your CureCoders branding and professional pharmaceutical styling!";
    }
    
    if (lowerMessage.includes('document') || lowerMessage.includes('upload')) {
      return "**Document Management**:\n\n📁 **Supported Formats**: PDF, Word, Excel, PowerPoint, text files\n🎯 **AI Integration**: Extracts insights and integrates with research queries\n💾 **Secure Storage**: Documents stored locally for privacy\n🔍 **Smart Analysis**: AI analyzes your internal documents alongside external data\n\nJust drag & drop files or use the upload button below!";
    }

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        return "I'm here to help! Ask me about CureCoders features, pharmaceutical research, or how to use the platform. For technical questions, I can guide you through the multi-agent system, voice assistant, or export options.";
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful AI assistant for CureCoders, a pharmaceutical intelligence platform. Context about the platform: ${appKnowledge}

User question: ${userMessage}

Provide a helpful, concise response. If it's about the platform, use the context above. For general questions, provide accurate information. Keep responses conversational and helpful.`
            }]
          }]
        })
      });

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 
        "I'm here to help with CureCoders! Ask me about features, pharmaceutical research, or general questions.";
    } catch (error) {
      return "I'm your CureCoders assistant! I can help with:\n\n• Platform features and how to use them\n• Pharmaceutical research guidance\n• Multi-agent AI system explanation\n• Voice assistant and export options\n• General questions about drug discovery\n\nWhat would you like to know?";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await getChatbotResponse(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      
      if (isEnabled) {
        speak(response, { rate: 0.9, pitch: 1.0 });
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm here to help! Ask me about CureCoders features, pharmaceutical research, or how to use the platform.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "How do I use the platform?",
    "What are the AI agents?",
    "How to export reports?",
    "Tell me about voice assistant",
    "Document upload help"
  ];

  return (
    <>
      {/* Inline Button - Always visible in position */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group"
      >
        <div className="relative">
          <Bot className="w-6 h-6" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white"></div>
        </div>
        <span className="text-lg">AI Chat Assistant</span>
        <MessageCircle className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div 
            className={`${isExpanded ? 'w-full h-full max-w-none' : 'w-full max-w-lg h-[600px]'} bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/30 dark:via-teal-900/30 dark:to-cyan-900/30">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-xl shadow-lg">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">AI Chat Assistant</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">CureCoders Help & Support</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {messages.length > 1 && (
                  <button
                    onClick={clearHistory}
                    className="p-2.5 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                    title="Clear chat history"
                  >
                    <Trash2 className="w-5 h-5 text-slate-600 dark:text-slate-400 hover:text-orange-500" />
                  </button>
                )}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2.5 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 rounded-lg transition-colors"
                  title={isExpanded ? "Minimize" : "Expand"}
                >
                  {isExpanded ? <Minimize2 className="w-5 h-5 text-slate-600 dark:text-slate-400" /> : <Maximize2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors group"
                  title="Close"
                >
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-red-500" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${message.sender === 'user' ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-md border border-slate-100 dark:border-slate-700'} rounded-2xl px-4 py-3`}>
                    <div className="flex items-start space-x-2">
                      {message.sender === 'bot' && (
                        <Bot className="w-5 h-5 mt-0.5 text-teal-500 flex-shrink-0" />
                      )}
                      {message.sender === 'user' && (
                        <User className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                        <div className={`text-xs mt-2 ${message.sender === 'user' ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-md border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-5 h-5 text-teal-500" />
                      <div className="flex space-x-1.5">
                        <div className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-bounce"></div>
                        <div className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                        <div className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length === 1 && !isLoading && (
              <div className="px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-semibold uppercase tracking-wide">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInputValue(question)}
                      className="text-xs px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-teal-100 dark:hover:bg-teal-900/30 hover:text-teal-700 dark:hover:text-teal-400 rounded-full transition-all duration-200 border border-transparent hover:border-teal-300 dark:hover:border-teal-800 font-medium"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                {/* Voice toggle button */}
                <button
                  onClick={toggleVoice}
                  className={`flex-shrink-0 p-3 rounded-xl transition-all duration-200 ${
                    isEnabled 
                      ? isSpeaking
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-500'
                        : 'bg-teal-100 dark:bg-teal-900/30 text-teal-500'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                  title={isEnabled ? (isSpeaking ? 'Speaking...' : 'Voice enabled') : 'Enable voice'}
                >
                  {isEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>
                
                {/* Input Field */}
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about CureCoders..."
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
                    disabled={isLoading}
                  />
                </div>
                
                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="flex-shrink-0 p-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 disabled:from-slate-300 disabled:to-slate-400 dark:disabled:from-slate-600 dark:disabled:to-slate-700 text-white rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:scale-100"
                  title="Send message"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              
              {/* Voice status indicator */}
              {isEnabled && (
                <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 dark:text-slate-400">
                  <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></div>
                  <span>{isSpeaking ? 'ARIA is speaking...' : 'Voice assistant ready'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;