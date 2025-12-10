import React, { useState } from 'react';
import { Mic, X } from './Icons';
import { useVoiceAssistant } from '../context/VoiceAssistantContext';

interface Feature {
  id: string;
  icon: string;
  label: string;
  description: string;
}

const ARIA_FEATURES: Feature[] = [
  {
    id: 'platform-intro',
    icon: '🎯',
    label: 'Platform Introduction',
    description: 'CureCoders is an AI-powered pharmaceutical intelligence platform. Our multi-agent system analyzes market data, patents, clinical trials, and competitive intelligence to provide comprehensive insights for drug discovery and pharmaceutical research.'
  },
  {
    id: 'key-features',
    icon: '🚀',
    label: 'Key Features Overview',
    description: 'Key features include: Multi-Agent AI Analysis for market, patents, clinical trials, and competitive data. Professional PDF, Excel and PowerPoint exports. Document management with drag-and-drop upload. Voice-guided assistance and dark/light theme support.'
  },
  {
    id: 'demo-guide',
    icon: '🔥',
    label: 'Quick Demo Guide',
    description: 'To get started: Enter a pharmaceutical query like "diabetes drug market analysis". Watch as AI agents gather insights. Review the comprehensive dashboard with charts. Export professional reports for your stakeholders.'
  },
  {
    id: 'help-support',
    icon: '💡',
    label: 'Help & Support',
    description: 'Need help? Use the quick query templates below for instant analysis. Upload your internal documents for AI-powered insights. Access your search history anytime. Contact our support team for advanced assistance.'
  }
];

const ARIAFloatingPanel: React.FC = () => {
  const { speak, isSpeaking, stopSpeaking, isEnabled } = useVoiceAssistant();
  const [isOpen, setIsOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const handleFeatureClick = (feature: Feature) => {
    setActiveFeature(feature.id);
    if (isEnabled) {
      speak(feature.description, { rate: 0.9, pitch: 1.0 });
    }
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setActiveFeature(null);
  };

  return (
    <div className="relative">
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group relative"
      >
        <Mic className="w-6 h-6" />
        {isEnabled && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="absolute bottom-16 left-0 w-80 bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <span className="font-bold text-white text-lg">ARIA Voice Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                <div className={`w-1 h-4 rounded-full ${isSpeaking ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`}></div>
                <div className={`w-1 h-5 rounded-full ${isSpeaking ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} style={{ animationDelay: '0.1s' }}></div>
                <div className={`w-1 h-3 rounded-full ${isSpeaking ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isSpeaking ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                {isSpeaking ? 'Speaking' : 'Active'}
              </span>
            </div>
          </div>

          {/* Features List */}
          <div className="p-3 space-y-2">
            {ARIA_FEATURES.map((feature) => (
              <button
                key={feature.id}
                onClick={() => handleFeatureClick(feature)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                  activeFeature === feature.id
                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 hover:text-white border border-transparent'
                }`}
              >
                <span className="text-xl">{feature.icon}</span>
                <span className="font-medium">{feature.label}</span>
              </button>
            ))}
          </div>

          {/* Stop Speaking Button */}
          {isSpeaking && (
            <div className="px-3 pb-3">
              <button
                onClick={handleStopSpeaking}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors border border-red-500/30"
              >
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Stop Speaking
              </button>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-slate-400 hover:text-white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ARIAFloatingPanel;
