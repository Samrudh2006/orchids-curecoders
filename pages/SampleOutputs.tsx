import React, { useState, useRef } from 'react';

const sampleMarketData = {
  therapy: 'GLP-1 Agonists - Obesity',
  molecule: 'Semaglutide',
  marketSizeUSD: '$12.4 Billion (2024)',
  cagr: '23.5% (2024-2030)',
  topCompetitors: [
    { name: 'Novo Nordisk', share: '62%' },
    { name: 'Eli Lilly', share: '28%' },
    { name: 'Others', share: '10%' },
  ],
  insights: 'Strong growth driven by increasing obesity prevalence and expanding indications. Tirzepatide emerging as key competitor with superior efficacy data.',
  marketGrowth: [
    { year: 2020, sizeB: 2.1 },
    { year: 2021, sizeB: 3.8 },
    { year: 2022, sizeB: 6.2 },
    { year: 2023, sizeB: 9.4 },
    { year: 2024, sizeB: 12.4 },
    { year: 2025, sizeB: 16.2 },
    { year: 2026, sizeB: 21.5 },
  ],
};

const samplePatents = [
  { title: 'Semaglutide Composition Patent', owner: 'Novo Nordisk', expiryDate: '2026-04-15', ftRisk: 'High' as const },
  { title: 'GLP-1 Delivery System', owner: 'Novo Nordisk', expiryDate: '2028-08-22', ftRisk: 'Medium' as const },
  { title: 'Tirzepatide Dual Agonist', owner: 'Eli Lilly', expiryDate: '2036-11-30', ftRisk: 'Low' as const },
  { title: 'Oral Semaglutide Formulation', owner: 'Novo Nordisk', expiryDate: '2031-03-18', ftRisk: 'Medium' as const },
  { title: 'GLP-1 Pen Device', owner: 'Novo Nordisk', expiryDate: '2025-12-01', ftRisk: 'High' as const },
];

const sampleTrials = [
  { id: 'NCT05035095', title: 'STEP HFpEF Trial - Semaglutide in Heart Failure', phase: 'Phase 3', status: 'Completed', sponsor: 'Novo Nordisk' },
  { id: 'NCT05822024', title: 'SURMOUNT-OSA - Tirzepatide in Obstructive Sleep Apnea', phase: 'Phase 3', status: 'Active', sponsor: 'Eli Lilly' },
  { id: 'NCT04881706', title: 'SELECT Trial - CV Outcomes with Semaglutide', phase: 'Phase 3', status: 'Completed', sponsor: 'Novo Nordisk' },
  { id: 'NCT05556512', title: 'Retatrutide Phase 2 Obesity Trial', phase: 'Phase 2', status: 'Recruiting', sponsor: 'Eli Lilly' },
  { id: 'NCT05659849', title: 'Orforglipron Oral GLP-1 Study', phase: 'Phase 3', status: 'Recruiting', sponsor: 'Eli Lilly' },
];

const sampleWebSignals = [
  { title: 'Wegovy Supply Constraints Easing', source: 'Reuters', sentiment: 0.75, excerpt: 'Novo Nordisk reports improved manufacturing capacity meeting demand for obesity drug Wegovy.' },
  { title: 'Eli Lilly Mounjaro Approval in China', source: 'Bloomberg', sentiment: 0.85, excerpt: 'Tirzepatide receives regulatory approval in China, opening $2B market opportunity.' },
  { title: 'Generic Semaglutide Concerns', source: 'FiercePharma', sentiment: 0.35, excerpt: 'Patent cliff approaching for semaglutide raises competitive pricing concerns.' },
];

const sampleInternalSummary = [
  'Q3 2024 sales exceeded forecast by 15%, driven by Wegovy demand',
  'Market access secured in 12 additional European countries',
  'Manufacturing capacity expansion on track for Q2 2025 completion',
  'Competitor intelligence suggests Lilly accelerating oral GLP-1 development',
  'Regulatory submission for new indication planned for H1 2025',
];

const sampleDocumentSummary = {
  fileName: 'Q3_2024_Strategic_Review.pdf',
  fileSize: '2.4 MB',
  processingTime: '3.2s',
  pages: 47,
  summary: {
    executive: 'The Q3 2024 report indicates strong growth in the GLP-1 agonist market with Wegovy exceeding forecasts by 15%. Market expansion into 12 additional European countries signals aggressive growth strategy. Manufacturing capacity improvements are on track for Q2 2025.',
    keyFindings: [
      { title: 'Revenue Performance', detail: 'Q3 sales exceeded forecast by 15%, primarily driven by Wegovy demand in US and European markets', sentiment: 'positive' },
      { title: 'Market Expansion', detail: 'Successfully secured market access in 12 additional European countries, increasing total addressable market by $800M', sentiment: 'positive' },
      { title: 'Manufacturing Update', detail: 'Capacity expansion project on track for Q2 2025 completion, will increase output by 40%', sentiment: 'neutral' },
      { title: 'Competitive Landscape', detail: 'Intelligence suggests Lilly accelerating oral GLP-1 development, potential market disruption by 2026', sentiment: 'warning' },
      { title: 'Regulatory Pipeline', detail: 'New indication submission planned for H1 2025, addressing cardiovascular outcomes', sentiment: 'positive' },
    ],
    entities: ['Wegovy', 'Semaglutide', 'Novo Nordisk', 'Eli Lilly', 'GLP-1', 'Europe', 'FDA', 'EMA'],
    topics: ['Sales Performance', 'Market Access', 'Manufacturing', 'Competition', 'Regulatory', 'Pipeline'],
    sentiment: { positive: 68, neutral: 22, negative: 10 },
  }
};

const getRiskBadge = (risk: 'Low' | 'Medium' | 'High') => {
  const classes = {
    Low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    High: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };
  return classes[risk];
};

const SampleOutputs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'market' | 'patents' | 'trials' | 'web' | 'internal' | 'upload'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: 'upload', label: 'File Upload Demo', icon: '📤' },
    { id: 'market', label: 'Market Data', icon: '📊' },
    { id: 'patents', label: 'Patents', icon: '📄' },
    { id: 'trials', label: 'Clinical Trials', icon: '🔬' },
    { id: 'web', label: 'Web Intelligence', icon: '🌐' },
    { id: 'internal', label: 'Internal Docs', icon: '📁' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setIsProcessing(true);
      setShowSummary(false);
      setTimeout(() => {
        setIsProcessing(false);
        setShowSummary(true);
      }, 3000);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploadedFile(file);
      setIsProcessing(true);
      setShowSummary(false);
      setTimeout(() => {
        setIsProcessing(false);
        setShowSummary(true);
      }, 3000);
    }
  };

  const handlePrint = () => window.print();

  const handleExport = () => {
    const content = `
<!DOCTYPE html>
<html>
<head>
  <title>CureCoders Sample Outputs</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; }
    h1 { color: #4F46E5; }
    .section { margin: 30px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
    th { background: #f5f5f5; }
  </style>
</head>
<body>
  <h1>CureCoders AI - Sample Agent Outputs</h1>
  <div class="section">
    <h2>Market Data (IQVIA Agent)</h2>
    <p><strong>Therapy:</strong> ${sampleMarketData.therapy}</p>
    <p><strong>Market Size:</strong> ${sampleMarketData.marketSizeUSD}</p>
    <p><strong>CAGR:</strong> ${sampleMarketData.cagr}</p>
  </div>
  <div class="section">
    <h2>Patent Analysis</h2>
    <table>
      <tr><th>Patent</th><th>Owner</th><th>Expiry</th><th>FTF Risk</th></tr>
      ${samplePatents.map(p => `<tr><td>${p.title}</td><td>${p.owner}</td><td>${p.expiryDate}</td><td>${p.ftRisk}</td></tr>`).join('')}
    </table>
  </div>
  <div class="section">
    <h2>Clinical Trials</h2>
    <table>
      <tr><th>NCT ID</th><th>Title</th><th>Phase</th><th>Status</th></tr>
      ${sampleTrials.map(t => `<tr><td>${t.id}</td><td>${t.title}</td><td>${t.phase}</td><td>${t.status}</td></tr>`).join('')}
    </table>
  </div>
</body>
</html>`;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CureCoders_Sample_Outputs.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const triggerDemo = () => {
    setUploadedFile(new File([''], 'Q3_2024_Strategic_Review.pdf', { type: 'application/pdf' }));
    setIsProcessing(true);
    setShowSummary(false);
    setTimeout(() => {
      setIsProcessing(false);
      setShowSummary(true);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-12 print:bg-white print:text-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 print:text-indigo-600">
            Sample Agent Outputs
          </h1>
          <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto print:text-gray-600">
            Explore real examples of what each AI agent produces. Upload a document or view interactive demos.
          </p>
          
          <div className="flex justify-center gap-3 mt-6 print:hidden">
            <button onClick={handlePrint} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-slate-700">
          <div className="border-b border-slate-700">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 min-w-[140px] px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-900/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'upload' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-xl p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">Internal Docs Agent - File Upload Demo</h3>
                  <p className="opacity-90">Upload any document (PDF, DOCX, TXT) to see AI-powered summarization</p>
                </div>

                <div 
                  className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center hover:border-cyan-500 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="text-5xl mb-4">📁</div>
                  <p className="text-slate-300 mb-2">Drag & drop a file here, or click to browse</p>
                  <p className="text-slate-500 text-sm">Supports PDF, DOCX, TXT (max 10MB)</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); triggerDemo(); }}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition"
                  >
                    Try Demo with Sample File
                  </button>
                </div>

                {isProcessing && (
                  <div className="bg-slate-900/50 rounded-xl p-8 text-center">
                    <div className="inline-flex items-center gap-3">
                      <svg className="animate-spin w-8 h-8 text-cyan-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      <span className="text-white text-lg">Processing document with AI agents...</span>
                    </div>
                    <div className="mt-4 flex justify-center gap-2">
                      {['Parsing', 'Extracting', 'Analyzing', 'Summarizing'].map((step, idx) => (
                        <span key={idx} className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-xs animate-pulse" style={{ animationDelay: `${idx * 200}ms` }}>
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {showSummary && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xl">📄</span>
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">{sampleDocumentSummary.fileName}</h4>
                            <p className="text-slate-400 text-sm">{sampleDocumentSummary.fileSize} • {sampleDocumentSummary.pages} pages</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-cyan-400 font-semibold">{sampleDocumentSummary.processingTime}</span>
                          <p className="text-slate-500 text-xs">Processing time</p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-lg p-4 mb-6 border border-indigo-500/30">
                        <h5 className="text-indigo-300 font-semibold mb-2">Executive Summary</h5>
                        <p className="text-slate-300 leading-relaxed">{sampleDocumentSummary.summary.executive}</p>
                      </div>

                      <h5 className="text-white font-semibold mb-3">Key Findings</h5>
                      <div className="space-y-3">
                        {sampleDocumentSummary.summary.keyFindings.map((finding, idx) => (
                          <div key={idx} className={`rounded-lg p-4 border-l-4 ${
                            finding.sentiment === 'positive' ? 'bg-emerald-900/20 border-emerald-500' :
                            finding.sentiment === 'warning' ? 'bg-amber-900/20 border-amber-500' :
                            'bg-slate-800 border-slate-500'
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`w-2 h-2 rounded-full ${
                                finding.sentiment === 'positive' ? 'bg-emerald-500' :
                                finding.sentiment === 'warning' ? 'bg-amber-500' :
                                'bg-slate-400'
                              }`}></span>
                              <h6 className="text-white font-medium">{finding.title}</h6>
                            </div>
                            <p className="text-slate-400 text-sm pl-4">{finding.detail}</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-slate-800 rounded-lg p-4">
                          <h6 className="text-slate-400 text-xs uppercase tracking-wide mb-2">Entities Extracted</h6>
                          <div className="flex flex-wrap gap-1">
                            {sampleDocumentSummary.summary.entities.map((e, i) => (
                              <span key={i} className="px-2 py-1 text-xs bg-purple-900/50 text-purple-300 rounded">{e}</span>
                            ))}
                          </div>
                        </div>
                        <div className="bg-slate-800 rounded-lg p-4">
                          <h6 className="text-slate-400 text-xs uppercase tracking-wide mb-2">Topics Identified</h6>
                          <div className="flex flex-wrap gap-1">
                            {sampleDocumentSummary.summary.topics.map((t, i) => (
                              <span key={i} className="px-2 py-1 text-xs bg-indigo-900/50 text-indigo-300 rounded">{t}</span>
                            ))}
                          </div>
                        </div>
                        <div className="bg-slate-800 rounded-lg p-4">
                          <h6 className="text-slate-400 text-xs uppercase tracking-wide mb-2">Sentiment Analysis</h6>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden flex">
                              <div className="bg-emerald-500 h-full" style={{ width: `${sampleDocumentSummary.summary.sentiment.positive}%` }}></div>
                              <div className="bg-slate-400 h-full" style={{ width: `${sampleDocumentSummary.summary.sentiment.neutral}%` }}></div>
                              <div className="bg-red-500 h-full" style={{ width: `${sampleDocumentSummary.summary.sentiment.negative}%` }}></div>
                            </div>
                          </div>
                          <div className="flex justify-between mt-2 text-xs">
                            <span className="text-emerald-400">{sampleDocumentSummary.summary.sentiment.positive}% Positive</span>
                            <span className="text-slate-400">{sampleDocumentSummary.summary.sentiment.neutral}% Neutral</span>
                            <span className="text-red-400">{sampleDocumentSummary.summary.sentiment.negative}% Negative</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'market' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                  <h3 className="text-xl font-bold mb-4">IQVIA Agent Output: Market Analysis</h3>
                  <p className="opacity-90">Query: "Analyze GLP-1 agonist market for obesity indication"</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-200">Market Overview</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500">Therapy Area</span>
                        <span className="font-semibold">{sampleMarketData.therapy}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500">Lead Molecule</span>
                        <span className="font-semibold">{sampleMarketData.molecule}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500">Market Size</span>
                        <span className="font-semibold text-green-600">{sampleMarketData.marketSizeUSD}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500">CAGR</span>
                        <span className="font-semibold text-blue-600">{sampleMarketData.cagr}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Market Share</h4>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-32 rounded-full" style={{
                        background: 'conic-gradient(#4F46E5 0% 62%, #10B981 62% 90%, #F59E0B 90% 100%)'
                      }}></div>
                      <div className="space-y-2">
                        {sampleMarketData.topCompetitors.map((c, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: ['#4F46E5', '#10B981', '#F59E0B'][i] }}></div>
                            <span>{c.name}: <strong>{c.share}</strong></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">AI Insight</h4>
                  <p className="text-slate-600 dark:text-slate-300 italic">"{sampleMarketData.insights}"</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Market Growth Trajectory</h4>
                  <div className="h-48 flex items-end justify-around gap-2">
                    {sampleMarketData.marketGrowth.map((d, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div 
                          className="w-12 bg-gradient-to-t from-indigo-600 to-cyan-500 rounded-t"
                          style={{ height: `${(d.sizeB / 25) * 150}px` }}
                        ></div>
                        <span className="text-xs mt-2 text-slate-500">{d.year}</span>
                        <span className="text-xs font-semibold">${d.sizeB}B</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'patents' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-6 text-white">
                  <h3 className="text-xl font-bold mb-4">Patent Agent Output: Landscape Analysis</h3>
                  <p className="opacity-90">Query: "Show GLP-1 patent expirations and FTF risk"</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800">
                      <tr>
                        <th className="text-left p-3">Patent Title</th>
                        <th className="text-left p-3">Owner</th>
                        <th className="text-left p-3">Expiry Date</th>
                        <th className="text-left p-3">FTF Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {samplePatents.map((p, i) => (
                        <tr key={i} className="border-t border-slate-200 dark:border-slate-700">
                          <td className="p-3 font-medium">{p.title}</td>
                          <td className="p-3">{p.owner}</td>
                          <td className="p-3">{p.expiryDate}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskBadge(p.ftRisk)}`}>
                              {p.ftRisk}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Patent Expiry Timeline</h4>
                  <div className="relative h-16">
                    <div className="absolute inset-x-0 top-1/2 h-1 bg-slate-300 dark:bg-slate-600"></div>
                    {samplePatents.map((p, i) => {
                      const year = new Date(p.expiryDate).getFullYear();
                      const pos = ((year - 2025) / 12) * 100;
                      return (
                        <div key={i} className="absolute top-1/2 -translate-y-1/2 transform" style={{ left: `${Math.min(pos, 95)}%` }}>
                          <div className={`w-4 h-4 rounded-full ${p.ftRisk === 'High' ? 'bg-red-500' : p.ftRisk === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                          <span className="absolute top-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap">{year}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-8">
                    <span>2025</span>
                    <span>2037</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'trials' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-6 text-white">
                  <h3 className="text-xl font-bold mb-4">Clinical Trials Agent Output</h3>
                  <p className="opacity-90">Query: "List active GLP-1 trials for obesity and cardiovascular outcomes"</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800">
                      <tr>
                        <th className="text-left p-3">NCT ID</th>
                        <th className="text-left p-3">Title</th>
                        <th className="text-left p-3">Phase</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Sponsor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleTrials.map((t, i) => (
                        <tr key={i} className="border-t border-slate-200 dark:border-slate-700">
                          <td className="p-3 font-mono text-xs">{t.id}</td>
                          <td className="p-3">{t.title}</td>
                          <td className="p-3">
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                              {t.phase}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              t.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                              t.status === 'Active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="p-3">{t.sponsor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">5</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Total Trials</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-600">2</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Completed</div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-yellow-600">2</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Recruiting</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'web' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl p-6 text-white">
                  <h3 className="text-xl font-bold mb-4">Web Intelligence Agent Output</h3>
                  <p className="opacity-90">Query: "Latest news and sentiment for GLP-1 market"</p>
                </div>

                <div className="space-y-4">
                  {sampleWebSignals.map((s, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-slate-800 dark:text-white">{s.title}</h4>
                        <span className="text-xs text-slate-500">{s.source}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{s.excerpt}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">Sentiment:</span>
                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${s.sentiment > 0.6 ? 'bg-green-500' : s.sentiment > 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${s.sentiment * 100}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-semibold ${s.sentiment > 0.6 ? 'text-green-600' : s.sentiment > 0.4 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {s.sentiment > 0.6 ? 'Positive' : s.sentiment > 0.4 ? 'Neutral' : 'Negative'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'internal' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl p-6 text-white">
                  <h3 className="text-xl font-bold mb-4">Internal Docs Agent Output</h3>
                  <p className="opacity-90">Uploaded: "Q3_2024_Strategic_Review.pdf"</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
                  <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Document Summary</h4>
                  <ul className="space-y-3">
                    {sampleInternalSummary.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-slate-600 dark:text-slate-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <h5 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Entities Extracted</h5>
                    <div className="flex flex-wrap gap-2">
                      {['Wegovy', 'Q3 2024', 'Europe', 'Q2 2025', 'Lilly', 'GLP-1', 'H1 2025'].map((e, i) => (
                        <span key={i} className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <h5 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Topics Identified</h5>
                    <div className="flex flex-wrap gap-2">
                      {['Sales Performance', 'Market Access', 'Manufacturing', 'Competition', 'Regulatory'].map((t, i) => (
                        <span key={i} className="px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SampleOutputs;