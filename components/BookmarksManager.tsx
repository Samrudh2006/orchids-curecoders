import React, { useState, useEffect } from 'react';
import { X, Bookmark, Trash2, Clock, Sparkles, Search } from './Icons';

interface BookmarkedQuery {
  id: string;
  query: string;
  timestamp: string;
  tags: string[];
}

interface BookmarksManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookmarksManager({ isOpen, onClose }: BookmarksManagerProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkedQuery[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('curecoders_bookmarks');
      if (saved) {
        setBookmarks(JSON.parse(saved));
      }
    }
  }, [isOpen]);

  const saveBookmarks = (updated: BookmarkedQuery[]) => {
    setBookmarks(updated);
    localStorage.setItem('curecoders_bookmarks', JSON.stringify(updated));
  };

  const removeBookmark = (id: string) => {
    saveBookmarks(bookmarks.filter(b => b.id !== id));
  };

  const addTag = (id: string, tag: string) => {
    if (!tag.trim()) return;
    saveBookmarks(bookmarks.map(b => 
      b.id === id ? { ...b, tags: [...new Set([...b.tags, tag.trim()])] } : b
    ));
    setNewTag('');
  };

  const removeTag = (id: string, tag: string) => {
    saveBookmarks(bookmarks.map(b => 
      b.id === id ? { ...b, tags: b.tags.filter(t => t !== tag) } : b
    ));
  };

  const runQuery = (query: string) => {
    window.dispatchEvent(new CustomEvent('run-query', { detail: query }));
    onClose();
  };

  const filteredBookmarks = bookmarks.filter(b => 
    b.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[80vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500 rounded-xl">
              <Bookmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Bookmarked Queries</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your saved research queries</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search bookmarks..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {filteredBookmarks.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-slate-500 dark:text-slate-400">
                {searchTerm ? 'No bookmarks match your search' : 'No bookmarks yet'}
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                Click the bookmark icon on any query to save it here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookmarks.map(bookmark => (
                <div key={bookmark.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 dark:text-white">{bookmark.query}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(bookmark.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => runQuery(bookmark.query)}
                        className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                        title="Run this query"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                      </button>
                      <button
                        onClick={() => removeBookmark(bookmark.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    {bookmark.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(bookmark.id, tag)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder="+ Add tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addTag(bookmark.id, newTag);
                        }
                      }}
                      onBlur={() => addTag(bookmark.id, newTag)}
                      className="px-2 py-1 text-xs bg-transparent border border-dashed border-slate-300 dark:border-slate-600 rounded-full w-20 focus:w-28 transition-all focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-xs text-slate-500 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">B</kbd> to open bookmarks
          </p>
        </div>
      </div>
    </div>
  );
}
