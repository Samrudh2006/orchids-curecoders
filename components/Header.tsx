import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, Search, History } from './Icons';
import { Logo } from '../assets/logo';
import { useAppContext } from '../hooks/useAppContext';

interface HeaderProps {
  theme: string;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  const [searchPrompt, setSearchPrompt] = useState('');
  const { runMasterAgent, isOrchestrating } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchPrompt.trim()) {
      runMasterAgent(searchPrompt);
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <Logo className="w-10 h-10" />
          <span className="font-display font-bold text-xl text-slate-800 dark:text-white">CureCoders</span>
        </Link>

        <div className="flex-1 max-w-xl mx-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchPrompt}
              onChange={(e) => setSearchPrompt(e.target.value)}
              placeholder="Global search for molecules, therapies, competitors..."
              disabled={isOrchestrating}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-primary focus:ring-0 transition"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/history"
            className={`p-2 rounded-lg transition-colors ${
              location.pathname === '/history'
                ? 'bg-primary/10 text-primary'
                : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
            aria-label="View history"
          >
            <History className="w-6 h-6" />
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
