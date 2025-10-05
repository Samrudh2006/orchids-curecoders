import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { useVoiceFeatures } from '../hooks/useVoiceFeatures';
import { History as HistoryIcon, Trash2, ExternalLink, Calendar, Search, Filter } from '../components/Icons';

const History = () => {
  const navigate = useNavigate();
  const { searchHistory, runMasterAgent } = useAppContext();
  const { speakSectionWelcome, explainFeature, isVoiceEnabled } = useVoiceFeatures();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (isVoiceEnabled) {
      speakSectionWelcome('history');
    }
  }, []);

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

  // Advanced filtering and search
  const filteredHistory = useMemo(() => {
    let history = getDetailedHistory();
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      history = history.filter((item: any) => 
        item.prompt.toLowerCase().includes(query) ||
        (item.summary && item.summary.toLowerCase().includes(query))
      );
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      history = history.filter((item: any) => {
        const itemDate = new Date(item.timestamp);
        const diffDays = Math.floor((now.getTime() - itemDate.getTime()) / 86400000);
        
        switch (dateFilter) {
          case 'today': return diffDays === 0;
          case 'week': return diffDays <= 7;
          case 'month': return diffDays <= 30;
          case 'quarter': return diffDays <= 90;
          default: return true;
        }
      });
    }
    
    return history;
  }, [searchQuery, dateFilter]);

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
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              ← Back to Home
            </button>
            <HistoryIcon className="w-8 h-8 text-primary" />
            <h1 className="font-display text-3xl font-bold text-slate-800 dark:text-slate-100">
              Search History
            </h1>
          </div>
          {detailedHistory.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Advanced Search & Filters */}
        {detailedHistory.length > 0 && (
          <div className={`transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-96 mb-8' : 'max-h-0'}`}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search Input */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Search in queries and summaries
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by keywords, molecules, companies..."
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Time Period
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">Last 3 Months</option>
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Showing {filteredHistory.length} of {detailedHistory.length} results
                  {searchQuery && ` for "${searchQuery}"`}
                  {dateFilter !== 'all' && ` in ${dateFilter === 'today' ? 'today' : dateFilter === 'week' ? 'this week' : dateFilter === 'month' ? 'this month' : 'last 3 months'}`}
                </p>
              </div>
            </div>
          </div>
        )}

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
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
              No results found
            </h3>
            <p className="text-slate-500 dark:text-slate-500 mb-6">
              Try adjusting your search terms or filters
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setDateFilter('all');
              }}
              className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item: any) => (
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
