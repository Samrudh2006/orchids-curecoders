import { useVoiceAssistant } from '../context/VoiceAssistantContext';

// Predefined voice explanations for different features
const VOICE_EXPLANATIONS = {
  // Navigation & UI
  'home': "You're on the CureCoders home page. This is where you can start new pharmaceutical research queries using our AI agent system.",
  
  'history': "The History page shows all your previous research queries and results. You can search, filter, and replay any analysis.",
  
  'workspace': "The Workspace is where the magic happens! Enter your pharmaceutical research query and watch our AI agents work together to gather comprehensive insights.",

  // Core Features
  'market-intelligence': "Market Intelligence analyzes pharmaceutical markets, including size, growth rates, competitive landscape, and key players. Essential for strategic planning and investment decisions.",
  
  'patent-analysis': "Patent Analysis explores intellectual property landscapes, expiration dates, freedom to operate, and competitive patent positions. Critical for R&D strategy and risk assessment.",
  
  'clinical-data': "Clinical Data aggregates information about clinical trials, including phases, endpoints, patient populations, and regulatory milestones. Vital for pipeline assessment.",
  
  'competitive-research': "Competitive Research provides insights into competitor strategies, product portfolios, market positioning, and competitive advantages in the pharmaceutical space.",
  
  'document-analysis': "Document Analysis uses AI to extract insights from your internal documents, presentations, and reports, integrating them with external market intelligence.",

  // Actions & Tools
  'file-upload': "Upload your internal documents here for AI analysis. Supported formats include PDF, Word, Excel, PowerPoint, and text files. I'll integrate the insights with your research queries.",
  
  'export-pdf': "Export creates professional PDF reports with interactive charts, market analysis, patent landscapes, and clinical trial data. Perfect for presentations and strategic reviews.",
  
  'export-excel': "Excel export generates multi-sheet workbooks with detailed data tables, competitive analysis, and market metrics. Ideal for further analysis and modeling.",
  
  'export-powerpoint': "PowerPoint export creates presentation-ready slides with your pharmaceutical research findings, charts, and key insights. Ready for stakeholder meetings.",
  
  'export-bookmarks': "Export Bookmarks lets you save your favorite research results and download them for future reference or sharing. Use this to keep track of key findings and insights across your projects.",
  
  'search-history': "Search through your research history using keywords, dates, or agent types. Quickly find and replay previous analyses or build upon existing insights.",
  
  'document-manager': "The Document Manager helps you organize, preview, and reuse uploaded files. All your documents are stored securely and remain accessible for future analyses.",

  // Agent Explanations
  'agents-working': "Our AI agents are now working on your query. Each agent specializes in different aspects: market data, patents, clinical trials, and competitive intelligence. This coordinated approach ensures comprehensive analysis.",
  
  'agent-done': "An agent has completed its analysis! The results include key findings, data visualizations, and strategic insights relevant to your pharmaceutical research query.",
  
  'synthesis-complete': "All agents have finished their work! I've synthesized their findings into a comprehensive summary highlighting the most important insights for your pharmaceutical research.",

  // Results & Charts
  'market-chart': "This market analysis chart shows key metrics including market size, growth projections, and competitive positioning. The data helps identify opportunities and strategic considerations.",
  
  'patent-chart': "The patent landscape chart visualizes intellectual property risks and opportunities. Different colors represent risk levels: green for low risk, yellow for medium, and red for high-risk patents.",
  
  'clinical-chart': "This clinical trial distribution chart shows the development pipeline across different phases. Higher numbers in later phases indicate more mature development programs.",
  
  'report-ready': "Your comprehensive pharmaceutical intelligence report is ready! It includes AI-generated insights, data visualizations, and strategic recommendations based on your query.",

  // Themes & Settings
  'theme-toggle': "Theme toggle switches between light and dark modes. Dark mode is easier on the eyes during long research sessions, while light mode provides crisp contrast for presentations.",
  
  'voice-enabled': "Voice assistance is now enabled! I can guide you through the platform, explain features, and narrate research results. You can disable this anytime using the voice button.",
  
  'voice-disabled': "Voice assistance is disabled. You can re-enable it anytime by clicking the microphone button in the bottom right corner.",

  // General Help
  'welcome': "Welcome to CureCoders! I'm ARIA, your AI pharmaceutical research assistant. I can help you navigate the platform, understand features, and interpret research results. Try starting with a pharmaceutical query or exploring the different sections.",
  
  'help': "I'm here to help with your pharmaceutical research! You can ask me to explain any feature, guide you through the analysis process, or clarify research results. Just hover over elements or click the voice assistant for guidance.",
  
  'demo-suggestion': "For a quick demo, try searching for topics like 'diabetes drug market', 'COVID-19 vaccine patents', or 'oncology clinical trials'. I'll guide you through the multi-agent analysis process!"
};

export const useVoiceFeatures = () => {
  const { speak, speakFeature, isEnabled } = useVoiceAssistant();

  // Speak predefined explanations
  const explainFeature = (featureKey: keyof typeof VOICE_EXPLANATIONS) => {
    if (!isEnabled) return;
    
    const explanation = VOICE_EXPLANATIONS[featureKey];
    if (explanation) {
      speak(explanation);
    }
  };

  // Speak custom text with pharmaceutical context
  const speakWithContext = (text: string, context?: string) => {
    if (!isEnabled) return;
    
    let contextualText = text;
    if (context === 'pharmaceutical') {
      contextualText = `From a pharmaceutical perspective: ${text}`;
    } else if (context === 'technical') {
      contextualText = `Technical note: ${text}`;
    } else if (context === 'insight') {
      contextualText = `Key insight: ${text}`;
    }
    
    speak(contextualText);
  };

  // Speak agent status updates
  const speakAgentStatus = (agentName: string, status: string, result?: any) => {
    if (!isEnabled) return;
    
    let message = '';
    switch (status.toLowerCase()) {
      case 'running':
        message = `The ${agentName} agent is now analyzing your pharmaceutical query. This may take a moment as I gather comprehensive market intelligence.`;
        break;
      case 'done':
        message = `The ${agentName} agent has completed its analysis! I've found valuable insights about market dynamics, competitive landscape, and strategic opportunities.`;
        break;
      case 'failed':
        message = `The ${agentName} agent encountered an issue during analysis. Don't worry, other agents are still working to provide you with comprehensive pharmaceutical insights.`;
        break;
      default:
        message = `The ${agentName} agent status has been updated to ${status}.`;
    }
    
    speak(message);
  };

  // Speak chart/data explanations
  const speakDataInsight = (dataType: string, data: any) => {
    if (!isEnabled) return;
    
    let insight = '';
    switch (dataType) {
      case 'market':
        insight = `Market analysis reveals ${data.marketSize ? `a market size of ${data.marketSize}` : 'significant market potential'} with ${data.cagr ? `${data.cagr} compound annual growth rate` : 'strong growth prospects'}. Key competitors and market dynamics are displayed in the visualizations.`;
        break;
      case 'patents':
        insight = `Patent landscape analysis shows ${data.totalPatents || 'multiple'} relevant patents with varying risk levels. This intellectual property assessment is crucial for your freedom to operate and R&D strategy.`;
        break;
      case 'clinical':
        insight = `Clinical pipeline analysis reveals trials across ${data.phases ? Object.keys(data.phases).length : 'multiple'} development phases. This indicates the maturity and competitive intensity of the therapeutic area.`;
        break;
      default:
        insight = 'The data analysis provides important insights for your pharmaceutical research strategy. Review the charts and summaries for detailed findings.';
    }
    
    speak(insight);
  };

  // Speak welcome messages for different sections
  const speakSectionWelcome = (section: string) => {
    if (!isEnabled) return;
    
    const welcomeMessages: Record<string, string> = {
      'workspace': "Welcome to the CureCoders Workspace! Enter your pharmaceutical research query to start multi-agent analysis. I'll guide you through the process and explain the results.",
      'history': "You're viewing your research history. Here you can search previous analyses, replay queries, and build upon past insights. Each entry shows the agents deployed and key findings.",
      'reports': "Your pharmaceutical intelligence reports are ready for review. I can explain the charts, summarize key findings, or guide you through the export options for professional presentations."
    };
    
    const message = welcomeMessages[section] || `Welcome to the ${section} section of CureCoders pharmaceutical intelligence platform.`;
    speak(message);
  };

  return {
    explainFeature,
    speakWithContext,
    speakAgentStatus,
    speakDataInsight,
    speakSectionWelcome,
    isVoiceEnabled: isEnabled
  };
};