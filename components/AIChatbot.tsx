import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Minimize2, Maximize2, Bot, User, Sparkles } from './Icons';
import { useVoiceAssistant } from '../context/VoiceAssistantContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
}

const AIChatbot: React.FC = () => {
  const { speak, isEnabled } = useVoiceAssistant();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI assistant for CureCoders pharmaceutical platform. I can help you with questions about drug discovery, market analysis, document uploads, and navigating our features. What would you like to know?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getChatbotResponse = async (userMessage: string): Promise<string> => {
    // Enhanced knowledge base for comprehensive responses
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

    // Check for app-specific questions first
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

    // For general questions, use Gemini API
    try {
      const apiKey = process.env.GEMINI_API_KEY;
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
      
      // Enhanced ARIA voice response
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

  if (isMinimized) {
    return (
      <div className="fixed bottom-24 right-4 z-40">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <Bot className="w-5 h-5" />
          <span className="font-medium">AI Help</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed ${isExpanded ? 'inset-4' : 'bottom-4 right-4 w-96 h-[500px]'} bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-40 flex flex-col transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-t-xl">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200">AI Assistant</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">CureCoders Help & Support</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${message.sender === 'user' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'} rounded-2xl px-4 py-3`}>
              <div className="flex items-start space-x-2">
                {message.sender === 'bot' && (
                  <Bot className="w-4 h-4 mt-1 text-cyan-500 flex-shrink-0" />
                )}
                {message.sender === 'user' && (
                  <User className="w-4 h-4 mt-1 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                  <div className={`text-xs mt-2 ${message.sender === 'user' ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-cyan-500" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && !isLoading && (
        <div className="px-4 pb-2">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInputValue(question)}
                className="text-xs px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about CureCoders..."
            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;