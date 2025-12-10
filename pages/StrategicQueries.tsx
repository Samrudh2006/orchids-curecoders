import React, { useState, useEffect, useCallback } from 'react';

const strategicQueries = [
  {
    category: 'Market Opportunity',
    queries: [
      {
        query: 'Which respiratory diseases show low competition but high patient burden in India?',
        agents: ['IQVIA', 'Clinical Trials', 'Web'],
        expectedOutput: {
          summary: 'COPD and Asthma show high patient burden (150M+ patients) with limited branded competition in Tier-2/3 cities',
          metrics: ['Patient Population: 150M+', 'Competition Index: 0.3', 'Market Gap: $2.1B'],
          insight: 'Opportunity for affordable inhaler brands targeting rural markets with lower price points.',
        },
      },
      {
        query: 'Identify underserved therapeutic areas in Southeast Asia with growing demand',
        agents: ['IQVIA', 'EXIM', 'Web'],
        expectedOutput: {
          summary: 'Diabetes (Type 2), Hepatitis B, and Mental Health show fastest growth with inadequate supply',
          metrics: ['Diabetes Growth: 18% CAGR', 'HepB Market Gap: $800M', 'Mental Health Awareness: +45% YoY'],
          insight: 'Mental health represents a greenfield opportunity as stigma decreases and awareness programs expand.',
        },
      },
    ],
  },
  {
    category: 'Patent Intelligence',
    queries: [
      {
        query: 'Which blockbuster patents expire in 2025-2027 with high generic entry potential?',
        agents: ['Patent', 'IQVIA', 'Clinical Trials'],
        expectedOutput: {
          summary: 'Humira biosimilars, Keytruda methods, and several GLP-1 formulations face patent cliffs',
          metrics: ['At-Risk Revenue: $45B', 'High FTF Candidates: 12', 'Expected Generic Entrants: 8+'],
          insight: 'First-to-file opportunities exist in GLP-1 delivery systems with lower litigation risk.',
        },
      },
      {
        query: 'Analyze FTF risk for Semaglutide patents and identify defensive strategies',
        agents: ['Patent', 'Web', 'Internal'],
        expectedOutput: {
          summary: 'Core composition patents expire 2026, but delivery method patents extend protection to 2031',
          metrics: ['Core Patent Expiry: Apr 2026', 'Method Patents: 5 active', 'Litigation Risk: Medium'],
          insight: 'Recommend focusing on novel delivery mechanisms (oral, implant) for extended exclusivity.',
        },
      },
    ],
  },
  {
    category: 'Clinical Development',
    queries: [
      {
        query: 'Show clinical trial landscape for obesity drugs with novel mechanisms',
        agents: ['Clinical Trials', 'Patent', 'Web'],
        expectedOutput: {
          summary: '47 active trials targeting GLP-1, GIP dual agonists, and emerging amylin analogs',
          metrics: ['Phase 3: 12 trials', 'Phase 2: 23 trials', 'Novel MOAs: 8'],
          insight: 'Triple agonists (GLP-1/GIP/Glucagon) showing superior efficacy, potential market disruptor by 2027.',
        },
      },
      {
        query: 'Identify drug repurposing opportunities based on failed trial analysis',
        agents: ['Clinical Trials', 'Patent', 'Internal'],
        expectedOutput: {
          summary: 'Several Phase 2 failures in oncology show signal in autoimmune indications',
          metrics: ['Repurposing Candidates: 15', 'Cost Savings: 60-70%', 'Time to Market: 3-4 years'],
          insight: 'JAK inhibitor failed in solid tumors shows promise in alopecia areata based on secondary endpoints.',
        },
      },
    ],
  },
  {
    category: 'Competitive Intelligence',
    queries: [
      {
        query: 'Compare Novo Nordisk vs Eli Lilly pipeline strength in metabolic diseases',
        agents: ['IQVIA', 'Clinical Trials', 'Patent', 'Web'],
        expectedOutput: {
          summary: 'Lilly leads in next-gen oral formulations; Novo dominates injectable market share',
          metrics: ['Novo Pipeline: 8 candidates', 'Lilly Pipeline: 11 candidates', 'Oral Focus: Lilly 6 vs Novo 2'],
          insight: 'Oral semaglutide conversion lagging; Lilly orforglipron may capture patient preference shift.',
        },
      },
      {
        query: 'Track competitive moves in CAR-T therapy market for hematologic malignancies',
        agents: ['Web', 'Clinical Trials', 'Patent'],
        expectedOutput: {
          summary: 'Bristol Myers, Novartis, and emerging Chinese players intensifying competition',
          metrics: ['Approved Products: 6', 'Pipeline: 200+ candidates', 'Price Competition: -15% YoY'],
          insight: 'Allogeneic CAR-T represents cost disruption opportunity vs autologous market leaders.',
        },
      },
    ],
  },
  {
    category: 'Supply Chain & Trade',
    queries: [
      {
        query: 'Assess API sourcing risk for critical cardiovascular drugs',
        agents: ['EXIM', 'Web', 'Internal'],
        expectedOutput: {
          summary: 'China dependency at 78% for key intermediates; India secondary at 15%',
          metrics: ['China Share: 78%', 'Supply Risk Index: High', 'Alt Suppliers: 3 qualified'],
          insight: 'Recommend qualifying European sources for regulatory-friendly supply chain narrative.',
        },
      },
      {
        query: 'Identify export opportunities for generic formulations to Africa',
        agents: ['EXIM', 'IQVIA', 'Web'],
        expectedOutput: {
          summary: 'HIV/AIDS, TB, and Malaria formulations show $3.2B addressable market with WHO prequalification',
          metrics: ['Addressable Market: $3.2B', 'WHO PQ Products: 450+', 'Competition: Moderate'],
          insight: 'Focus on fixed-dose combinations meeting WHO Essential Medicines List requirements.',
        },
      },
    ],
  },
];

const generateQueriesPPT = () => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Strategic Queries - CureCoders AI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; }
    .slide { width: 100%; min-height: 100vh; padding: 60px; page-break-after: always; }
    .slide-title { background: linear-gradient(135deg, #4F46E5, #06B6D4); color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
    .slide-content { background: #f8fafc; }
    h1 { font-size: 48px; margin-bottom: 20px; }
    h2 { font-size: 36px; margin-bottom: 20px; color: #4F46E5; }
    .query-box { background: white; border-radius: 12px; padding: 30px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .query-text { font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 15px; }
    .agents { display: flex; gap: 10px; margin-bottom: 15px; }
    .agent-tag { background: #E0E7FF; color: #4F46E5; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .output { background: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 15px; }
    .metrics { display: flex; gap: 15px; margin: 20px 0; }
    .metric { background: #EEF2FF; padding: 15px; border-radius: 8px; flex: 1; text-align: center; font-size: 14px; }
    .insight { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; border-radius: 0 8px 8px 0; font-size: 14px; color: #92400E; }
    .footer { margin-top: 40px; text-align: center; color: #64748b; font-size: 14px; }
    @media print { .slide { page-break-after: always; } }
  </style>
</head>
<body>
  <div class="slide slide-title">
    <h1>Strategic Query Examples</h1>
    <p style="font-size: 24px; opacity: 0.9; margin-bottom: 30px;">10+ Deep Analytical Queries Powered by 7 AI Agents</p>
    <p style="font-size: 18px; opacity: 0.7;">CureCoders Multi-Agent Intelligence Platform</p>
  </div>
  
  <div class="slide slide-content">
    <h2>Market Opportunity Queries</h2>
    <div class="query-box">
      <div class="query-text">"Which respiratory diseases show low competition but high patient burden in India?"</div>
      <div class="agents">
        <span class="agent-tag">IQVIA Agent</span>
        <span class="agent-tag">Clinical Trials Agent</span>
        <span class="agent-tag">Web Intelligence</span>
      </div>
      <div class="output">
        <strong>Output:</strong> COPD and Asthma show high patient burden (150M+ patients) with limited branded competition in Tier-2/3 cities
      </div>
      <div class="metrics">
        <div class="metric">Patient Population: 150M+</div>
        <div class="metric">Competition Index: 0.3</div>
        <div class="metric">Market Gap: $2.1B</div>
      </div>
      <div class="insight">
        <strong>AI Insight:</strong> Opportunity for affordable inhaler brands targeting rural markets with lower price points.
      </div>
    </div>
    <div class="footer">CureCoders AI - Strategic Intelligence</div>
  </div>
  
  <div class="slide slide-content">
    <h2>Patent Intelligence Queries</h2>
    <div class="query-box">
      <div class="query-text">"Which blockbuster patents expire in 2025-2027 with high generic entry potential?"</div>
      <div class="agents">
        <span class="agent-tag">Patent Agent</span>
        <span class="agent-tag">IQVIA Agent</span>
        <span class="agent-tag">Clinical Trials Agent</span>
      </div>
      <div class="output">
        <strong>Output:</strong> Humira biosimilars, Keytruda methods, and several GLP-1 formulations face patent cliffs
      </div>
      <div class="metrics">
        <div class="metric">At-Risk Revenue: $45B</div>
        <div class="metric">High FTF Candidates: 12</div>
        <div class="metric">Expected Generic Entrants: 8+</div>
      </div>
      <div class="insight">
        <strong>AI Insight:</strong> First-to-file opportunities exist in GLP-1 delivery systems with lower litigation risk.
      </div>
    </div>
    <div class="footer">CureCoders AI - Patent Intelligence</div>
  </div>
  
  <div class="slide slide-content">
    <h2>Clinical Development Queries</h2>
    <div class="query-box">
      <div class="query-text">"Show clinical trial landscape for obesity drugs with novel mechanisms"</div>
      <div class="agents">
        <span class="agent-tag">Clinical Trials Agent</span>
        <span class="agent-tag">Patent Agent</span>
        <span class="agent-tag">Web Intelligence</span>
      </div>
      <div class="output">
        <strong>Output:</strong> 47 active trials targeting GLP-1, GIP dual agonists, and emerging amylin analogs
      </div>
      <div class="metrics">
        <div class="metric">Phase 3: 12 trials</div>
        <div class="metric">Phase 2: 23 trials</div>
        <div class="metric">Novel MOAs: 8</div>
      </div>
      <div class="insight">
        <strong>AI Insight:</strong> Triple agonists (GLP-1/GIP/Glucagon) showing superior efficacy, potential market disruptor by 2027.
      </div>
    </div>
    <div class="footer">CureCoders AI - Clinical Intelligence</div>
  </div>
  
  <div class="slide slide-content">
    <h2>Competitive Intelligence Queries</h2>
    <div class="query-box">
      <div class="query-text">"Compare Novo Nordisk vs Eli Lilly pipeline strength in metabolic diseases"</div>
      <div class="agents">
        <span class="agent-tag">IQVIA Agent</span>
        <span class="agent-tag">Clinical Trials Agent</span>
        <span class="agent-tag">Patent Agent</span>
        <span class="agent-tag">Web Intelligence</span>
      </div>
      <div class="output">
        <strong>Output:</strong> Lilly leads in next-gen oral formulations; Novo dominates injectable market share
      </div>
      <div class="metrics">
        <div class="metric">Novo Pipeline: 8 candidates</div>
        <div class="metric">Lilly Pipeline: 11 candidates</div>
        <div class="metric">Oral Focus: Lilly 6 vs Novo 2</div>
      </div>
      <div class="insight">
        <strong>AI Insight:</strong> Oral semaglutide conversion lagging; Lilly orforglipron may capture patient preference shift.
      </div>
    </div>
    <div class="footer">CureCoders AI - Competitive Intelligence</div>
  </div>
  
  <div class="slide slide-content">
    <h2>Supply Chain & Trade Queries</h2>
    <div class="query-box">
      <div class="query-text">"Assess API sourcing risk for critical cardiovascular drugs"</div>
      <div class="agents">
        <span class="agent-tag">EXIM Agent</span>
        <span class="agent-tag">Web Intelligence</span>
        <span class="agent-tag">Internal Docs Agent</span>
      </div>
      <div class="output">
        <strong>Output:</strong> China dependency at 78% for key intermediates; India secondary at 15%
      </div>
      <div class="metrics">
        <div class="metric">China Share: 78%</div>
        <div class="metric">Supply Risk Index: High</div>
        <div class="metric">Alt Suppliers: 3 qualified</div>
      </div>
      <div class="insight">
        <strong>AI Insight:</strong> Recommend qualifying European sources for regulatory-friendly supply chain narrative.
      </div>
    </div>
    <div class="footer">CureCoders AI - Supply Chain Intelligence</div>
  </div>
</body>
</html>`;
};

const StrategicQueries: React.FC = () => {
  const [expandedQuery, setExpandedQuery] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(0);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (presentationMode) {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentCategory(prev => Math.min(strategicQueries.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentCategory(prev => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        setPresentationMode(false);
      }
    }
  }, [presentationMode]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleDownloadPPT = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const pptContent = generateQueriesPPT();
      const blob = new Blob([pptContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'CureCoders_Strategic_Queries.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsGenerating(false);
    }, 1500);
  };

  if (presentationMode) {
    const category = strategicQueries[currentCategory];
    return (
      <div className="fixed inset-0 z-50 bg-slate-900">
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <span className="text-white/70 text-sm bg-black/30 px-3 py-1 rounded">
            ESC to exit | Arrow keys to navigate
          </span>
          <button 
            onClick={() => setPresentationMode(false)}
            className="text-white/70 hover:text-white p-2 bg-black/30 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="h-full flex flex-col p-12">
          <div className="mb-8">
            <span className="text-cyan-400 text-sm">Category {currentCategory + 1} of {strategicQueries.length}</span>
            <h1 className="text-4xl font-bold text-white mt-2">{category.category}</h1>
          </div>

          <div className="flex-1 grid md:grid-cols-2 gap-6 overflow-auto">
            {category.queries.map((q, qIdx) => (
              <div key={qIdx} className="bg-slate-800/80 rounded-xl p-6 border border-slate-700">
                <p className="text-lg font-semibold text-white mb-4">"{q.query}"</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {q.agents.map((agent, aIdx) => (
                    <span key={aIdx} className="px-3 py-1 bg-indigo-600/30 text-indigo-300 rounded-full text-sm">
                      {agent}
                    </span>
                  ))}
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                  <p className="text-slate-300">{q.expectedOutput.summary}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {q.expectedOutput.metrics.map((m, mIdx) => (
                    <div key={mIdx} className="bg-cyan-900/30 rounded-lg p-2 text-center">
                      <span className="text-xs text-cyan-300">{m}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-amber-900/30 rounded-lg p-3 border-l-4 border-amber-500">
                  <p className="text-sm text-amber-200"><strong>Insight:</strong> {q.expectedOutput.insight}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setCurrentCategory(Math.max(0, currentCategory - 1))}
              disabled={currentCategory === 0}
              className="px-6 py-3 bg-white/10 rounded-lg text-white disabled:opacity-30 hover:bg-white/20 transition"
            >
              ← Previous
            </button>
            <div className="flex gap-2">
              {strategicQueries.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentCategory(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentCategory === idx ? 'bg-cyan-400 w-6' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrentCategory(Math.min(strategicQueries.length - 1, currentCategory + 1))}
              disabled={currentCategory === strategicQueries.length - 1}
              className="px-6 py-3 bg-white/10 rounded-lg text-white disabled:opacity-30 hover:bg-white/20 transition"
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
            Strategic Query Examples
          </h1>
          <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">
            10+ deep strategic queries demonstrating the analytical power of our multi-agent system. 
            Each query shows which agents are activated and what outputs to expect.
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setPresentationMode(true)}
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
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
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

        <div className="space-y-8">
          {strategicQueries.map((category, catIdx) => (
            <div key={catIdx}>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-sm font-bold">
                  {catIdx + 1}
                </span>
                {category.category}
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {category.queries.map((q, qIdx) => {
                  const queryId = `${catIdx}-${qIdx}`;
                  const isExpanded = expandedQuery === queryId;

                  return (
                    <div 
                      key={qIdx}
                      className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-slate-700"
                    >
                      <button
                        onClick={() => setExpandedQuery(isExpanded ? null : queryId)}
                        className="w-full text-left p-6"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <p className="font-medium text-white leading-relaxed">
                            "{q.query}"
                          </p>
                          <span className={`text-2xl text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            ↓
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {q.agents.map((agent, aIdx) => (
                            <span 
                              key={aIdx}
                              className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-600/30 text-indigo-300"
                            >
                              {agent}
                            </span>
                          ))}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-slate-700 bg-slate-900/50 p-6">
                          <h4 className="font-semibold text-slate-300 mb-3">Expected Output</h4>
                          
                          <div className="bg-slate-800 rounded-lg p-4 mb-4">
                            <p className="text-slate-300">{q.expectedOutput.summary}</p>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mb-4">
                            {q.expectedOutput.metrics.map((m, mIdx) => (
                              <div key={mIdx} className="bg-indigo-900/30 rounded-lg p-3 text-center">
                                <span className="text-xs text-indigo-300">{m}</span>
                              </div>
                            ))}
                          </div>

                          <div className="bg-amber-900/20 rounded-lg p-4 border-l-4 border-amber-500">
                            <h5 className="font-semibold text-amber-300 text-sm mb-1">AI Insight</h5>
                            <p className="text-sm text-amber-200">{q.expectedOutput.insight}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Query Processing Pipeline</h2>
          <div className="flex flex-wrap justify-center items-center gap-4">
            {['User Query', 'NLP Parsing', 'Agent Selection', 'Parallel Execution', 'Result Synthesis', 'Insight Generation'].map((step, idx) => (
              <React.Fragment key={idx}>
                <div className="bg-indigo-900/30 rounded-lg px-4 py-3 text-center border border-indigo-500/30">
                  <span className="text-xs text-slate-400 block">Step {idx + 1}</span>
                  <span className="font-semibold text-indigo-300">{step}</span>
                </div>
                {idx < 5 && <span className="text-2xl text-slate-600">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategicQueries;