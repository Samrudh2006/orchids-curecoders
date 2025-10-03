import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Workspace from './components/Workspace';
import Footer from './components/Footer';
import { useAppContext } from './hooks/useAppContext';

function App() {
  const [theme, setTheme] = useState('dark');
  const { agents } = useAppContext();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };
  
  const handleTryDemo = () => {
    document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const hasResults = agents.length > 0;

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main>
        {!hasResults && <Hero onTryDemo={handleTryDemo} />}
        <Workspace />
      </main>
      <Footer />
    </div>
  );
}

export default App;