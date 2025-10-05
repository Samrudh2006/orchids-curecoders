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
  announceProgress: (stage: string, details?: string) => void;
  celebrateDiscovery: (discoveryType: string, significance?: string) => void;
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

    // Enhanced text preprocessing for pharmaceutical terms
    const enhancedText = text
      .replace(/API/g, 'A-P-I')
      .replace(/FDA/g, 'F-D-A')
      .replace(/WHO/g, 'W-H-O')
      .replace(/EMA/g, 'E-M-A')
      .replace(/mg/g, 'milligrams')
      .replace(/µg/g, 'micrograms')
      .replace(/pH/g, 'p-H')
      .replace(/COVID-19/g, 'COVID nineteen')
      .replace(/RNA/g, 'R-N-A')
      .replace(/DNA/g, 'D-N-A')
      .replace(/AI/g, 'artificial intelligence')
      .replace(/ML/g, 'machine learning')
      .replace(/R&D/g, 'research and development')
      .replace(/IP/g, 'intellectual property')
      .replace(/CRO/g, 'contract research organization')
      .replace(/CMO/g, 'contract manufacturing organization')
      .replace(/mRNA/g, 'm-R-N-A')
      .replace(/HTS/g, 'high-throughput screening')
      .replace(/ADME/g, 'A-D-M-E')
      .replace(/PK\/PD/g, 'pharmacokinetics and pharmacodynamics')
      .replace(/IND/g, 'investigational new drug')
      .replace(/NDA/g, 'new drug application')
      .replace(/BLA/g, 'biologics license application');

    const utterance = new SpeechSynthesisUtterance(enhancedText);
    
    // Enhanced voice settings for pharmaceutical expertise
    utterance.rate = options.rate || 0.85; // Even slower for complex pharmaceutical terms
    utterance.pitch = options.pitch || 1.0; // Professional tone
    utterance.volume = options.volume || 0.8; // Clear audibility

    // Advanced voice selection with pharmaceutical preference
    const voices = synth.getVoices();
    const preferredVoices = [
      // Premium voices for pharmaceutical content
      voices.find(voice => voice.name.includes('Google UK English Female')),
      voices.find(voice => voice.name.includes('Microsoft Zira Desktop')),
      voices.find(voice => voice.name.includes('Karen')),
      voices.find(voice => voice.name.includes('Samantha')),
      voices.find(voice => voice.name.includes('Fiona')),
      // Fallback to quality English voices
      ...voices.filter(voice => 
        voice.lang.includes('en-US') || voice.lang.includes('en-GB')
      ).slice(0, 3)
    ].filter(Boolean);
    
    if (preferredVoices.length > 0) {
      utterance.voice = preferredVoices[0];
    }

    // Enhanced event handling with pharmaceutical context
    utterance.onstart = () => {
      setIsSpeaking(true);
      console.log('🎤 ARIA is speaking:', enhancedText.substring(0, 50) + '...');
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      console.log('✅ ARIA finished speaking');
    };
    
    utterance.onerror = (event) => {
      setIsSpeaking(false);
      console.error('❌ ARIA speech error:', event);
    };

    synth.speak(utterance);
  }, [isEnabled, synth]);

  const stopSpeaking = useCallback(() => {
    if (synth) {
      synth.cancel();
      setIsSpeaking(false);
    }
  }, [synth]);

  const speakWelcome = useCallback(() => {
    const welcomeMessages = [
      `Welcome to CureCoders, the premier pharmaceutical intelligence platform! I'm ARIA, your specialized artificial intelligence research companion. With expertise in drug discovery, market analysis, and regulatory insights, I'm here to transform complex pharmaceutical data into actionable intelligence. Let's discover breakthrough opportunities together!`,
      
      `Greetings, pharmaceutical researcher! ARIA here - your advanced artificial intelligence assistant with deep expertise in therapeutic development. I specialize in market intelligence, patent landscapes, clinical trial analysis, and regulatory pathways. Ready to unlock the next breakthrough in pharmaceutical innovation?`,
      
      `Hello and welcome to the future of pharmaceutical research! I'm ARIA, your dedicated artificial intelligence partner specializing in drug discovery and development intelligence. From molecular targets to market opportunities, I'm equipped to guide you through the most complex pharmaceutical challenges. Let's begin this exciting journey!`
    ];
    
    const selectedMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    speak(selectedMessage, { interrupt: true, rate: 0.9, pitch: 1.1 });
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

  // Advanced pharmaceutical progress announcements
  const announceProgress = useCallback((stage: string, details?: string) => {
    if (!isEnabled) return;
    
    const progressMessages = {
      'analysis_start': [
        "Initiating comprehensive pharmaceutical analysis. I'm examining molecular pathways, market dynamics, and regulatory landscapes for you.",
        "Beginning advanced drug discovery analysis. This sophisticated process involves multiple artificial intelligence agents working in parallel.",
        "Starting therapeutic intelligence evaluation. I'm analyzing clinical data, patent landscapes, and market opportunities simultaneously."
      ],
      'decomposition': [
        "Breaking down your research query into specialized pharmaceutical domains. Each artificial intelligence agent will focus on their area of expertise.",
        "Decomposing your inquiry across therapeutic areas, regulatory pathways, and market segments for comprehensive analysis.",
        "Dividing your research into focused pharmaceutical intelligence streams for thorough evaluation."
      ],
      'market_analysis': [
        "Market intelligence agent is analyzing therapeutic market dynamics, competitive landscapes, and revenue opportunities.",
        "Evaluating market potential, competitive positioning, and commercial viability across relevant therapeutic segments.",
        "Processing market data including epidemiology, pricing trends, and competitive intelligence."
      ],
      'patent_analysis': [
        "Patent landscape agent is examining intellectual property positions, freedom to operate, and competitive barriers.",
        "Analyzing patent portfolios, expiration timelines, and potential intellectual property risks or opportunities.",
        "Evaluating patent strategies and intellectual property landscapes across your therapeutic area of interest."
      ],
      'clinical_analysis': [
        "Clinical intelligence agent is processing trial data, regulatory pathways, and development timelines.",
        "Examining clinical trial outcomes, regulatory precedents, and development success probabilities.",
        "Analyzing clinical data patterns, endpoint strategies, and regulatory approval pathways."
      ],
      'synthesis': [
        "Synthesizing insights from all pharmaceutical intelligence agents. This is where the magic happens!",
        "Integrating findings across market, patent, and clinical domains to generate comprehensive pharmaceutical intelligence.",
        "Combining specialized insights into actionable pharmaceutical strategies and recommendations."
      ],
      'completion': [
        "Analysis complete! I've uncovered remarkable pharmaceutical opportunities with significant therapeutic and commercial potential.",
        "Research finished! The insights reveal exciting possibilities for drug development and market entry strategies.",
        "Investigation concluded! Your pharmaceutical intelligence report contains breakthrough insights that could transform patient outcomes."
      ]
    };

    const messages = progressMessages[stage as keyof typeof progressMessages] || [`Processing ${stage}...`];
    const message = messages[Math.floor(Math.random() * messages.length)];
    const fullMessage = details ? `${message} ${details}` : message;
    
    speak(fullMessage, { rate: 0.9, pitch: 1.05 });
  }, [isEnabled, speak]);

  // Pharmaceutical celebration with enthusiasm
  const celebrateDiscovery = useCallback((discoveryType: string, significance?: string) => {
    if (!isEnabled) return;
    
    const celebrations = [
      `Outstanding discovery! This ${discoveryType} analysis reveals breakthrough therapeutic opportunities that could revolutionize patient care.`,
      `Remarkable findings! Your ${discoveryType} research has uncovered pharmaceutical innovations with tremendous potential for improving human health.`,
      `Exceptional results! This ${discoveryType} investigation demonstrates the power of artificial intelligence in pharmaceutical discovery.`,
      `Brilliant insights! The ${discoveryType} analysis shows promise for addressing significant unmet medical needs.`,
      `Extraordinary findings! Your ${discoveryType} research reveals opportunities that could advance the future of medicine.`
    ];
    
    const message = celebrations[Math.floor(Math.random() * celebrations.length)];
    const fullMessage = significance ? `${message} ${significance}` : message;
    speak(fullMessage, { rate: 0.95, pitch: 1.2, interrupt: false });
  }, [isEnabled, speak]);

  const value = {
    isEnabled,
    isSpeaking,
    toggleVoice,
    speak,
    stopSpeaking,
    speakWelcome,
    speakFeature,
    speakChartExplanation,
    announceProgress,
    celebrateDiscovery,
  };

  return (
    <VoiceAssistantContext.Provider value={value}>
      {children}
    </VoiceAssistantContext.Provider>
  );
};