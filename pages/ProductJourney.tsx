import React, { useState, useEffect, useCallback } from 'react';

const slides = [
  {
    id: 1,
    title: 'Molecule Discovery',
    subtitle: 'From Target to Candidate',
    color: 'from-blue-600 to-cyan-500',
    icon: '🔬',
    content: {
      description: 'Identify promising molecules through AI-driven analysis of existing research, patent landscapes, and clinical data.',
      keyActions: [
        'Patent landscape scan for white space opportunities',
        'Clinical trial failure analysis for repurposing candidates',
        'Competitive intelligence on emerging molecules',
      ],
      agentsUsed: ['Patent Agent', 'Clinical Trials Agent', 'Web Intelligence Agent'],
      sampleOutput: 'Identified 15 potential repurposing candidates from failed Phase 2 oncology trials with signal in autoimmune indications.',
      metrics: { candidates: '15', timeReduced: '60%', costSaved: '$2M' },
    },
  },
  {
    id: 2,
    title: 'Unmet Needs Analysis',
    subtitle: 'Market Gap Identification',
    color: 'from-purple-600 to-pink-500',
    icon: '📊',
    content: {
      description: 'Discover therapeutic areas with high patient burden but insufficient treatment options or competitive gaps.',
      keyActions: [
        'Disease burden vs treatment availability mapping',
        'Geographic market gap analysis',
        'Patient sentiment and unmet need signals',
      ],
      agentsUsed: ['IQVIA Agent', 'Web Intelligence Agent', 'Internal Docs Agent'],
      sampleOutput: 'Respiratory diseases in India show 150M+ patient burden with competition index of 0.3, representing $2.1B market gap.',
      metrics: { marketGap: '$2.1B', patients: '150M+', competition: '0.3' },
    },
  },
  {
    id: 3,
    title: 'Clinical Development Strategy',
    subtitle: 'Trial Planning & Benchmarking',
    color: 'from-red-500 to-orange-500',
    icon: '🧪',
    content: {
      description: 'Benchmark against competitor trials and optimize clinical development strategy for faster time-to-market.',
      keyActions: [
        'Competitor trial design analysis',
        'Endpoint selection optimization',
        'Enrollment timeline benchmarking',
      ],
      agentsUsed: ['Clinical Trials Agent', 'IQVIA Agent', 'Patent Agent'],
      sampleOutput: 'Recommended adaptive trial design with 30% faster enrollment based on competitor analysis; identified 3 potential sites with proven recruitment success.',
      metrics: { fasterEnrollment: '30%', sites: '3', trials: '47' },
    },
  },
  {
    id: 4,
    title: 'Patent & IP Strategy',
    subtitle: 'Protection & FTF Opportunity',
    color: 'from-amber-500 to-yellow-500',
    icon: '📜',
    content: {
      description: 'Develop robust IP strategy, identify patent cliffs, and assess first-to-file opportunities for generics.',
      keyActions: [
        'Patent cliff analysis and timeline',
        'FTF risk assessment for target molecules',
        'Defensive patent strategy recommendations',
      ],
      agentsUsed: ['Patent Agent', 'Internal Docs Agent', 'Web Intelligence Agent'],
      sampleOutput: 'Semaglutide core patents expire Apr 2026; recommended focus on novel delivery mechanisms (oral, implant) for extended exclusivity through 2031.',
      metrics: { expiry: 'Apr 2026', ftfOpps: '12', revenue: '$45B' },
    },
  },
  {
    id: 5,
    title: 'Go-to-Market & Product Story',
    subtitle: 'Launch Strategy & Positioning',
    color: 'from-green-500 to-teal-500',
    icon: '🚀',
    content: {
      description: 'Craft compelling product positioning with market access strategy and supply chain optimization.',
      keyActions: [
        'Competitive positioning and differentiation',
        'Pricing strategy benchmarking',
        'Supply chain risk assessment and optimization',
      ],
      agentsUsed: ['IQVIA Agent', 'EXIM Agent', 'Web Intelligence Agent', 'Report Generator'],
      sampleOutput: 'Recommended positioning as "affordable GLP-1 alternative" with 40% price advantage; identified 3 alternative API suppliers to reduce China dependency from 78% to 45%.',
      metrics: { priceAdvantage: '40%', suppliers: '3', dependency: '45%' },
    },
  },
];

const generateJourneyPPT = () => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Product Journey - CureCoders AI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; }
    .slide { width: 100%; min-height: 100vh; padding: 80px; page-break-after: always; display: flex; flex-direction: column; }
    .slide-1 { background: linear-gradient(135deg, #4F46E5, #06B6D4); color: white; justify-content: center; align-items: center; text-align: center; }
    .slide-2 { background: linear-gradient(135deg, #3B82F6, #06B6D4); color: white; }
    .slide-3 { background: linear-gradient(135deg, #9333EA, #EC4899); color: white; }
    .slide-4 { background: linear-gradient(135deg, #EF4444, #F97316); color: white; }
    .slide-5 { background: linear-gradient(135deg, #F59E0B, #EAB308); color: white; }
    .slide-6 { background: linear-gradient(135deg, #10B981, #14B8A6); color: white; }
    h1 { font-size: 56px; margin-bottom: 20px; font-weight: 700; }
    h2 { font-size: 42px; margin-bottom: 30px; font-weight: 600; }
    .subtitle { font-size: 28px; opacity: 0.9; margin-bottom: 40px; }
    .slide-number { position: absolute; top: 30px; right: 40px; font-size: 18px; opacity: 0.7; }
    .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-top: 40px; }
    .list { font-size: 24px; line-height: 2.2; }
    .list li { margin-bottom: 15px; }
    .metrics { display: flex; gap: 30px; margin-top: 40px; }
    .metric-box { background: rgba(255,255,255,0.15); padding: 30px; border-radius: 16px; text-align: center; flex: 1; }
    .metric-value { font-size: 36px; font-weight: bold; }
    .metric-label { font-size: 16px; opacity: 0.9; margin-top: 8px; }
    .insight-box { background: rgba(255,255,255,0.1); padding: 30px; border-radius: 12px; margin-top: 40px; border-left: 4px solid rgba(255,255,255,0.5); }
    .agents-used { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 30px; }
    .agent-tag { background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-size: 14px; }
    .footer { position: absolute; bottom: 30px; left: 80px; right: 80px; display: flex; justify-content: space-between; font-size: 14px; opacity: 0.7; }
    .icon { font-size: 64px; margin-bottom: 20px; }
    @media print { .slide { page-break-after: always; } }
  </style>
</head>
<body>
  <div class="slide slide-1">
    <div class="icon">🧬</div>
    <h1>End-to-End Product Journey</h1>
    <p class="subtitle">From Molecule Discovery to Market Launch</p>
    <p style="font-size: 24px; margin-top: 30px;">Powered by CureCoders Multi-Agent AI Platform</p>
    <div class="metrics" style="margin-top: 60px;">
      <div class="metric-box"><div class="metric-value">5</div><div class="metric-label">Journey Phases</div></div>
      <div class="metric-box"><div class="metric-value">7</div><div class="metric-label">AI Agents</div></div>
      <div class="metric-box"><div class="metric-value">60%</div><div class="metric-label">Time Reduction</div></div>
    </div>
    <div class="footer"><span>CureCoders AI</span><span>December 2024</span></div>
  </div>

  <div class="slide slide-2">
    <span class="slide-number">1/5</span>
    <div class="icon">🔬</div>
    <h2>Phase 1: Molecule Discovery</h2>
    <p class="subtitle">From Target to Candidate</p>
    <div class="content-grid">
      <div>
        <h3 style="font-size: 24px; margin-bottom: 20px;">Key Actions</h3>
        <ul class="list">
          <li>Patent landscape scan for white space</li>
          <li>Clinical trial failure analysis</li>
          <li>Competitive intelligence gathering</li>
        </ul>
        <div class="agents-used">
          <span class="agent-tag">Patent Agent</span>
          <span class="agent-tag">Clinical Trials Agent</span>
          <span class="agent-tag">Web Intelligence</span>
        </div>
      </div>
      <div>
        <div class="metric-box" style="margin-bottom: 20px;"><div class="metric-value">15</div><div class="metric-label">Repurposing Candidates Found</div></div>
        <div class="metric-box" style="margin-bottom: 20px;"><div class="metric-value">60%</div><div class="metric-label">Time Reduced</div></div>
        <div class="metric-box"><div class="metric-value">$2M</div><div class="metric-label">Cost Saved</div></div>
      </div>
    </div>
    <div class="footer"><span>CureCoders AI - Molecule Discovery</span><span>Slide 1 of 5</span></div>
  </div>

  <div class="slide slide-3">
    <span class="slide-number">2/5</span>
    <div class="icon">📊</div>
    <h2>Phase 2: Unmet Needs Analysis</h2>
    <p class="subtitle">Market Gap Identification</p>
    <div class="content-grid">
      <div>
        <h3 style="font-size: 24px; margin-bottom: 20px;">Key Actions</h3>
        <ul class="list">
          <li>Disease burden mapping</li>
          <li>Geographic market gap analysis</li>
          <li>Patient sentiment analysis</li>
        </ul>
        <div class="agents-used">
          <span class="agent-tag">IQVIA Agent</span>
          <span class="agent-tag">Web Intelligence</span>
          <span class="agent-tag">Internal Docs</span>
        </div>
      </div>
      <div>
        <div class="metric-box" style="margin-bottom: 20px;"><div class="metric-value">$2.1B</div><div class="metric-label">Market Gap Identified</div></div>
        <div class="metric-box" style="margin-bottom: 20px;"><div class="metric-value">150M+</div><div class="metric-label">Patient Population</div></div>
        <div class="metric-box"><div class="metric-value">0.3</div><div class="metric-label">Competition Index</div></div>
      </div>
    </div>
    <div class="footer"><span>CureCoders AI - Market Analysis</span><span>Slide 2 of 5</span></div>
  </div>

  <div class="slide slide-4">
    <span class="slide-number">3/5</span>
    <div class="icon">🧪</div>
    <h2>Phase 3: Clinical Development</h2>
    <p class="subtitle">Trial Planning & Benchmarking</p>
    <div class="content-grid">
      <div>
        <h3 style="font-size: 24px; margin-bottom: 20px;">Key Actions</h3>
        <ul class="list">
          <li>Competitor trial design analysis</li>
          <li>Endpoint selection optimization</li>
          <li>Enrollment timeline benchmarking</li>
        </ul>
        <div class="agents-used">
          <span class="agent-tag">Clinical Trials Agent</span>
          <span class="agent-tag">IQVIA Agent</span>
          <span class="agent-tag">Patent Agent</span>
        </div>
      </div>
      <div>
        <div class="metric-box" style="margin-bottom: 20px;"><div class="metric-value">30%</div><div class="metric-label">Faster Enrollment</div></div>
        <div class="metric-box" style="margin-bottom: 20px;"><div class="metric-value">3</div><div class="metric-label">Optimal Sites Found</div></div>
        <div class="metric-box"><div class="metric-value">47</div><div class="metric-label">Trials Analyzed</div></div>
      </div>
    </div>
    <div class="footer"><span>CureCoders AI - Clinical Strategy</span><span>Slide 3 of 5</span></div>
  </div>

  <div class="slide slide-5">
    <span class="slide-number">4/5</span>
    <div class="icon">📜</div>
    <h2>Phase 4: Patent & IP Strategy</h2>
    <p class="subtitle">Protection & FTF Opportunity</p>
    <div class="content-grid">
      <div>
        <h3 style="font-size: 24px; margin-bottom: 20px;">Key Actions</h3>
        <ul class="list">
          <li>Patent cliff analysis and timeline</li>
          <li>FTF risk assessment</li>
          <li>Defensive patent strategy</li>
        </ul>
        <div class="agents-used">
          <span class="agent-tag">Patent Agent</span>
          <span class="agent-tag">Internal Docs</span>
          <span class="agent-tag">Web Intelligence</span>
        </div>
      </div>
      <div>
        <div class="metric-box" style="margin-bottom: 20px;"><div class="metric-value">Apr 2026</div><div class="metric-label">Key Patent Expiry</div></div>
        <div class="metric-box" style="margin-bottom: 20px;"><div class="metric-value">12</div><div class="metric-label">FTF Opportunities</div></div>
        <div class="metric-box"><div class="metric-value">$45B</div><div class="metric-label">At-Risk Revenue</div></div>
      </div>
    </div>
    <div class="footer"><span>CureCoders AI - Patent Strategy</span><span>Slide 4 of 5</span></div>
  </div>

  <div class="slide slide-6">
    <span class="slide-number">5/5</span>
    <div class="icon">🚀</div>
    <h2>Phase 5: Go-to-Market Strategy</h2>
    <p class="subtitle">Launch & Positioning</p>
    <div class="content-grid">
      <div>
        <h3 style="font-size: 24px; margin-bottom: 20px;">Key Actions</h3>
        <ul class="list">
          <li>Competitive positioning</li>
          <li>Pricing strategy benchmarking</li>
          <li>Supply chain optimization</li>
        </ul>
        <div class="agents-used">
          <span class="agent-tag">IQVIA Agent</span>
          <span class="agent-tag">EXIM Agent</span>
          <span class="agent-tag">Report Generator</span>
        </div>
      </div>
      <div>
        <div class="metric-box" style="margin-bottom: 20px;"><div class="metric-value">40%</div><div class="metric-label">Price Advantage</div></div>
        <div class="metric-box" style="margin-bottom: 20px;"><div class="metric-value">3</div><div class="metric-label">Alt Suppliers</div></div>
        <div class="metric-box"><div class="metric-value">45%</div><div class="metric-label">Reduced Dependency</div></div>
      </div>
    </div>
    <div class="footer"><span>CureCoders AI - Market Launch</span><span>Slide 5 of 5</span></div>
  </div>
</body>
</html>`;
};

const ProductJourney: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isFullscreen) {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setActiveSlide(prev => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setActiveSlide(prev => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    }
  }, [isFullscreen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleDownloadPPT = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const pptContent = generateJourneyPPT();
      const blob = new Blob([pptContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'CureCoders_Product_Journey.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsGenerating(false);
    }, 1500);
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <div className={`w-full h-full bg-gradient-to-br ${slides[activeSlide].color} flex flex-col`}>
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <span className="text-white/70 text-sm bg-black/30 px-3 py-1 rounded">
              Press ESC to exit | Arrow keys to navigate
            </span>
            <button 
              onClick={() => setIsFullscreen(false)}
              className="text-white/70 hover:text-white p-2 bg-black/30 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-12">
            <div className="max-w-6xl w-full text-white">
              <div className="flex items-center gap-6 mb-8">
                <span className="text-7xl">{slides[activeSlide].icon}</span>
                <div>
                  <span className="text-xl opacity-70">Slide {activeSlide + 1} of {slides.length}</span>
                  <h1 className="text-5xl font-bold">{slides[activeSlide].title}</h1>
                  <p className="text-2xl opacity-80 mt-2">{slides[activeSlide].subtitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12 mt-12">
                <div>
                  <p className="text-xl leading-relaxed opacity-90 mb-8">
                    {slides[activeSlide].content.description}
                  </p>
                  <h3 className="text-lg font-semibold mb-4 opacity-80">Key Actions</h3>
                  <ul className="space-y-3">
                    {slides[activeSlide].content.keyActions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-lg">
                        <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        {action}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2 mt-8">
                    {slides[activeSlide].content.agentsUsed.map((agent, idx) => (
                      <span key={idx} className="px-4 py-2 bg-white/20 rounded-full text-sm">
                        {agent}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(slides[activeSlide].content.metrics).map(([key, value]) => (
                      <div key={key} className="bg-white/10 rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold">{value}</div>
                        <div className="text-sm opacity-70 mt-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/10 rounded-xl p-6">
                    <h3 className="font-semibold mb-3">Sample Output</h3>
                    <p className="text-sm leading-relaxed italic opacity-90">
                      "{slides[activeSlide].content.sampleOutput}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 px-12 py-4 flex items-center justify-between">
            <button
              onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
              disabled={activeSlide === 0}
              className="px-6 py-3 bg-white/20 rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/30 transition"
            >
              ← Previous
            </button>
            <div className="flex gap-3">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`w-4 h-4 rounded-full transition-all ${
                    activeSlide === idx ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setActiveSlide(Math.min(slides.length - 1, activeSlide + 1))}
              disabled={activeSlide === slides.length - 1}
              className="px-6 py-3 bg-white/20 rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/30 transition"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
            End-to-End Product Journey
          </h1>
          <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">
            A 5-slide journey demonstrating how CureCoders supports pharmaceutical product development 
            from molecule discovery to market launch.
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setIsFullscreen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Present Fullscreen
          </button>
          <button
            onClick={handleDownloadPPT}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PPT
              </>
            )}
          </button>
        </div>

        <div className="mb-8">
          <div className="flex justify-center items-center gap-2 overflow-x-auto pb-4">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setActiveSlide(idx)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  activeSlide === idx
                    ? `bg-gradient-to-r ${slide.color} text-white shadow-lg`
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'
                }`}
              >
                <span className="text-xl">{slide.icon}</span>
                <span className="font-medium whitespace-nowrap">{slide.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <div 
            className={`bg-gradient-to-br ${slides[activeSlide].color} rounded-2xl shadow-2xl overflow-hidden`}
          >
            <div className="p-8 md:p-12">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{slides[activeSlide].icon}</span>
                  <div>
                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-white text-sm mb-2">
                      Slide {slides[activeSlide].id} of 5
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                      {slides[activeSlide].title}
                    </h2>
                    <p className="text-xl text-white/80">{slides[activeSlide].subtitle}</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Overview</h3>
                    <p className="text-white/90 leading-relaxed">
                      {slides[activeSlide].content.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Key Actions</h3>
                    <ul className="space-y-2">
                      {slides[activeSlide].content.keyActions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-white/90">
                          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Agents Activated</h3>
                    <div className="flex flex-wrap gap-2">
                      {slides[activeSlide].content.agentsUsed.map((agent, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-white/20 rounded-full text-white text-sm"
                        >
                          {agent}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(slides[activeSlide].content.metrics).map(([key, value]) => (
                      <div key={key} className="bg-white/10 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-white">{value}</div>
                        <div className="text-xs text-white/70 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white/10 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Sample Output</h3>
                    <p className="text-white/90 text-sm leading-relaxed italic">
                      "{slides[activeSlide].content.sampleOutput}"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/10 px-8 py-4 flex items-center justify-between">
              <button
                onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
                disabled={activeSlide === 0}
                className="px-4 py-2 bg-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/30 transition"
              >
                ← Previous
              </button>
              <div className="flex gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      activeSlide === idx ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setActiveSlide(Math.min(slides.length - 1, activeSlide + 1))}
                disabled={activeSlide === slides.length - 1}
                className="px-4 py-2 bg-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/30 transition"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-5 gap-4">
          {slides.map((slide, idx) => (
            <div 
              key={slide.id}
              className={`relative bg-slate-800/50 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg border ${
                activeSlide === idx ? 'border-cyan-500 ring-2 ring-cyan-500/50' : 'border-slate-700'
              }`}
              onClick={() => setActiveSlide(idx)}
            >
              {idx < slides.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 z-10">
                  <span className="text-2xl text-slate-500">→</span>
                </div>
              )}
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${slide.color} flex items-center justify-center text-2xl mb-3`}>
                {slide.icon}
              </div>
              <h3 className="font-semibold text-white text-sm">{slide.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{slide.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductJourney;
