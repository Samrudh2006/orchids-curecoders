import React, { useState, useEffect } from 'react';
import { X, GitCompare, Plus, Trash2, ChevronDown, BarChart, FileText, Microscope, Calendar } from './Icons';

interface ResearchResult {
  id: string;
  prompt: string;
  timestamp: string;
  summary: string;
  marketData?: {
    marketSizeUSD: string;
    cagr: string;
    therapy: string;
  };
  patentCount?: number;
  clinicalTrialCount?: number;
}

interface ComparisonToolProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ComparisonTool({ isOpen, onClose }: ComparisonToolProps) {
  const [savedResults, setSavedResults] = useState<ResearchResult[]>([]);
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('curecoders_comparison_results');
    if (saved) {
      setSavedResults(JSON.parse(saved));
    }
  }, [isOpen]);

  const addToComparison = (id: string) => {
    if (selectedResults.length < 3 && !selectedResults.includes(id)) {
      setSelectedResults([...selectedResults, id]);
    }
    setShowSelector(false);
  };

  const removeFromComparison = (id: string) => {
    setSelectedResults(selectedResults.filter(r => r !== id));
  };

  const getResult = (id: string) => savedResults.find(r => r.id === id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-6xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-500 rounded-xl">
              <GitCompare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Research Comparison</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Compare up to 3 research results side-by-side</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {selectedResults.length === 0 ? (
            <div className="text-center py-16">
              <GitCompare className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">No Results Selected</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Add research results to start comparing</p>
              <button
                onClick={() => setShowSelector(true)}
                className="px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Add Research Result
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className={`grid gap-4 ${selectedResults.length === 1 ? 'grid-cols-1' : selectedResults.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {selectedResults.map((id, index) => {
                  const result = getResult(id);
                  if (!result) return null;
                  
                  return (
                    <div key={id} className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className="p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-violet-500 mb-1 block">Result {index + 1}</span>
                            <h4 className="font-semibold text-slate-800 dark:text-white truncate">{result.prompt}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(result.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromComparison(id)}
                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-4">
                        {result.marketData && (
                          <div className="p-3 bg-white dark:bg-slate-700 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <BarChart className="w-4 h-4 text-cyan-500" />
                              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Market Data</span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Market Size</span>
                                <span className="font-semibold text-slate-800 dark:text-white">${result.marketData.marketSizeUSD}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-500">CAGR</span>
                                <span className="font-semibold text-green-600">{result.marketData.cagr}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Therapy</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">{result.marketData.therapy}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-3 bg-white dark:bg-slate-700 rounded-lg text-center">
                            <FileText className="w-5 h-5 mx-auto text-orange-500 mb-1" />
                            <div className="text-lg font-bold text-slate-800 dark:text-white">{result.patentCount || 0}</div>
                            <div className="text-xs text-slate-500">Patents</div>
                          </div>
                          <div className="p-3 bg-white dark:bg-slate-700 rounded-lg text-center">
                            <Microscope className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                            <div className="text-lg font-bold text-slate-800 dark:text-white">{result.clinicalTrialCount || 0}</div>
                            <div className="text-xs text-slate-500">Trials</div>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-white dark:bg-slate-700 rounded-lg">
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-2">Summary</span>
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-4">{result.summary}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {selectedResults.length < 3 && (
                  <button
                    onClick={() => setShowSelector(true)}
                    className="min-h-[300px] border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all group"
                  >
                    <Plus className="w-10 h-10 text-slate-400 group-hover:text-violet-500 transition-colors" />
                    <span className="text-slate-500 group-hover:text-violet-600 font-medium">Add Result</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {showSelector && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md max-h-[70vh] overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-white">Select Research Result</h3>
                <button onClick={() => setShowSelector(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-4 overflow-auto max-h-[50vh]">
                {savedResults.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No saved results. Run some queries first!</p>
                ) : (
                  <div className="space-y-2">
                    {savedResults.filter(r => !selectedResults.includes(r.id)).map(result => (
                      <button
                        key={result.id}
                        onClick={() => addToComparison(result.id)}
                        className="w-full text-left p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <p className="font-medium text-slate-800 dark:text-white truncate">{result.prompt}</p>
                        <p className="text-xs text-slate-500 mt-1">{new Date(result.timestamp).toLocaleString()}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
