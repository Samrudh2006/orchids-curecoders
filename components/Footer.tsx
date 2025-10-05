import React, { useState } from 'react';
import { Logo } from '../assets/logo';
import { ExternalLink, Microscope, BrainCircuit, Globe } from './Icons';
import FooterModals from './FooterModals';

const Footer = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (modalId: string) => {
    setActiveModal(modalId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };
  return (
    <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-white mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <Logo className="w-12 h-12" />
              <div>
                <h3 className="text-2xl font-bold text-white">CureCoders</h3>
                <p className="text-cyan-300 text-sm font-medium">Pharmaceutical Intelligence Platform</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed max-w-md">
              Empowering pharmaceutical research with AI-driven insights. Accelerating drug discovery 
              through intelligent data analysis, market intelligence, and competitive research.
            </p>
            <div className="flex items-center space-x-4 mt-6">
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <BrainCircuit className="w-4 h-4 text-cyan-400" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <Microscope className="w-4 h-4 text-cyan-400" />
                <span>Research Grade</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Global Data</span>
              </div>
            </div>
          </div>

          {/* Platform Features */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Platform Features</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="hover:text-cyan-300 transition-colors cursor-pointer hover:translate-x-1 transform duration-200">Market Intelligence</li>
              <li className="hover:text-cyan-300 transition-colors cursor-pointer hover:translate-x-1 transform duration-200">Patent Analysis</li>
              <li className="hover:text-cyan-300 transition-colors cursor-pointer hover:translate-x-1 transform duration-200">Clinical Data</li>
              <li className="hover:text-cyan-300 transition-colors cursor-pointer hover:translate-x-1 transform duration-200">Competitive Research</li>
              <li className="hover:text-cyan-300 transition-colors cursor-pointer hover:translate-x-1 transform duration-200">Document Analysis</li>
              <li className="hover:text-cyan-300 transition-colors cursor-pointer hover:translate-x-1 transform duration-200">Advanced Reporting</li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Resources</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li 
                onClick={() => openModal('api-docs')}
                className="hover:text-cyan-300 transition-colors cursor-pointer hover:translate-x-1 transform duration-200 flex items-center group"
              >
                API Documentation
                <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </li>
              <li 
                onClick={() => openModal('user-guide')}
                className="hover:text-cyan-300 transition-colors cursor-pointer hover:translate-x-1 transform duration-200 flex items-center group"
              >
                User Guide
                <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </li>
              <li 
                onClick={() => openModal('research-methods')}
                className="hover:text-cyan-300 transition-colors cursor-pointer hover:translate-x-1 transform duration-200 flex items-center group"
              >
                Research Methods
                <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </li>
              <li 
                onClick={() => openModal('data-sources')}
                className="hover:text-cyan-300 transition-colors cursor-pointer hover:translate-x-1 transform duration-200 flex items-center group"
              >
                Data Sources
                <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </li>
              <li 
                onClick={() => openModal('security')}
                className="hover:text-cyan-300 transition-colors cursor-pointer hover:translate-x-1 transform duration-200 flex items-center group"
              >
                Security & Privacy
                <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </li>
              <li 
                onClick={() => openModal('support')}
                className="hover:text-cyan-300 transition-colors cursor-pointer hover:translate-x-1 transform duration-200 flex items-center group"
              >
                Support Center
                <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700"></div>

        {/* Bottom Footer */}
        <div className="py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            
            {/* Copyright & Legal */}
            <div className="text-sm text-slate-400 text-center lg:text-left">
              <p className="mb-2">
                © {new Date().getFullYear()} <span className="text-cyan-300 font-semibold">CureCoders</span>. All rights reserved.
              </p>
              <p className="text-xs">
                <span className="inline-flex items-center space-x-1">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                  <span className="text-amber-300 font-medium">Demo Platform</span>
                </span>
                <span className="mx-2">•</span>
                <span>Research & Educational Use</span>
                <span className="mx-2">•</span>
                <span>Not for Commercial Decisions</span>
              </p>
            </div>

            {/* Technology Stack */}
            <div className="text-sm text-slate-400 text-center lg:text-right">
              <p className="mb-2 text-cyan-300 font-medium">Powered by Advanced Technologies</p>
              <div className="flex flex-wrap justify-center lg:justify-end items-center space-x-4 text-xs">
                <a 
                  href="https://react.dev" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 hover:text-cyan-300 transition-colors"
                >
                  <span>React 19</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-slate-600">•</span>
                <a 
                  href="https://tailwindcss.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 hover:text-cyan-300 transition-colors"
                >
                  <span>Tailwind CSS</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-slate-600">•</span>
                <a 
                  href="https://ai.google.dev/gemini-api" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 hover:text-cyan-300 transition-colors"
                >
                  <span>Gemini AI</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-slate-600">•</span>
                <a 
                  href="https://www.chartjs.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 hover:text-cyan-300 transition-colors"
                >
                  <span>Chart.js</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 pt-6 border-t border-slate-700">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-xs text-slate-400 leading-relaxed text-center">
                <span className="text-amber-300 font-medium">⚠️ Research Platform Disclaimer:</span> This platform is designed for pharmaceutical research, 
                competitive intelligence, and educational purposes. All data, insights, and recommendations are for informational use only and should not 
                be used as the sole basis for investment, regulatory, or clinical decisions. Always consult with qualified professionals and verify 
                information through official sources. CureCoders aggregates publicly available data and provides AI-generated insights that may not 
                reflect the most current information or complete market conditions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Modals */}
      <FooterModals activeModal={activeModal} onClose={closeModal} />
    </footer>
  );
};

export default Footer;
