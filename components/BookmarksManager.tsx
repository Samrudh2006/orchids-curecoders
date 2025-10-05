import React, { useState } from 'react';
import { useBookmarks } from '../context/BookmarksContext';
import { useAppContext } from '../hooks/useAppContext';
import { useVoiceFeatures } from '../hooks/useVoiceFeatures';
import { Bookmark, Heart, Tag, Calendar, Search, Filter, Download, Upload, Trash2, X, Plus } from './Icons';

interface BookmarksManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookmarksManager: React.FC<BookmarksManagerProps> = ({ isOpen, onClose }) => {
  const {
    bookmarks,
    favorites,
    removeBookmark,
    toggleFavorite,
    updateBookmark,
    getBookmarksByCategory,
    searchBookmarks,
    clearAllBookmarks,
    exportBookmarks
  } = useBookmarks();

  const { runMasterAgent } = useAppContext();
  const { explainFeature } = useVoiceFeatures();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', name: 'All Bookmarks', icon: '📋' },
    { id: 'market', name: 'Market Intelligence', icon: '📊' },
    { id: 'patent', name: 'Patent Analysis', icon: '⚖️' },
    { id: 'clinical', name: 'Clinical Data', icon: '🧪' },
    { id: 'competitive', name: 'Competitive Research', icon: '🏢' },
    { id: 'general', name: 'General Research', icon: '🔬' }
  ];

  // Filter bookmarks based on search and category
  let filteredBookmarks = bookmarks;

  if (searchQuery) {
    filteredBookmarks = searchBookmarks(searchQuery);
  }

  if (selectedCategory !== 'all') {
    filteredBookmarks = filteredBookmarks.filter(b => b.category === selectedCategory);
  }

  if (showFavoritesOnly) {
    filteredBookmarks = filteredBookmarks.filter(b => b.isFavorite);
  }

  const handleRunQuery = (query: string) => {
    runMasterAgent(query);
    onClose();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.icon || '📋';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-6xl max-h-[85vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-slate-800 dark:to-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Research Bookmarks</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {bookmarks.length} saved queries • {favorites.length} favorites
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportBookmarks}
              onMouseEnter={() => explainFeature('export-bookmarks')}
              className="p-2 text-slate-400 hover:text-cyan-600 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Export bookmarks"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={clearAllBookmarks}
              className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Clear all bookmarks"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex h-[70vh]">
          {/* Sidebar */}
          <div className="w-64 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
            {/* Search */}
            <div className="relative mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bookmarks..."
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>

            {/* Filters */}
            <div className="mb-4">
              <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <input
                  type="checkbox"
                  checked={showFavoritesOnly}
                  onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                  className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                <Heart className="w-4 h-4" />
                <span>Favorites only</span>
              </label>
            </div>

            {/* Categories */}
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Categories
              </h3>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                  <span className="ml-auto text-xs">
                    {category.id === 'all' ? bookmarks.length : getBookmarksByCategory(category.id).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredBookmarks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                  <Bookmark className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                  {searchQuery ? 'No matching bookmarks' : 'No bookmarks yet'}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 max-w-md">
                  {searchQuery 
                    ? 'Try adjusting your search or filters to find what you\'re looking for.'
                    : 'Save your pharmaceutical research queries to quickly access them later.'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredBookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-4 hover:shadow-lg transition-all duration-200 group"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getCategoryIcon(bookmark.category)}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-800 dark:text-white text-sm truncate">
                            {bookmark.title}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {formatDate(bookmark.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleFavorite(bookmark.id)}
                          className={`p-1 rounded transition-colors ${
                            bookmark.isFavorite
                              ? 'text-red-500 hover:text-red-600'
                              : 'text-slate-400 hover:text-red-500'
                          }`}
                        >
                          <Heart className="w-4 h-4" fill={bookmark.isFavorite ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => removeBookmark(bookmark.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Query */}
                    <div className="mb-3">
                      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                        {bookmark.query}
                      </p>
                    </div>

                    {/* Description */}
                    {bookmark.description && (
                      <div className="mb-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {bookmark.description}
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {bookmark.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {bookmark.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 text-xs bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-full"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {bookmark.tags.length > 3 && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            +{bookmark.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-600">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {bookmark.category} research
                      </div>
                      <button
                        onClick={() => handleRunQuery(bookmark.query)}
                        className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105"
                      >
                        Run Query
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookmarksManager;