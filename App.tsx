import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { VoiceAssistantProvider } from './context/VoiceAssistantContext';
import Header from './components/Header';
import Footer from './components/Footer';
import VoiceAssistantUI from './components/VoiceAssistantUI';
import Home from './pages/Home';
import History from './pages/History';

function App() {
  return (
    <ThemeProvider>
      <VoiceAssistantProvider>
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
          </div>
        </Router>
      </VoiceAssistantProvider>
    </ThemeProvider>
  );
}

export default App;