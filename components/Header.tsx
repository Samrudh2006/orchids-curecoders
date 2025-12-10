import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, Search, History, ChevronDown, Bookmark, Users, GitCompare, Crown } from './Icons';
import { Logo } from '../assets/logo';
import { useAppContext } from '../hooks/useAppContext';
import { useTheme } from '../context/ThemeContext';
import { useVoiceFeatures } from '../hooks/useVoiceFeatures';

const navItems = [
  { path: '/architecture', label: 'Architecture', icon: '🏗️' },
  { path: '/samples', label: 'Sample Outputs', icon: '📊' },
  { path: '/apis', label: 'Mock APIs', icon: '🔌' },
  { path: '/queries', label: 'Strategic Queries', icon: '🔍' },
  { path: '/journey', label: 'Product Journey', icon: '🚀' },
  { path: '/reports', label: 'Reports Demo', icon: '📄' },
];

interface HeaderProps {
  onOpenSearch?: () => void;
  onOpenBookmarks?: () => void;
  onOpenComparison?: () => void;
  onOpenCollaboration?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onOpenSearch, 
  onOpenBookmarks, 
  onOpenComparison, 
  onOpenCollaboration 
}) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { isOrchestrating } = useAppContext();
  const { isDark, toggleTheme } = useTheme();
  const { explainFeature } = useVoiceFeatures();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <Logo className="w-10 h-10" />
          <span className="font-display font-bold text-xl text-slate-800 dark:text-white">CureCoders</span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setIsNavOpen(!isNavOpen)}
              onBlur={() => setTimeout(() => setIsNavOpen(false), 200)}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Documentation
              <ChevronDown className={`w-4 h-4 transition-transform ${isNavOpen ? 'rotate-180' : ''}`} />
            </button>

            {isNavOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      location.pathname === item.path
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center gap-3 pl-4 pr-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-2 border-transparent hover:border-primary/50 transition text-left"
          >
            <Search className="w-5 h-5 text-slate-400" />
            <span className="flex-1 text-slate-400 text-sm">Search queries... (Ctrl+K)</span>
            <kbd className="hidden sm:block px-2 py-1 text-xs font-medium text-slate-400 bg-slate-200 dark:bg-slate-700 rounded">⌘K</kbd>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <div className="lg:hidden relative">
            <button
              onClick={() => setIsNavOpen(!isNavOpen)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>

            {isNavOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsNavOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      location.pathname === item.path
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onOpenCollaboration}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors hidden sm:block"
            title="Team Collaboration"
          >
            <Users className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenComparison}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors hidden sm:block"
            title="Compare Results"
          >
            <GitCompare className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenBookmarks}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            title="Bookmarks (Ctrl+B)"
          >
            <Bookmark className="w-5 h-5" />
          </button>

          <Link
            to="/history"
            onMouseEnter={() => explainFeature('history')}
            className={`p-2 rounded-lg transition-colors ${
              location.pathname === '/history'
                ? 'bg-primary/10 text-primary'
                : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
            aria-label="View history"
          >
            <History className="w-5 h-5" />
          </Link>

          <Link
            to="/payment"
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-medium rounded-lg transition-all"
          >
            <Crown className="w-4 h-4" />
            <span>Upgrade</span>
          </Link>

          <button
            onClick={() => {
              toggleTheme();
              explainFeature('theme-toggle');
            }}
            onMouseEnter={() => explainFeature('theme-toggle')}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;