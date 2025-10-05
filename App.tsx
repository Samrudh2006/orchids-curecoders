import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { VoiceAssistantProvider } from './context/VoiceAssistantContext';
import { ChatProvider } from './context/ChatContext';
import { KeyboardShortcutsProvider } from './context/KeyboardShortcutsContext';
import { BookmarksProvider } from './context/BookmarksContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import Header from './components/Header';
import Footer from './components/Footer';
import VoiceAssistantUI from './components/VoiceAssistantUI';
import ChatInterface from './components/ChatInterface';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import Home from './pages/Home';
import History from './pages/History';

function App() {
  return (
    <AnalyticsProvider>
      <ThemeProvider>
        <VoiceAssistantProvider>
          <ChatProvider>
            <KeyboardShortcutsProvider>
              <BookmarksProvider>
                <Router>
                  <div className="bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
                    <Header />
                    <main>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/history" element={<History />} />
                      </Routes>
                    </main>
                    <Footer />
                    <VoiceAssistantUI />
                    <ChatInterface />
                    <KeyboardShortcutsModal />
                  </div>
                </Router>
              </BookmarksProvider>
            </KeyboardShortcutsProvider>
          </ChatProvider>
        </VoiceAssistantProvider>
      </ThemeProvider>
    </AnalyticsProvider>
  );
}

export default App;