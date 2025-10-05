import React, { useState, useEffect } from 'react';
import { useVoiceAssistant } from '../context/VoiceAssistantContext';

const VoiceAssistantUI: React.FC = () => {
  const { isEnabled, isSpeaking, toggleVoice, speak, stopSpeaking } = useVoiceAssistant();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Show welcome notification when first visiting (client-side only)
    if (typeof window !== 'undefined' && window.localStorage) {
      const hasSeenWelcome = localStorage.getItem('curecoders_voice_welcome_shown');
      if (!hasSeenWelcome) {
        setShowWelcome(true);
        localStorage.setItem('curecoders_voice_welcome_shown', 'true');
      }
    }
  }, []);

  const handleQuickCommands = (command: string) => {
    const commands: Record<string, string> = {
      'intro': "CureCoders is an AI-powered pharmaceutical intelligence platform. Use our multi-agent system to analyze markets, patents, clinical trials, and generate comprehensive reports for strategic decision making.",
      
      'features': "Key features include Market Intelligence for competitive analysis, Patent Analysis for IP landscape, Clinical Data for trial insights, Advanced Reporting with charts, Document Management, and Smart Search capabilities.",
      
      'help': "I can help you navigate the platform, explain features, provide voice guidance, and narrate research results. Try uploading a document, running a search query, or exploring the different agent capabilities.",
      
      'demo': "To see a demo, try entering a pharmaceutical query like 'diabetes drug market analysis' or 'COVID-19 vaccine patents'. I'll guide you through the multi-agent analysis process and explain the results."
    };

    speak(commands[command] || "I'm here to help with your pharmaceutical research. What would you like to know?");
  };

  if (showWelcome) {
    return (
      <div className="fixed top-4 right-4 z-50 max-w-sm animate-slide-in-right">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 rounded-xl shadow-2xl border border-cyan-300">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg">Meet ARIA 🎤</h4>
              <p className="text-cyan-100 text-sm mt-1">
                Your AI pharmaceutical research assistant is here to help! Enable voice guidance for a better experience.
              </p>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => {
                    toggleVoice();
                    setShowWelcome(false);
                  }}
                  className="bg-white text-cyan-600 px-3 py-1 rounded-lg text-xs font-medium hover:bg-cyan-50 transition-colors"
                >
                  Enable Voice
                </button>
                <button
                  onClick={() => setShowWelcome(false)}
                  className="text-cyan-100 hover:text-white px-3 py-1 text-xs transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowWelcome(false)}
              className="text-cyan-200 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Voice Assistant Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className={`transition-all duration-300 ${isExpanded ? 'mb-4' : ''}`}>
          {/* Quick Commands Panel */}
          {isExpanded && (
            <div className="mb-4 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 w-80 animate-scale-in">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">ARIA Voice Assistant</h4>
                <div className="flex items-center space-x-2">
                  {isSpeaking && (
                    <div className="flex space-x-1">
                      <div className="w-1 h-4 bg-cyan-500 rounded animate-pulse"></div>
                      <div className="w-1 h-4 bg-cyan-500 rounded animate-pulse" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-1 h-4 bg-cyan-500 rounded animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isEnabled ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {isEnabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => handleQuickCommands('intro')}
                  disabled={!isEnabled}
                  className="w-full text-left px-3 py-2 text-sm bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🎯 Platform Introduction
                </button>
                <button
                  onClick={() => handleQuickCommands('features')}
                  disabled={!isEnabled}
                  className="w-full text-left px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🚀 Key Features Overview
                </button>
                <button
                  onClick={() => handleQuickCommands('demo')}
                  disabled={!isEnabled}
                  className="w-full text-left px-3 py-2 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🎪 Quick Demo Guide
                </button>
                <button
                  onClick={() => handleQuickCommands('help')}
                  disabled={!isEnabled}
                  className="w-full text-left px-3 py-2 text-sm bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  💡 Help & Support
                </button>
              </div>

              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="w-full mt-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-sm font-medium"
                >
                  🛑 Stop Speaking
                </button>
              )}
            </div>
          )}

          {/* Main Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`relative w-16 h-16 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${
              isEnabled 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            {/* Microphone Icon */}
            <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
            </svg>

            {/* Speaking Animation */}
            {isSpeaking && (
              <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>
            )}

            {/* Enable/Disable Toggle */}
            <div className="absolute -top-2 -right-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVoice();
                }}
                className={`w-6 h-6 rounded-full border-2 border-white shadow-lg transition-all duration-200 ${
                  isEnabled 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}
                title={isEnabled ? 'Disable Voice Assistant' : 'Enable Voice Assistant'}
              >
                <div className={`w-2 h-2 bg-white rounded-full mx-auto transition-transform duration-200 ${
                  isEnabled ? 'scale-100' : 'scale-0'
                }`}></div>
              </button>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default VoiceAssistantUI;