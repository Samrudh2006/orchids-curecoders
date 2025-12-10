import React, { useState, useEffect } from 'react';

const agents = [
  {
    id: 'iqvia',
    name: 'IQVIA Agent',
    shortName: 'IQVIA',
    color: '#4F46E5',
    bgColor: 'bg-indigo-600',
    description: 'Market intelligence, sales data, prescription trends, competitor analysis',
    dataSource: 'IQVIA Database API',
    outputs: ['Market size estimates', 'Competitor market share', 'CAGR projections', 'Regional breakdowns'],
    techStack: ['REST API', 'Python', 'Pandas'],
  },
  {
    id: 'exim',
    name: 'EXIM Agent',
    shortName: 'EXIM',
    color: '#10B981',
    bgColor: 'bg-emerald-600',
    description: 'Import/export trade flows, API sourcing, supply chain intelligence',
    dataSource: 'EXIM Trade Database',
    outputs: ['Export volumes by country', 'Import dependencies', 'Top sourcing countries', 'Trade flow trends'],
    techStack: ['SQL', 'ETL Pipeline', 'BigQuery'],
  },
  {
    id: 'patent',
    name: 'Patent Agent',
    shortName: 'Patent',
    color: '#F59E0B',
    bgColor: 'bg-amber-500',
    description: 'Patent landscape analysis, expiry tracking, FTF risk assessment',
    dataSource: 'USPTO Patent Database',
    outputs: ['Patent listings', 'Expiry timelines', 'FTF risk ratings', 'Owner analysis'],
    techStack: ['USPTO API', 'NLP', 'Elasticsearch'],
  },
  {
    id: 'trials',
    name: 'Clinical Trials Agent',
    shortName: 'Trials',
    color: '#EF4444',
    bgColor: 'bg-red-500',
    description: 'Clinical trial intelligence, phase tracking, sponsor analysis',
    dataSource: 'ClinicalTrials.gov API',
    outputs: ['Active trials list', 'Phase distribution', 'Sponsor breakdown', 'Recruitment status'],
    techStack: ['REST API', 'GraphQL', 'PostgreSQL'],
  },
  {
    id: 'internal',
    name: 'Internal Docs Agent',
    shortName: 'Internal',
    color: '#8B5CF6',
    bgColor: 'bg-violet-600',
    description: 'Internal document parsing, knowledge extraction, summary generation',
    dataSource: 'Uploaded Documents',
    outputs: ['Document summaries', 'Key insights', 'Entity extraction', 'Topic clustering'],
    techStack: ['LangChain', 'RAG', 'Vector DB'],
  },
  {
    id: 'web',
    name: 'Web Intelligence Agent',
    shortName: 'Web',
    color: '#EC4899',
    bgColor: 'bg-pink-500',
    description: 'Real-time web signals, news monitoring, sentiment analysis',
    dataSource: 'Live Web Search',
    outputs: ['News articles', 'Sentiment scores', 'Trending topics', 'Social signals'],
    techStack: ['Tavily API', 'SERP', 'NLP'],
  },
  {
    id: 'report',
    name: 'Report Generator',
    shortName: 'Report',
    color: '#06B6D4',
    bgColor: 'bg-cyan-500',
    description: 'Synthesizes all agent outputs into comprehensive reports',
    dataSource: 'All Agent Outputs',
    outputs: ['PDF reports', 'Excel exports', 'Executive summaries', 'Visualizations'],
    techStack: ['jsPDF', 'SheetJS', 'Chart.js'],
  },
];

const dataSources = [
  { name: 'IQVIA Database', icon: '📊', color: '#4F46E5' },
  { name: 'USPTO Patents', icon: '📜', color: '#F59E0B' },
  { name: 'ClinicalTrials.gov', icon: '🔬', color: '#EF4444' },
  { name: 'EXIM Trade DB', icon: '🚢', color: '#10B981' },
  { name: 'Web/News APIs', icon: '🌐', color: '#EC4899' },
  { name: 'User Documents', icon: '📁', color: '#8B5CF6' },
];

const competitors = [
  { name: 'CureCoders', multiAgent: true, realtime: true, pharmaSpecific: true, customReports: true, voiceQuery: true, pricing: 'Custom', score: 95 },
  { name: 'Veeva Pulse', multiAgent: false, realtime: true, pharmaSpecific: true, customReports: true, voiceQuery: false, pricing: '$50K+/yr', score: 78 },
  { name: 'IQVIA Intelligence', multiAgent: false, realtime: false, pharmaSpecific: true, customReports: true, voiceQuery: false, pricing: '$100K+/yr', score: 72 },
  { name: 'ZS Analytics', multiAgent: false, realtime: false, pharmaSpecific: true, customReports: false, voiceQuery: false, pricing: '$75K+/yr', score: 68 },
  { name: 'Generic BI Tools', multiAgent: false, realtime: false, pharmaSpecific: false, customReports: true, voiceQuery: false, pricing: '$20K+/yr', score: 45 },
];

const apiStatuses = [
  { name: 'IQVIA API', status: 'operational', latency: '120ms' },
  { name: 'USPTO API', status: 'operational', latency: '85ms' },
  { name: 'ClinicalTrials.gov', status: 'operational', latency: '150ms' },
  { name: 'EXIM Database', status: 'operational', latency: '95ms' },
  { name: 'Tavily Search', status: 'operational', latency: '200ms' },
  { name: 'Gemini 1.5 Pro', status: 'operational', latency: '450ms' },
];

const Architecture: React.FC = () => {
  const [activeFlow, setActiveFlow] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFlow(prev => (prev + 1) % 5);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    const content = `
<!DOCTYPE html>
<html>
<head>
  <title>CureCoders Architecture</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; }
    h1 { color: #4F46E5; }
    .agent { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px; }
    .flow { background: #f5f5f5; padding: 20px; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>CureCoders Multi-Agent Architecture</h1>
  <p>A comprehensive pharmaceutical intelligence platform powered by 7 specialized AI agents.</p>
  <h2>Data Flow</h2>
  <div class="flow">User Query → NLP Decomposition → Master Orchestrator → 7 Worker Agents (Parallel) → Context Synthesis → Report Generation</div>
  <h2>Worker Agents</h2>
  ${agents.map(a => `<div class="agent"><strong>${a.name}</strong><br/>${a.description}<br/>Data: ${a.dataSource}</div>`).join('')}
  <h2>Technical Highlights</h2>
  <ul>
    <li>Parallel Processing: ~2.5s average response time</li>
    <li>Intelligent Routing: NLP-based agent selection</li>
    <li>Context Synthesis: RAG-powered result merging</li>
    <li>Multi-Format Export: PDF, Excel, Dashboard</li>
  </ul>
</body>
</html>`;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CureCoders_Architecture.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-12 print:bg-white print:text-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 print:text-indigo-600">
            System Architecture
          </h1>
          <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto print:text-gray-600">
            CureCoders employs a multi-agent AI architecture where a Master Orchestrator 
            coordinates 7 specialized Worker Agents for comprehensive pharmaceutical intelligence.
          </p>
          
          <div className="flex justify-center gap-3 mt-6 print:hidden">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
            <button
              onClick={() => setShowVideo(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Watch Demo
            </button>
          </div>
        </div>

        {/* Live API Status Indicators */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 mb-8 border border-slate-700 print:hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live API Status
            </h3>
            <span className="text-xs text-slate-400">Updated: Just now</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {apiStatuses.map((api) => (
              <div key={api.name} className="bg-slate-900/50 rounded-lg p-3 border border-slate-600">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${api.status === 'operational' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></span>
                  <span className="text-xs text-slate-300 truncate">{api.name}</span>
                </div>
                <div className="text-xs text-cyan-400">{api.latency}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Animated Architecture Diagram */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700 p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Animated Data Flow Architecture</h2>
          
          <div className="relative overflow-x-auto">
            <div className="min-w-[1100px] p-6">
              {/* Animated flow lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none print:hidden" style={{ zIndex: 0 }}>
                <defs>
                  <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity="0" />
                    <stop offset="50%" stopColor="#06B6D4" stopOpacity="1" />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Animated data packets */}
                <circle r="4" fill="#06B6D4" className="animate-pulse">
                  <animateMotion dur="3s" repeatCount="indefinite" path="M50,150 L200,150 L350,100 L550,100" />
                </circle>
                <circle r="4" fill="#10B981" className="animate-pulse">
                  <animateMotion dur="3.5s" repeatCount="indefinite" path="M50,150 L200,150 L350,150 L550,150" />
                </circle>
                <circle r="4" fill="#F59E0B" className="animate-pulse">
                  <animateMotion dur="4s" repeatCount="indefinite" path="M50,150 L200,150 L350,200 L550,200" />
                </circle>
              </svg>

              <div className="flex items-start justify-between gap-8 relative" style={{ zIndex: 1 }}>
                {/* User Query */}
                <div className="flex flex-col items-center gap-4 w-[180px]">
                  <div className={`w-full bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 shadow-lg shadow-blue-900/50 border border-blue-500/30 transition-all duration-500 ${activeFlow === 0 ? 'ring-2 ring-cyan-400 scale-105' : ''}`}>
                    <div className="text-3xl text-center mb-2">👤</div>
                    <h3 className="text-white font-bold text-center text-sm">User Query</h3>
                    <p className="text-blue-200 text-xs text-center mt-1">"Analyze GLP-1 market in obesity"</p>
                  </div>
                  
                  <div className={`h-8 w-1 rounded-full transition-all duration-500 ${activeFlow >= 1 ? 'bg-gradient-to-b from-cyan-400 to-cyan-600 animate-pulse' : 'bg-slate-600'}`}></div>
                  <div className={`text-xl transition-all duration-500 ${activeFlow >= 1 ? 'text-cyan-400' : 'text-slate-600'}`}>↓</div>
                </div>

                {/* Master Orchestrator */}
                <div className="flex flex-col items-center gap-4 w-[200px]">
                  <div className={`w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 rounded-xl p-5 shadow-xl shadow-purple-900/50 border border-purple-400/30 relative overflow-hidden transition-all duration-500 ${activeFlow === 1 ? 'ring-2 ring-cyan-400 scale-105' : ''}`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                    <div className="relative">
                      <div className="text-3xl text-center mb-2">🧠</div>
                      <h3 className="text-white font-bold text-center">Master Orchestrator</h3>
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-purple-100">
                          <span className={`w-2 h-2 rounded-full transition-all ${activeFlow >= 1 ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'}`}></span>
                          Query Decomposition
                        </div>
                        <div className="flex items-center gap-2 text-xs text-purple-100">
                          <span className={`w-2 h-2 rounded-full transition-all ${activeFlow >= 2 ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'}`} style={{animationDelay: '0.2s'}}></span>
                          Agent Selection
                        </div>
                        <div className="flex items-center gap-2 text-xs text-purple-100">
                          <span className={`w-2 h-2 rounded-full transition-all ${activeFlow >= 3 ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'}`} style={{animationDelay: '0.4s'}}></span>
                          Result Synthesis
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 text-slate-400 text-sm">
                    <span className="px-2 py-1 bg-slate-700 rounded text-xs">Gemini 1.5</span>
                    <span className="px-2 py-1 bg-slate-700 rounded text-xs">LangChain</span>
                  </div>
                </div>

                {/* Worker Agents */}
                <div className="flex-1">
                  <div className="relative">
                    <div className={`absolute left-0 top-1/2 w-8 h-1 rounded-full -translate-y-1/2 transition-all duration-500 ${activeFlow >= 2 ? 'bg-gradient-to-r from-purple-500 to-cyan-500 animate-pulse' : 'bg-slate-600'}`}></div>
                    
                    <div className={`bg-slate-900/60 rounded-xl p-4 border transition-all duration-500 ml-8 ${activeFlow === 2 ? 'border-cyan-500 ring-1 ring-cyan-400' : 'border-slate-600'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-semibold text-sm">7 Worker Agents (Parallel Execution)</h4>
                        <span className={`text-xs px-2 py-1 rounded transition-all ${activeFlow === 2 ? 'bg-cyan-500 text-white animate-pulse' : 'text-cyan-400 bg-cyan-900/50'}`}>~2.5s avg response</span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-3">
                        {agents.slice(0, 4).map((agent, idx) => (
                          <div 
                            key={agent.id}
                            className={`group relative bg-slate-800 rounded-lg p-3 border transition-all hover:shadow-lg ${activeFlow === 2 ? 'border-slate-400 animate-pulse' : 'border-slate-600 hover:border-slate-400'}`}
                            style={{animationDelay: `${idx * 150}ms`}}
                          >
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs mb-2"
                              style={{backgroundColor: agent.color}}
                            >
                              {agent.shortName.substring(0, 2)}
                            </div>
                            <h5 className="text-white text-xs font-semibold">{agent.shortName}</h5>
                            <p className="text-slate-400 text-[10px] mt-1">{agent.dataSource}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        {agents.slice(4, 7).map((agent, idx) => (
                          <div 
                            key={agent.id}
                            className={`group relative bg-slate-800 rounded-lg p-3 border transition-all hover:shadow-lg ${activeFlow === 2 ? 'border-slate-400 animate-pulse' : 'border-slate-600 hover:border-slate-400'}`}
                            style={{animationDelay: `${(idx + 4) * 150}ms`}}
                          >
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs mb-2"
                              style={{backgroundColor: agent.color}}
                            >
                              {agent.shortName.substring(0, 2)}
                            </div>
                            <h5 className="text-white text-xs font-semibold">{agent.shortName}</h5>
                            <p className="text-slate-400 text-[10px] mt-1">{agent.dataSource}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Output */}
                <div className="flex flex-col items-center gap-4 w-[180px]">
                  <div className={`text-xl transition-all duration-500 ${activeFlow >= 3 ? 'text-cyan-400' : 'text-slate-600'}`}>→</div>
                  <div className={`h-8 w-1 rounded-full transition-all duration-500 ${activeFlow >= 3 ? 'bg-gradient-to-b from-cyan-500 to-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
                  
                  <div className={`w-full bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl p-4 shadow-lg shadow-emerald-900/50 border border-emerald-500/30 transition-all duration-500 ${activeFlow >= 4 ? 'ring-2 ring-emerald-400 scale-105' : ''}`}>
                    <div className="text-3xl text-center mb-2">📄</div>
                    <h3 className="text-white font-bold text-center text-sm">Final Output</h3>
                    <div className="mt-2 space-y-1">
                      <div className={`text-emerald-200 text-xs text-center flex items-center justify-center gap-1 transition-all ${activeFlow >= 4 ? 'animate-pulse' : ''}`}>
                        <span>📊</span> PDF Report
                      </div>
                      <div className={`text-emerald-200 text-xs text-center flex items-center justify-center gap-1 transition-all ${activeFlow >= 4 ? 'animate-pulse' : ''}`} style={{animationDelay: '0.1s'}}>
                        <span>📈</span> Excel Data
                      </div>
                      <div className={`text-emerald-200 text-xs text-center flex items-center justify-center gap-1 transition-all ${activeFlow >= 4 ? 'animate-pulse' : ''}`} style={{animationDelay: '0.2s'}}>
                        <span>🖥️</span> Dashboard
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flow step indicator */}
              <div className="mt-8 flex justify-center gap-2 print:hidden">
                {['Query', 'Parse', 'Execute', 'Synthesize', 'Output'].map((step, idx) => (
                  <div 
                    key={idx}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${activeFlow === idx ? 'bg-cyan-500 text-white scale-110' : 'bg-slate-700 text-slate-400'}`}
                  >
                    {step}
                  </div>
                ))}
              </div>

              {/* Data Sources */}
              <div className="mt-8 pt-6 border-t border-slate-700">
                <h4 className="text-white font-semibold text-sm mb-4 text-center">Data Sources Integration</h4>
                <div className="flex justify-center gap-4 flex-wrap">
                  {dataSources.map((source, idx) => (
                    <div 
                      key={source.name}
                      className={`flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg border border-slate-600 transition-all ${activeFlow === 2 ? 'animate-pulse' : ''}`}
                      style={{animationDelay: `${idx * 100}ms`}}
                    >
                      <span className="text-lg">{source.icon}</span>
                      <span className="text-slate-300 text-xs">{source.name}</span>
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: source.color}}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-6 text-center">Worker Agents Detail</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {agents.map((agent) => (
            <div 
              key={agent.id}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg p-5 border-l-4 hover:shadow-xl hover:bg-slate-800/70 transition-all group"
              style={{ borderLeftColor: agent.color }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: agent.color }}
                >
                  <span className="text-white font-bold text-sm">{agent.shortName.substring(0, 2)}</span>
                </div>
                <div>
                  <h3 className="font-bold text-white">{agent.name}</h3>
                  <p className="text-xs text-slate-400">{agent.dataSource}</p>
                </div>
              </div>
              
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">{agent.description}</p>
              
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Outputs</h4>
                <ul className="space-y-1">
                  {agent.outputs.map((output, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: agent.color }}></span>
                      {output}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="pt-3 border-t border-slate-700">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Tech Stack</h4>
                <div className="flex flex-wrap gap-1">
                  {agent.techStack.map((tech, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-indigo-900 to-cyan-900 rounded-2xl p-8 border border-indigo-500/30">
          <h2 className="text-2xl font-bold text-white mb-6">Technical Complexity Highlights</h2>
          <div className="grid md:grid-cols-4 gap-5">
            <div className="bg-white/5 rounded-xl p-5 border border-white/10 backdrop-blur-sm">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold text-white mb-2">Parallel Processing</h3>
              <p className="text-sm text-slate-300">All 7 agents execute concurrently, reducing response time from minutes to ~2.5 seconds.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-5 border border-white/10 backdrop-blur-sm">
              <div className="text-3xl mb-3">🧭</div>
              <h3 className="font-bold text-white mb-2">Intelligent Routing</h3>
              <p className="text-sm text-slate-300">Master agent uses NLP to analyze queries and routes to only relevant workers, optimizing resources.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-5 border border-white/10 backdrop-blur-sm">
              <div className="text-3xl mb-3">🔗</div>
              <h3 className="font-bold text-white mb-2">Context Synthesis</h3>
              <p className="text-sm text-slate-300">Results from all agents are intelligently merged into coherent, actionable insights using RAG.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-5 border border-white/10 backdrop-blur-sm">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-bold text-white mb-2">Multi-Format Export</h3>
              <p className="text-sm text-slate-300">Generate PDF reports, Excel datasets, and interactive dashboards from synthesized data.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Agent Interaction Matrix</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="p-3 text-left text-slate-400">Agent</th>
                  <th className="p-3 text-center text-slate-400">Input From</th>
                  <th className="p-3 text-center text-slate-400">Output To</th>
                  <th className="p-3 text-center text-slate-400">Avg Time</th>
                  <th className="p-3 text-center text-slate-400">API Calls</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { agent: 'IQVIA', input: 'Master', output: 'Synthesis', time: '1.2s', calls: '3-5' },
                  { agent: 'EXIM', input: 'Master', output: 'Synthesis', time: '0.8s', calls: '2-3' },
                  { agent: 'Patent', input: 'Master', output: 'Synthesis', time: '1.5s', calls: '4-6' },
                  { agent: 'Clinical', input: 'Master', output: 'Synthesis', time: '1.8s', calls: '5-8' },
                  { agent: 'Internal', input: 'Master + User Docs', output: 'Synthesis', time: '2.0s', calls: '1-2' },
                  { agent: 'Web', input: 'Master', output: 'Synthesis', time: '2.5s', calls: '8-12' },
                  { agent: 'Report', input: 'Synthesis', output: 'User', time: '1.0s', calls: '0' },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="p-3 font-semibold text-white">{row.agent}</td>
                    <td className="p-3 text-center text-slate-300">{row.input}</td>
                    <td className="p-3 text-center text-slate-300">{row.output}</td>
                    <td className="p-3 text-center text-cyan-400">{row.time}</td>
                    <td className="p-3 text-center text-slate-300">{row.calls}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Competitor Comparison Table */}
        <div className="mt-12 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">CureCoders vs Competitors</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="p-3 text-left text-slate-400">Platform</th>
                  <th className="p-3 text-center text-slate-400">Multi-Agent AI</th>
                  <th className="p-3 text-center text-slate-400">Real-time Data</th>
                  <th className="p-3 text-center text-slate-400">Pharma-Specific</th>
                  <th className="p-3 text-center text-slate-400">Custom Reports</th>
                  <th className="p-3 text-center text-slate-400">Voice Query</th>
                  <th className="p-3 text-center text-slate-400">Pricing</th>
                  <th className="p-3 text-center text-slate-400">Score</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((comp, idx) => (
                  <tr key={idx} className={`border-b border-slate-700/50 ${idx === 0 ? 'bg-indigo-900/30' : 'hover:bg-slate-700/30'}`}>
                    <td className={`p-3 font-semibold ${idx === 0 ? 'text-cyan-400' : 'text-white'}`}>
                      {idx === 0 && <span className="mr-2">🏆</span>}
                      {comp.name}
                    </td>
                    <td className="p-3 text-center">{comp.multiAgent ? '✅' : '❌'}</td>
                    <td className="p-3 text-center">{comp.realtime ? '✅' : '❌'}</td>
                    <td className="p-3 text-center">{comp.pharmaSpecific ? '✅' : '❌'}</td>
                    <td className="p-3 text-center">{comp.customReports ? '✅' : '❌'}</td>
                    <td className="p-3 text-center">{comp.voiceQuery ? '✅' : '❌'}</td>
                    <td className="p-3 text-center text-slate-300">{comp.pricing}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${idx === 0 ? 'bg-gradient-to-r from-cyan-500 to-emerald-500' : 'bg-slate-500'}`}
                            style={{ width: `${comp.score}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs ${idx === 0 ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}>{comp.score}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-slate-500 text-xs mt-4">*Comparison based on publicly available features. Scores are illustrative.</p>
        </div>
      </div>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowVideo(false)}>
          <div className="bg-slate-900 rounded-2xl overflow-hidden max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-white font-semibold">Architecture Walkthrough</h3>
              <button onClick={() => setShowVideo(false)} className="text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="aspect-video bg-slate-800 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">🎬</div>
                <h4 className="text-white text-xl font-semibold mb-2">Demo Video Coming Soon</h4>
                <p className="text-slate-400">A detailed walkthrough of the CureCoders multi-agent architecture will be available here.</p>
                <div className="mt-6 flex justify-center gap-4">
                  <div className="px-4 py-2 bg-indigo-600/30 rounded-lg text-indigo-300 text-sm">Duration: ~5 min</div>
                  <div className="px-4 py-2 bg-emerald-600/30 rounded-lg text-emerald-300 text-sm">HD Quality</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Architecture;