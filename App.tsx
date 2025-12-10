import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { VoiceAssistantProvider } from './context/VoiceAssistantContext';
import { QueryLimitProvider } from './context/QueryLimitContext';
import ARIAEnhancedWrapper from './components/ARIAEnhancedWrapper';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import History from './pages/History';
import Architecture from './pages/Architecture';
import SampleOutputs from './pages/SampleOutputs';
import MockAPIs from './pages/MockAPIs';
import StrategicQueries from './pages/StrategicQueries';
import ProductJourney from './pages/ProductJourney';
import ReportsDemo from './pages/ReportsDemo';
import Payment from './pages/Payment';
import SearchModal from './components/SearchModal';
import ComparisonTool from './components/ComparisonTool';
import CollaborationPanel from './components/CollaborationPanel';
import BookmarksManager from './components/BookmarksManager';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function AppContent() {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const [showSearch, setShowSearch] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const closeAllModals = () => {
    setShowSearch(false);
    setShowComparison(false);
    setShowCollaboration(false);
    setShowBookmarks(false);
    setShowShortcuts(false);
  };

  useKeyboardShortcuts({
    'ctrl+k': () => {
      closeAllModals();
      setShowSearch(true);
    },
    'ctrl+b': () => {
      closeAllModals();
      setShowBookmarks(true);
    },
    'ctrl+shift+c': () => {
      closeAllModals();
      setShowComparison(true);
    },
    'ctrl+shift+t': toggleTheme,
    'escape': closeAllModals,
    'shift+?': () => {
      closeAllModals();
      setShowShortcuts(true);
    },
  });

  const handleSearch = (query: string) => {
    const saved = JSON.parse(localStorage.getItem('curecoders_recent_searches') || '[]');
    const updated = [query, ...saved.filter((s: string) => s !== query)].slice(0, 10);
    localStorage.setItem('curecoders_recent_searches', JSON.stringify(updated));
    navigate('/');
    window.dispatchEvent(new CustomEvent('run-query', { detail: query }));
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
      <Header 
        onOpenSearch={() => setShowSearch(true)}
        onOpenBookmarks={() => setShowBookmarks(true)}
        onOpenComparison={() => setShowComparison(true)}
        onOpenCollaboration={() => setShowCollaboration(true)}
      />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/samples" element={<SampleOutputs />} />
          <Route path="/apis" element={<MockAPIs />} />
          <Route path="/queries" element={<StrategicQueries />} />
          <Route path="/journey" element={<ProductJourney />} />
          <Route path="/reports" element={<ReportsDemo />} />
          <Route path="/payment" element={<Payment />} />
        </Routes>
      </main>
      <Footer />

      <SearchModal 
        isOpen={showSearch} 
        onClose={() => setShowSearch(false)} 
        onSearch={handleSearch}
      />
      <ComparisonTool 
        isOpen={showComparison} 
        onClose={() => setShowComparison(false)} 
      />
      <CollaborationPanel 
        isOpen={showCollaboration} 
        onClose={() => setShowCollaboration(false)} 
      />
      <BookmarksManager 
        isOpen={showBookmarks} 
        onClose={() => setShowBookmarks(false)} 
      />
      <KeyboardShortcutsModal 
        isOpen={showShortcuts} 
        onClose={() => setShowShortcuts(false)} 
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <VoiceAssistantProvider>
        <QueryLimitProvider>
          <ARIAEnhancedWrapper>
            <Router>
              <AppContent />
            </Router>
          </ARIAEnhancedWrapper>
        </QueryLimitProvider>
      </VoiceAssistantProvider>
    </ThemeProvider>
  );
}

export default App;
