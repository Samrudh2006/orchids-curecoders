import React, { useState, useEffect } from 'react';
import { useVoiceAssistant } from '../context/VoiceAssistantContext';
import { Mic, MicOff, Settings, X, Check } from './Icons';

interface VoicePreferences {
  generalGuidance: boolean;
  featureExplanations: boolean;
  agentProgress: boolean;
  chartNarration: boolean;
  welcomeMessages: boolean;
}

const VoiceAssistantSettings: React.FC = () => {
  const { isEnabled, isSpeaking, toggleVoice, speak } = useVoiceAssistant();
  const [showSettings, setShowSettings] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [preferences, setPreferences] = useState<VoicePreferences>({
    generalGuidance: true,
    featureExplanations: true,
    agentProgress: true,
    chartNarration: true,
    welcomeMessages: true,
  });

  useEffect(() => {
    // Load preferences from localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedPrefs = localStorage.getItem('curecoders_voice_preferences');
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }
      
      // Check if should show welcome
      const hasSeenWelcome = localStorage.getItem('curecoders_voice_welcome_shown');
      if (!hasSeenWelcome && !isEnabled) {
        setShowWelcome(true);
      }
    }
  }, [isEnabled]);

  const updatePreference = (key: keyof VoicePreferences, value: boolean) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    localStorage.setItem('curecoders_voice_preferences', JSON.stringify(newPrefs));
    
    // Provide audio feedback
    if (isEnabled) {
      const prefNames: Record<keyof VoicePreferences, string> = {
        generalGuidance: 'General platform guidance',
        featureExplanations: 'Feature explanations on hover',
        agentProgress: 'Agent progress announcements',
        chartNarration: 'Chart and data narration',
        welcomeMessages: 'Welcome messages for new sections'
      };
      
      speak(`${prefNames[key]} ${value ? 'enabled' : 'disabled'}.`);
    }
  };

  const handleEnableVoice = () => {
    toggleVoice();
    setShowWelcome(false);
    localStorage.setItem('curecoders_voice_welcome_shown', 'true');
    
    // Welcome message
    setTimeout(() => {
      if (!isEnabled) { // Will be enabled after toggle
        speak("Welcome to CureCoders! I'm ARIA, your pharmaceutical research assistant. I'll guide you through the platform and explain features as you explore. You can customize my assistance level anytime.");
      }
    }, 500);
  };

  const handleDismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('curecoders_voice_welcome_shown', 'true');
  };

  // Welcome notification
  if (showWelcome) {
    return (
      <div className="fixed bottom-24 right-6 z-[60] max-w-sm animate-slide-in-right">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 rounded-xl shadow-2xl border border-cyan-300">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg">Meet ARIA</h4>
              <p className="text-cyan-100 text-sm mt-1">
                Your pharmaceutical research assistant is ready to help! Enable voice guidance based on your interests.
              </p>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleEnableVoice}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                >
                  Enable Voice
                </button>
                <button
                  onClick={handleDismissWelcome}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
            <button
              onClick={handleDismissWelcome}
              className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Settings panel
  if (showSettings) {
    return (
      <div className="fixed bottom-6 right-6 z-[60]">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-white">Voice Assistant Preferences</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-700 dark:text-slate-300">Voice Assistant</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Master control for all voice features</div>
              </div>
              <button
                onClick={toggleVoice}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  isEnabled 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-md' 
                    : 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-md'
                }`}
              >
                {isEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>

            {isEnabled && (
              <>
                <hr className="border-slate-200 dark:border-slate-700" />
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Customize what you'd like to hear:
                </div>

                {Object.entries(preferences).map(([key, value]) => {
                  const labels: Record<keyof VoicePreferences, { title: string; description: string }> = {
                    generalGuidance: {
                      title: 'Platform Guidance',
                      description: 'Welcome messages and general navigation help'
                    },
                    featureExplanations: {
                      title: 'Feature Explanations',
                      description: 'Descriptions when hovering over buttons and features'
                    },
                    agentProgress: {
                      title: 'Agent Progress',
                      description: 'Announcements when AI agents complete analysis'
                    },
                    chartNarration: {
                      title: 'Chart Narration',
                      description: 'Explanations of data visualizations and insights'
                    },
                    welcomeMessages: {
                      title: 'Section Welcomes',
                      description: 'Introductions when navigating to new pages'
                    }
                  };

                  const label = labels[key as keyof VoicePreferences];
                  
                  return (
                    <div key={key} className="flex items-start justify-between py-2">
                      <div className="flex-1 mr-3">
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {label.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {label.description}
                        </div>
                      </div>
                      <button
                        onClick={() => updatePreference(key as keyof VoicePreferences, !value)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          value ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    💡 Tip: Disable features you don't need to customize your experience
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main voice assistant button
  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <div className="flex items-center gap-3 p-2 bg-slate-800/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full shadow-2xl border border-slate-700">
        {/* Settings button */}
        <button
          onClick={() => setShowSettings(true)}
          className="p-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-full transition-all duration-200 hover:scale-105"
          title="Voice Assistant Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Main voice button */}
        <button
          onClick={toggleVoice}
          className={`p-3 rounded-full transition-all duration-200 hover:scale-105 ${
            isEnabled
              ? isSpeaking
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white animate-pulse'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700'
              : 'bg-slate-600 hover:bg-slate-500 text-slate-300'
          }`}
          title={isEnabled ? (isSpeaking ? 'ARIA is speaking...' : 'ARIA is ready - Click to disable') : 'Enable voice assistant'}
        >
          {isEnabled ? (
            isSpeaking ? (
              <div className="flex items-center">
                <Mic className="w-5 h-5" />
                <div className="ml-1 flex space-x-0.5">
                  <div className="w-1 h-3 bg-white rounded-full animate-bounce"></div>
                  <div className="w-1 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            ) : (
              <Mic className="w-5 h-5" />
            )
          ) : (
            <MicOff className="w-5 h-5" />
          )}
        </button>
      </div>
      
      {/* Status indicator */}
      {isEnabled && (
        <div className="absolute -top-1 -right-1">
          <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800 animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistantSettings;