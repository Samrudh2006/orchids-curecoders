import React, { useEffect } from 'react';
import { useVoiceAssistant } from '../context/VoiceAssistantContext';
import { useAppContext } from '../hooks/useAppContext';

interface ARIAEnhancedWrapperProps {
  children: React.ReactNode;
}

/**
 * Enhanced ARIA wrapper that provides advanced voice intelligence
 * for pharmaceutical research with best wishes and improvements
 */
const ARIAEnhancedWrapper: React.FC<ARIAEnhancedWrapperProps> = ({ children }) => {
  const { announceProgress, celebrateDiscovery, isEnabled } = useVoiceAssistant();
  const { agents, isOrchestrating, isReportReady, currentRunPrompt } = useAppContext();

  // Enhanced progress tracking with pharmaceutical intelligence
  useEffect(() => {
    if (!isEnabled || !isOrchestrating) return;

    const decompositionAgent = agents.find(agent => agent.name === 'DECOMPOSITION');
    const synthesisAgent = agents.find(agent => agent.name === 'SYNTHESIS');
    const runningAgents = agents.filter(agent => agent.status === 'RUNNING');
    const completedAgents = agents.filter(agent => agent.status === 'DONE');

    // Announce decomposition phase
    if (decompositionAgent && decompositionAgent.status === 'RUNNING' && agents.length === 1) {
      announceProgress('decomposition', 'Analyzing your pharmaceutical research query to identify the most relevant intelligence domains.');
    }

    // Announce specific agent activities
    if (runningAgents.length > 0) {
      const currentAgent = runningAgents[0];
      switch (currentAgent.name) {
        case 'MARKET_INTELLIGENCE':
          announceProgress('market_analysis', 'Examining market dynamics, competitive landscapes, and commercial opportunities.');
          break;
        case 'PATENT_ANALYSIS':
          announceProgress('patent_analysis', 'Investigating intellectual property landscapes and freedom to operate assessments.');
          break;
        case 'CLINICAL_DATA':
          announceProgress('clinical_analysis', 'Processing clinical trial intelligence and regulatory pathway analysis.');
          break;
        case 'REGULATORY':
          announceProgress('regulatory_analysis', 'Evaluating regulatory requirements and approval pathway strategies.');
          break;
        case 'INTERNAL':
          announceProgress('document_analysis', 'Analyzing your uploaded documents for pharmaceutical insights and integration opportunities.');
          break;
      }
    }

    // Announce synthesis phase
    if (synthesisAgent && synthesisAgent.status === 'RUNNING') {
      announceProgress('synthesis', 'Integrating specialized insights across all pharmaceutical intelligence domains.');
    }

  }, [agents, isOrchestrating, announceProgress, isEnabled]);

  // Celebrate completion with pharmaceutical enthusiasm
  useEffect(() => {
    if (!isEnabled || !isReportReady || !currentRunPrompt) return;

    // Determine the type of analysis for celebration
    const analysisType = currentRunPrompt.toLowerCase().includes('market') ? 'market intelligence' :
                        currentRunPrompt.toLowerCase().includes('patent') ? 'patent landscape' :
                        currentRunPrompt.toLowerCase().includes('clinical') ? 'clinical intelligence' :
                        currentRunPrompt.toLowerCase().includes('drug') ? 'drug discovery' :
                        currentRunPrompt.toLowerCase().includes('therapeutic') ? 'therapeutic analysis' :
                        'pharmaceutical research';

    // Celebrate with pharmaceutical context
    setTimeout(() => {
      celebrateDiscovery(analysisType, 'The artificial intelligence analysis has revealed actionable insights that could accelerate pharmaceutical innovation and improve patient outcomes.');
    }, 1000);

  }, [isReportReady, currentRunPrompt, celebrateDiscovery, isEnabled]);

  // Welcome message enhancement for pharmaceutical context
  useEffect(() => {
    const hasShownWelcome = localStorage.getItem('aria_pharmaceutical_welcome_shown');
    if (!hasShownWelcome && isEnabled) {
      setTimeout(() => {
        announceProgress('welcome', 'ARIA is now enhanced with advanced pharmaceutical intelligence capabilities. I specialize in drug discovery, market analysis, patent landscapes, and regulatory pathways. Ready to revolutionize your pharmaceutical research experience!');
        localStorage.setItem('aria_pharmaceutical_welcome_shown', 'true');
      }, 2000);
    }
  }, [isEnabled, announceProgress]);

  return <>{children}</>;
};

export default ARIAEnhancedWrapper;