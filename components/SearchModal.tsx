import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, Sparkles, FileText, History } from './Icons';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}

export default function SearchModal({ isOpen, onClose, onSearch }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const saved = localStorage.getItem('curecoders_recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, [isOpen]);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('curecoders_recent_searches', JSON.stringify(updated));
    
    onSearch(searchQuery);
    onClose();
    setQuery('');
  };

  const quickActions = [
    { label: 'New Query', icon: Sparkles, action: () => handleSearch(query || 'diabetes drug market') },
    { label: 'View History', icon: History, action: () => window.location.href = '/history' },
    { label: 'View Reports', icon: FileText, action: () => window.location.href = '/reports' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
            placeholder="Search queries, reports, or type a new research question..."
            className="flex-1 bg-transparent text-lg text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:block px-2 py-1 text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        <div className="p-4">
          {query ? (
            <div>
              <button
                onClick={() => handleSearch(query)}
                className="w-full flex items-center gap-3 p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
              >
                <Sparkles className="w-5 h-5 text-cyan-500" />
                <span className="text-slate-800 dark:text-white">Run AI analysis for: <span className="font-semibold text-cyan-600 dark:text-cyan-400">{query}</span></span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Quick Actions</h3>
                <div className="grid grid-cols-3 gap-2">
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={action.action}
                      className="flex flex-col items-center gap-2 p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <action.icon className="w-5 h-5 text-cyan-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {recentSearches.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recent Searches</h3>
                  <div className="space-y-1">
                    {recentSearches.map((search, i) => (
                      <button
                        key={i}
                        onClick={() => handleSearch(search)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
                      >
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-300 truncate">{search}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-400">
          <span>Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded">Enter</kbd> to search</span>
          <span className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded">K</kbd> to open
          </span>
        </div>
      </div>
    </div>
  );
}
