import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useVoiceFeatures } from '../hooks/useVoiceFeatures';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  relatedQuery?: string;
  agentResults?: any;
}

interface ChatContextType {
  messages: ChatMessage[];
  isTyping: boolean;
  isChatOpen: boolean;
  toggleChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  suggestQueries: string[];
  linkToResearch: (queryId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const PHARMACEUTICAL_SUGGESTIONS = [
  "What are the latest oncology drug developments?",
  "Analyze the diabetes drug market landscape",
  "Show me COVID-19 vaccine patent status",
  "Compare immunotherapy clinical trials",
  "What are emerging biotech investment trends?",
  "Analyze Pfizer's pipeline and patents",
  "Show rare disease drug opportunities",
  "What are the top pharmaceutical acquisitions?",
  "Analyze biosimilar market competition",
  "Show regulatory approval trends"
];

const CHAT_RESPONSES = {
  greeting: "Hello! I'm ARIA, your AI pharmaceutical research assistant. I can help you explore drug markets, analyze patents, review clinical trials, and generate comprehensive research reports. What would you like to investigate today?",
  
  capabilities: "I can assist you with:\n• Market Intelligence & Competitive Analysis\n• Patent Landscape & IP Research\n• Clinical Trial Data & Pipeline Analysis\n• Regulatory Intelligence & Approval Trends\n• Drug Discovery & Development Insights\n• Financial Analysis & Investment Research\n\nJust ask me anything about pharmaceutical research!",
  
  howToUse: "To get started:\n1. Ask me a pharmaceutical research question\n2. I'll launch our multi-agent analysis system\n3. You'll get comprehensive insights with charts and data\n4. Export results as PDF, Excel, or PowerPoint\n\nTry asking: 'Analyze the diabetes drug market' or 'Show me oncology patents expiring in 2025'",
  
  examples: "Here are some example queries you can try:\n\n🧬 **Drug Discovery:**\n• 'Latest CRISPR therapeutic developments'\n• 'Alzheimer's drug pipeline analysis'\n\n💊 **Market Research:**\n• 'Global insulin market competition'\n• 'Biosimilar market opportunities'\n\n📊 **Patent Analysis:**\n• 'Expiring pharma patents 2024-2026'\n• 'mRNA technology patent landscape'\n\n🏥 **Clinical Trials:**\n• 'Phase 3 oncology trials recruiting'\n• 'COVID-19 treatment trial results'"
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      type: 'assistant',
      content: CHAT_RESPONSES.greeting,
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const { runMasterAgent } = useAppContext();
  const { speakWithContext } = useVoiceFeatures();

  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev);
  }, []);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const generateAIResponse = useCallback(async (userMessage: string): Promise<string> => {
    // Simulate AI thinking delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const lowerMessage = userMessage.toLowerCase();
    
    // Pattern matching for pharmaceutical queries
    if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('what can you do')) {
      return CHAT_RESPONSES.capabilities;
    }
    
    if (lowerMessage.includes('example') || lowerMessage.includes('suggest') || lowerMessage.includes('ideas')) {
      return CHAT_RESPONSES.examples;
    }
    
    if (lowerMessage.includes('how to use') || lowerMessage.includes('get started') || lowerMessage.includes('tutorial')) {
      return CHAT_RESPONSES.howToUse;
    }
    
    // Pharmaceutical research patterns
    if (lowerMessage.match(/(market|competition|competitive|landscape)/)) {
      return `Great question about market analysis! I can help you analyze pharmaceutical markets, competitive landscapes, and market opportunities. Let me launch our market intelligence agents to gather comprehensive data.\n\nWould you like me to run a full market analysis for "${userMessage}"? I'll provide:\n• Market size and growth projections\n• Key competitors and market share\n• Regulatory landscape\n• Investment opportunities\n• Strategic recommendations`;
    }
    
    if (lowerMessage.match(/(patent|ip|intellectual property|expir)/)) {
      return `Excellent! Patent analysis is crucial for pharmaceutical strategy. I can analyze patent landscapes, expiration dates, freedom to operate, and competitive IP positions.\n\nFor "${userMessage}", I can provide:\n• Patent landscape mapping\n• Expiration timeline analysis\n• Competitive patent strength\n• White space opportunities\n• Risk assessment\n\nShall I run the patent analysis agents?`;
    }
    
    if (lowerMessage.match(/(clinical|trial|phase|study|development)/)) {
      return `Perfect! Clinical trial intelligence is essential for understanding drug development pipelines. I can analyze trial data, development stages, and competitive programs.\n\nFor your query "${userMessage}", I'll analyze:\n• Active clinical trials by phase\n• Enrollment status and timelines\n• Competitive pipeline comparison\n• Regulatory milestone tracking\n• Success probability analysis\n\nReady to dive deep into the clinical data?`;
    }
    
    if (lowerMessage.match(/(drug|molecule|compound|therapeutic|treatment)/)) {
      return `Fantastic question about pharmaceutical development! I can provide comprehensive drug intelligence including mechanism of action, development status, competitive positioning, and market potential.\n\nFor "${userMessage}", I'll research:\n• Drug profile and mechanism\n• Development timeline and status\n• Market opportunity assessment\n• Competitive landscape\n• Regulatory pathway analysis\n\nLet me activate our pharmaceutical intelligence agents!`;
    }
    
    // Generic pharmaceutical response
    return `I understand you're interested in "${userMessage}". This looks like a valuable pharmaceutical research question!\n\nI can help you by:\n• Running our multi-agent analysis system\n• Gathering data from multiple pharmaceutical sources\n• Creating comprehensive visualizations and reports\n• Providing strategic insights and recommendations\n\nWould you like me to start the analysis? Just say "yes" or click "Run Analysis" and I'll launch our specialized pharmaceutical intelligence agents to investigate this thoroughly.`;
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    // Add user message
    addMessage({
      type: 'user',
      content
    });
    
    setIsTyping(true);
    
    try {
      // Check if this looks like a research query that should trigger agents
      const shouldRunAgents = content.toLowerCase().match(/(analyze|research|show|investigate|compare|market|patent|clinical|drug|competition)/);
      
      if (shouldRunAgents && content.length > 10) {
        // Add system message about running agents
        addMessage({
          type: 'system',
          content: '🤖 Launching multi-agent pharmaceutical analysis...'
        });
        
        // Trigger the actual agent system
        runMasterAgent(content);
        
        // Add response linking to the analysis
        setTimeout(() => {
          addMessage({
            type: 'assistant',
            content: `Perfect! I've launched our multi-agent system to analyze "${content}". \n\n🔬 **Active Agents:**\n• Market Intelligence Agent\n• Patent Analysis Agent  \n• Clinical Data Agent\n• Competitive Research Agent\n\nYou can watch the analysis progress in the main workspace. I'll notify you when all agents complete their research and provide comprehensive insights with interactive charts and professional reports.`,
            relatedQuery: content
          });
          setIsTyping(false);
        }, 1500);
        
        return;
      }
      
      // Generate AI response for general questions
      const response = await generateAIResponse(content);
      
      addMessage({
        type: 'assistant',
        content: response
      });
      
      // Speak response if voice is enabled
      speakWithContext(response, 'pharmaceutical');
      
    } catch (error) {
      addMessage({
        type: 'assistant',
        content: 'I apologize, but I encountered an issue processing your request. Please try again or contact support if the problem persists.'
      });
    } finally {
      setIsTyping(false);
    }
  }, [addMessage, generateAIResponse, runMasterAgent, speakWithContext]);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        type: 'assistant',
        content: CHAT_RESPONSES.greeting,
        timestamp: new Date()
      }
    ]);
  }, []);

  const linkToResearch = useCallback((queryId: string) => {
    // Implementation for linking chat to research results
    console.log('Linking to research:', queryId);
  }, []);

  const value: ChatContextType = {
    messages,
    isTyping,
    isChatOpen,
    toggleChat,
    sendMessage,
    clearChat,
    suggestQueries: PHARMACEUTICAL_SUGGESTIONS,
    linkToResearch
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};