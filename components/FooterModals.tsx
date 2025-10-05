import React, { useState } from 'react';
import { X, ExternalLink, FileText, Shield, HelpCircle, Database, BookOpen, Settings } from './Icons';

interface ModalData {
  title: string;
  content: React.ReactNode;
  icon: React.ComponentType<any>;
}

const modals: Record<string, ModalData> = {
  'api-docs': {
    title: 'API Documentation',
    icon: FileText,
    content: (
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">CureCoders API v2.0</h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            RESTful API for pharmaceutical intelligence and market data access.
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Authentication</h5>
            <div className="bg-slate-100 dark:bg-slate-800 rounded p-3 font-mono text-sm">
              <div className="text-green-600">POST</div>
              <div className="text-slate-600 dark:text-slate-400">/api/v2/auth/token</div>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Market Intelligence</h5>
            <div className="bg-slate-100 dark:bg-slate-800 rounded p-3 font-mono text-sm">
              <div className="text-blue-600">GET</div>
              <div className="text-slate-600 dark:text-slate-400">/api/v2/market/{`{molecule_id}`}</div>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Patent Analysis</h5>
            <div className="bg-slate-100 dark:bg-slate-800 rounded p-3 font-mono text-sm">
              <div className="text-blue-600">GET</div>
              <div className="text-slate-600 dark:text-slate-400">/api/v2/patents/search?q={`{query}`}</div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <strong>Rate Limits:</strong> 1000 requests/hour for authenticated users
          </p>
        </div>
      </div>
    )
  },
  
  'user-guide': {
    title: 'User Guide',
    icon: BookOpen,
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4">
            <h5 className="font-semibold text-cyan-800 dark:text-cyan-200 mb-2">Getting Started</h5>
            <ul className="text-sm text-cyan-700 dark:text-cyan-300 space-y-1">
              <li>• Create your first query</li>
              <li>• Upload internal documents</li>
              <li>• Review AI agent results</li>
              <li>• Export professional reports</li>
            </ul>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <h5 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Advanced Features</h5>
            <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
              <li>• Multi-agent orchestration</li>
              <li>• Custom report templates</li>
              <li>• Data visualization</li>
              <li>• Historical analysis</li>
            </ul>
          </div>
        </div>
        
        <div>
          <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-3">Quick Tips</h5>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p>💡 <strong>Pro Tip:</strong> Use specific molecule names for better results</p>
            <p>📊 <strong>Reporting:</strong> Export to PDF with charts for presentations</p>
            <p>🔍 <strong>Search:</strong> Filter history by date ranges and keywords</p>
            <p>📁 <strong>Documents:</strong> Drag & drop files for instant analysis</p>
          </div>
        </div>
      </div>
    )
  },
  
  'research-methods': {
    title: 'Research Methods',
    icon: Database,
    content: (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4">
          <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Our Research Methodology</h5>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            CureCoders employs a multi-agent AI system to gather, analyze, and synthesize pharmaceutical intelligence.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h6 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Data Collection</h6>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>• Patent databases (USPTO, EPO, WIPO)</li>
              <li>• Clinical trial registries</li>
              <li>• Scientific publications</li>
              <li>• Market research reports</li>
              <li>• Regulatory filings</li>
            </ul>
          </div>
          
          <div>
            <h6 className="font-medium text-slate-800 dark:text-slate-200 mb-2">AI Analysis</h6>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>• Natural language processing</li>
              <li>• Competitive intelligence</li>
              <li>• Market trend analysis</li>
              <li>• Risk assessment</li>
              <li>• Opportunity identification</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <p className="text-xs text-amber-600 dark:text-amber-400">
            ⚠️ All methodologies are continuously updated based on latest pharmaceutical research standards and AI capabilities.
          </p>
        </div>
      </div>
    )
  },
  
  'data-sources': {
    title: 'Data Sources',
    icon: Database,
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h6 className="font-medium text-slate-800 dark:text-slate-200">Patents</h6>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">USPTO, EPO, WIPO</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <Settings className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h6 className="font-medium text-slate-800 dark:text-slate-200">Clinical</h6>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">ClinicalTrials.gov</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h6 className="font-medium text-slate-800 dark:text-slate-200">Literature</h6>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">PubMed, Scopus</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h6 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Primary Sources</h6>
            <div className="bg-slate-50 dark:bg-slate-800 rounded p-3 text-sm">
              <ul className="text-slate-600 dark:text-slate-400 space-y-1">
                <li>• FDA Orange Book & Purple Book</li>
                <li>• EMA European Public Assessment Reports</li>
                <li>• WHO Essential Medicines List</li>
                <li>• SEC filings and investor relations</li>
              </ul>
            </div>
          </div>
          
          <div>
            <h6 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Market Intelligence</h6>
            <div className="bg-slate-50 dark:bg-slate-800 rounded p-3 text-sm">
              <ul className="text-slate-600 dark:text-slate-400 space-y-1">
                <li>• IQVIA market data</li>
                <li>• GlobalData pharmaceutical reports</li>
                <li>• Company annual reports</li>
                <li>• Industry conference proceedings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  },
  
  'security': {
    title: 'Security & Privacy',
    icon: Shield,
    content: (
      <div className="space-y-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h5 className="font-semibold text-green-800 dark:text-green-200">Enterprise-Grade Security</h5>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300">
            Your data and research are protected with industry-leading security measures.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h6 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Data Protection</h6>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>• End-to-end encryption</li>
              <li>• Zero-trust architecture</li>
              <li>• Regular security audits</li>
              <li>• GDPR compliance</li>
            </ul>
          </div>
          
          <div>
            <h6 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Privacy Controls</h6>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>• Local data processing</li>
              <li>• No data sharing</li>
              <li>• Automatic data purging</li>
              <li>• User consent management</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <strong>Compliance:</strong> SOC 2 Type II, HIPAA, GDPR, CCPA
          </p>
        </div>
      </div>
    )
  },
  
  'support': {
    title: 'Support Center',
    icon: HelpCircle,
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <HelpCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h5 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">We're Here to Help</h5>
          <p className="text-slate-600 dark:text-slate-400">
            Get assistance with your pharmaceutical research questions
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h6 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Technical Support</h6>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              Platform issues, API questions, integration help
            </p>
            <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors">
              Contact Technical Team
            </button>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h6 className="font-medium text-green-800 dark:text-green-200 mb-2">Research Support</h6>
            <p className="text-sm text-green-700 dark:text-green-300 mb-3">
              Methodology questions, data interpretation
            </p>
            <button className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors">
              Contact Research Team
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          <h6 className="font-medium text-slate-800 dark:text-slate-200">Quick Links</h6>
          <div className="space-y-2 text-sm">
            <a href="#" className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline">
              <ExternalLink className="w-4 h-4" />
              <span>Knowledge Base</span>
            </a>
            <a href="#" className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline">
              <ExternalLink className="w-4 h-4" />
              <span>Video Tutorials</span>
            </a>
            <a href="#" className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline">
              <ExternalLink className="w-4 h-4" />
              <span>Community Forum</span>
            </a>
          </div>
        </div>
      </div>
    )
  }
};

interface FooterModalsProps {
  activeModal: string | null;
  onClose: () => void;
}

const FooterModals: React.FC<FooterModalsProps> = ({ activeModal, onClose }) => {
  if (!activeModal || !modals[activeModal]) return null;

  const modal = modals[activeModal];
  const IconComponent = modal.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <IconComponent className="w-8 h-8" />
              <h2 className="text-2xl font-bold">{modal.title}</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-cyan-200 transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {modal.content}
        </div>
      </div>
    </div>
  );
};

export default FooterModals;