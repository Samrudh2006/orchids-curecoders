import React, { useState } from 'react';

const apiDocs = [
  {
    id: 'iqvia',
    name: 'IQVIA Market Data API',
    baseUrl: 'https://api.curecoders.mock/iqvia/v1',
    description: 'Market intelligence, sales data, prescription trends, and competitor analysis',
    endpoints: [
      {
        method: 'GET',
        path: '/market/size',
        description: 'Get market size for a therapy area',
        params: [
          { name: 'therapy', type: 'string', required: true, example: 'GLP-1 Agonists' },
          { name: 'region', type: 'string', required: false, example: 'Global' },
          { name: 'year', type: 'number', required: false, example: 2024 },
        ],
        response: `{
  "therapy": "GLP-1 Agonists",
  "marketSizeUSD": "$12.4B",
  "cagr": "23.5%",
  "region": "Global",
  "year": 2024
}`,
      },
      {
        method: 'GET',
        path: '/competitors',
        description: 'Get competitor market share data',
        params: [
          { name: 'molecule', type: 'string', required: true, example: 'Semaglutide' },
        ],
        response: `{
  "competitors": [
    { "name": "Novo Nordisk", "share": "62%" },
    { "name": "Eli Lilly", "share": "28%" }
  ]
}`,
      },
    ],
  },
  {
    id: 'uspto',
    name: 'USPTO Patent API',
    baseUrl: 'https://api.curecoders.mock/patents/v1',
    description: 'Patent landscape analysis, expiry tracking, and FTF risk assessment',
    endpoints: [
      {
        method: 'GET',
        path: '/search',
        description: 'Search patents by molecule or owner',
        params: [
          { name: 'query', type: 'string', required: true, example: 'semaglutide' },
          { name: 'status', type: 'string', required: false, example: 'active' },
        ],
        response: `{
  "patents": [
    {
      "id": "US10234567",
      "title": "Semaglutide Composition",
      "owner": "Novo Nordisk",
      "expiryDate": "2026-04-15",
      "ftRisk": "High"
    }
  ],
  "total": 15
}`,
      },
      {
        method: 'GET',
        path: '/expiry-timeline',
        description: 'Get patent expiry timeline for a molecule',
        params: [
          { name: 'molecule', type: 'string', required: true, example: 'GLP-1' },
          { name: 'years', type: 'number', required: false, example: 10 },
        ],
        response: `{
  "timeline": [
    { "year": 2025, "count": 2 },
    { "year": 2026, "count": 3 },
    { "year": 2028, "count": 1 }
  ]
}`,
      },
    ],
  },
  {
    id: 'clinicaltrials',
    name: 'ClinicalTrials.gov API',
    baseUrl: 'https://api.curecoders.mock/trials/v1',
    description: 'Clinical trial data from ClinicalTrials.gov registry',
    endpoints: [
      {
        method: 'GET',
        path: '/search',
        description: 'Search clinical trials by condition or intervention',
        params: [
          { name: 'condition', type: 'string', required: false, example: 'Obesity' },
          { name: 'intervention', type: 'string', required: false, example: 'Semaglutide' },
          { name: 'phase', type: 'string', required: false, example: 'Phase 3' },
          { name: 'status', type: 'string', required: false, example: 'Recruiting' },
        ],
        response: `{
  "trials": [
    {
      "nctId": "NCT05035095",
      "title": "STEP HFpEF Trial",
      "phase": "Phase 3",
      "status": "Completed",
      "sponsor": "Novo Nordisk",
      "enrollment": 529
    }
  ],
  "total": 47
}`,
      },
    ],
  },
  {
    id: 'exim',
    name: 'EXIM Trade Data API',
    baseUrl: 'https://api.curecoders.mock/exim/v1',
    description: 'Import/export trade flows and supply chain intelligence',
    endpoints: [
      {
        method: 'GET',
        path: '/trade-flows',
        description: 'Get import/export data for API (Active Pharmaceutical Ingredient)',
        params: [
          { name: 'api', type: 'string', required: true, example: 'Semaglutide' },
          { name: 'country', type: 'string', required: false, example: 'India' },
        ],
        response: `{
  "api": "Semaglutide",
  "importDependency": "85%",
  "topSourcingCountries": [
    { "country": "China", "share": "45%" },
    { "country": "India", "share": "30%" }
  ],
  "exportVolumes": [
    { "country": "USA", "value": "$2.3B" },
    { "country": "EU", "value": "$1.8B" }
  ]
}`,
      },
    ],
  },
  {
    id: 'web',
    name: 'Web Intelligence API',
    baseUrl: 'https://api.curecoders.mock/web/v1',
    description: 'Real-time web signals, news monitoring, and sentiment analysis',
    endpoints: [
      {
        method: 'GET',
        path: '/news',
        description: 'Get latest news articles with sentiment',
        params: [
          { name: 'query', type: 'string', required: true, example: 'Wegovy' },
          { name: 'days', type: 'number', required: false, example: 7 },
        ],
        response: `{
  "articles": [
    {
      "title": "Wegovy Supply Constraints Easing",
      "source": "Reuters",
      "url": "https://...",
      "sentiment": 0.75,
      "publishedAt": "2024-12-01"
    }
  ],
  "overallSentiment": 0.68
}`,
      },
    ],
  },
];

const MockAPIs: React.FC = () => {
  const [selectedApi, setSelectedApi] = useState(apiDocs[0]);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-cyan-900 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600">
            Mock API Documentation
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Our platform integrates with multiple data sources through these API connectors. 
            Each API is documented below with endpoints and sample responses.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg p-4 sticky top-24">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4">Data Sources</h3>
              <nav className="space-y-2">
                {apiDocs.map((api) => (
                  <button
                    key={api.id}
                    onClick={() => setSelectedApi(api)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedApi.id === api.id
                        ? 'bg-primary text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="font-medium">{api.name.split(' ')[0]}</span>
                    <span className="block text-xs opacity-80">
                      {api.endpoints.length} endpoint{api.endpoints.length > 1 ? 's' : ''}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{selectedApi.name}</h2>
                <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full">
                  Mock API
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-4">{selectedApi.description}</p>
              <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-900 rounded-lg font-mono text-sm">
                <span className="text-slate-500">Base URL:</span>
                <span className="text-primary">{selectedApi.baseUrl}</span>
              </div>
            </div>

            {selectedApi.endpoints.map((endpoint, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 text-xs font-bold rounded ${
                      endpoint.method === 'GET' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-slate-800 dark:text-slate-200 font-mono">{endpoint.path}</code>
                    <button
                      onClick={() => copyToClipboard(`${selectedApi.baseUrl}${endpoint.path}`, `${idx}`)}
                      className="ml-auto text-xs text-primary hover:underline"
                    >
                      {copiedEndpoint === `${idx}` ? 'Copied!' : 'Copy URL'}
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{endpoint.description}</p>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-900/50">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Parameters</h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500 dark:text-slate-400">
                        <th className="pb-2">Name</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Required</th>
                        <th className="pb-2">Example</th>
                      </tr>
                    </thead>
                    <tbody>
                      {endpoint.params.map((param, pIdx) => (
                        <tr key={pIdx} className="border-t border-slate-200 dark:border-slate-700">
                          <td className="py-2 font-mono text-primary">{param.name}</td>
                          <td className="py-2 text-slate-600 dark:text-slate-300">{param.type}</td>
                          <td className="py-2">
                            <span className={`px-2 py-0.5 text-xs rounded ${
                              param.required 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                            }`}>
                              {param.required ? 'Required' : 'Optional'}
                            </span>
                          </td>
                          <td className="py-2 font-mono text-xs text-slate-500">{param.example}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-6">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Sample Response</h4>
                  <pre className="p-4 bg-slate-900 text-green-400 rounded-lg overflow-x-auto text-xs font-mono">
                    {endpoint.response}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Integration Architecture</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-bold mb-2">IQVIA</h3>
              <p className="text-sm opacity-90">Real market data via partnership API with quarterly refresh</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-bold mb-2">USPTO</h3>
              <p className="text-sm opacity-90">Patent data via public API with daily updates</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-bold mb-2">ClinicalTrials.gov</h3>
              <p className="text-sm opacity-90">Official NIH API with real-time trial data</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-bold mb-2">EXIM</h3>
              <p className="text-sm opacity-90">Trade ministry data with monthly updates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockAPIs;
