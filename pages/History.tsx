import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { History as HistoryIcon, Trash2, ExternalLink, Calendar } from '../components/Icons';

const History = () => {
  const navigate = useNavigate();
  const { searchHistory, runMasterAgent } = useAppContext();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleReplay = (prompt: string) => {
    runMasterAgent(prompt);
    navigate('/');
  };

  const handleDelete = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const storedHistory = localStorage.getItem('searchHistoryDetailed');
    if (storedHistory) {
      const history = JSON.parse(storedHistory);
      const updated = history.filter((item: any) => item.id !== id);
      localStorage.setItem('searchHistoryDetailed', JSON.stringify(updated));
      window.location.reload();
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      localStorage.removeItem('searchHistoryDetailed');
      window.location.reload();
    }
  };

  const getDetailedHistory = () => {
    const stored = localStorage.getItem('searchHistoryDetailed');
    return stored ? JSON.parse(stored) : [];
  };

  const detailedHistory = getDetailedHistory();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <HistoryIcon className="w-8 h-8 text-primary" />
            <h1 className="font-display text-3xl font-bold text-slate-800 dark:text-slate-100">
              Search History
            </h1>
          </div>
          {detailedHistory.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        {detailedHistory.length === 0 ? (
          <div className="text-center py-16">
            <HistoryIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
              No search history yet
            </h3>
            <p className="text-slate-500 dark:text-slate-500 mb-6">
              Start by running your first query from the home page
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white bg-primary rounded-lg hover:bg-primary-light transition-colors"
            >
              Go to Home
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {detailedHistory.map((item: any) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-all hover:shadow-md"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {formatDate(item.timestamp)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                        {item.prompt}
                      </h3>
                      {item.summary && (
                        <div className="mt-3">
                          <button
                            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                            className="text-sm text-primary hover:text-primary-light font-medium"
                          >
                            {expandedId === item.id ? 'Hide Summary' : 'Show Summary'}
                          </button>
                          {expandedId === item.id && (
                            <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                              {item.summary}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReplay(item.prompt)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-light transition-colors"
                        title="Run this query again"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Replay
                      </button>
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete this entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {item.agentCount && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">
                        {item.agentCount} agents deployed
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
