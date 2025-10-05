import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface VoiceAssistantContextType {
  isEnabled: boolean;
  isSpeaking: boolean;
  toggleVoice: () => void;
  speak: (text: string, options?: SpeechOptions) => void;
  stopSpeaking: () => void;
  speakWelcome: () => void;
  speakFeature: (feature: string) => void;
  speakChartExplanation: (chartData: any) => void;
}

interface SpeechOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  interrupt?: boolean;
}

const VoiceAssistantContext = createContext<VoiceAssistantContextType | undefined>(undefined);

export const useVoiceAssistant = () => {
  const context = useContext(VoiceAssistantContext);
  if (!context) {
    throw new Error('useVoiceAssistant must be used within VoiceAssistantProvider');
  }
  return context;
};

interface VoiceAssistantProviderProps {
  children: React.ReactNode;
}

export const VoiceAssistantProvider: React.FC<VoiceAssistantProviderProps> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(() => {
    // Safe client-side initialization for Vercel
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('curecoders_voice_enabled');
      return saved ? JSON.parse(saved) : false;
    }
    return false; // Default to disabled for SSR
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [synth] = useState(() => typeof window !== 'undefined' ? window.speechSynthesis : null);

  useEffect(() => {
    localStorage.setItem('curecoders_voice_enabled', JSON.stringify(isEnabled));
  }, [isEnabled]);

  useEffect(() => {
    // Clean up any ongoing speech when component unmounts
    return () => {
      if (synth) {
        synth.cancel();
      }
    };
  }, [synth]);

  const toggleVoice = useCallback(() => {
    setIsEnabled(!isEnabled);
    if (!isEnabled) {
      // Welcome message when first enabled
      setTimeout(() => {
        speak("Hello! I'm ARIA, your AI pharmaceutical research assistant. I'm here to guide you through CureCoders platform.", {
          interrupt: true
        });
      }, 500);
    } else {
      stopSpeaking();
    }
  }, [isEnabled]);

  const speak = useCallback((text: string, options: SpeechOptions = {}) => {
    if (!isEnabled || !synth) return;

    if (options.interrupt) {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings for professional pharmaceutical assistant
    utterance.rate = options.rate || 0.9; // Slightly slower for clarity
    utterance.pitch = options.pitch || 1.1; // Slightly higher for friendliness
    utterance.volume = options.volume || 0.8; // Not too loud

    // Try to use a professional female voice
    const voices = synth.getVoices();
    const preferredVoices = voices.filter(voice => 
      voice.name.includes('Google UK English Female') ||
      voice.name.includes('Microsoft Zira') ||
      voice.name.includes('Alex') ||
      voice.lang.includes('en-US') || voice.lang.includes('en-GB')
    );
    
    if (preferredVoices.length > 0) {
      utterance.voice = preferredVoices[0];
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synth.speak(utterance);
  }, [isEnabled, synth]);

  const stopSpeaking = useCallback(() => {
    if (synth) {
      synth.cancel();
      setIsSpeaking(false);
    }
  }, [synth]);

  const speakWelcome = useCallback(() => {
    const welcomeMessage = `Welcome to CureCoders Pharmaceutical Intelligence Platform! 
    I'm ARIA, your AI research assistant. I can help you navigate through market intelligence, 
    patent analysis, clinical data, and generate comprehensive reports. 
    Try asking me about any pharmaceutical topic, or let me guide you through the platform features.`;
    
    speak(welcomeMessage, { interrupt: true });
  }, [speak]);

  const speakFeature = useCallback((feature: string) => {
    const featureExplanations: Record<string, string> = {
      'market-intelligence': 'Market Intelligence provides comprehensive analysis of pharmaceutical markets, including market size, growth trends, and competitive landscape. Use this to understand market opportunities and competitive positioning.',
      
      'patent-analysis': 'Patent Analysis helps you explore intellectual property landscapes, patent expiration dates, and freedom to operate assessments. This is crucial for R&D strategy and competitive intelligence.',
      
      'clinical-data': 'Clinical Data section aggregates information about ongoing and completed clinical trials, including trial phases, endpoints, and regulatory status. Essential for pipeline analysis.',
      
      'document-upload': 'Document Upload allows you to analyze your internal documents using AI. Simply drag and drop files, and I will extract key insights and integrate them with your research queries.',
      
      'advanced-search': 'Advanced Search helps you find specific information across your research history. You can filter by date ranges, keywords, and agent types to quickly locate relevant insights.',
      
      'export-reports': 'Export features let you create professional reports in PDF, Excel, and PowerPoint formats. PDFs include interactive charts, Excel has multi-sheet analysis, and PowerPoint presentations are ready for stakeholders.',
      
      'theme-toggle': 'Theme toggle switches between light and dark modes for comfortable viewing during long research sessions. Your preference is saved automatically.',
      
      'document-manager': 'Document Manager helps you organize and access all your uploaded files. You can preview, download, or reuse documents for new analyses.',
      
      'default': 'This feature helps streamline your pharmaceutical research workflow. Hover over different sections to learn more about specific capabilities.'
    };

    const explanation = featureExplanations[feature] || featureExplanations['default'];
    speak(explanation);
  }, [speak]);

  const speakChartExplanation = useCallback((chartData: any) => {
    if (!chartData) return;
    
    let explanation = '';
    
    if (chartData.type === 'market-analysis') {
      explanation = `This market analysis shows key metrics for your pharmaceutical research. 
      The market size is ${chartData.marketSize || 'substantial'}, with a compound annual growth rate of ${chartData.cagr || 'strong growth'}. 
      Key competitors and their market positions are displayed in the charts below.`;
    } else if (chartData.type === 'patent-landscape') {
      explanation = `The patent landscape analysis reveals ${chartData.patentCount || 'multiple'} relevant patents. 
      Risk levels are categorized as high, medium, and low based on potential infringement concerns. 
      This information is crucial for your freedom to operate assessment.`;
    } else if (chartData.type === 'clinical-trials') {
      explanation = `Clinical trial data shows the distribution of trials across different phases. 
      Phase ${chartData.dominantPhase || 'information'} trials are most prevalent, indicating the maturity of development programs in this therapeutic area.`;
    } else {
      explanation = `This chart presents key insights from your pharmaceutical research query. 
      The data has been analyzed by our AI agents to highlight the most important trends and opportunities for your consideration.`;
    }
    
    speak(explanation);
  }, [speak]);

  const value = {
    isEnabled,
    isSpeaking,
    toggleVoice,
    speak,
    stopSpeaking,
    speakWelcome,
    speakFeature,
    speakChartExplanation,
  };

  return (
    <VoiceAssistantContext.Provider value={value}>
      {children}
    </VoiceAssistantContext.Provider>
  );
};