import React from 'react';
import Hero from '../components/Hero';
import Workspace from '../components/Workspace';
import { useAppContext } from '../hooks/useAppContext';

const Home = () => {
  const { agents } = useAppContext();

  const handleTryDemo = () => {
    document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth' });
  };

  const hasResults = agents.length > 0;

  return (
    <>
      {!hasResults && <Hero onTryDemo={handleTryDemo} />}
      <Workspace />
    </>
  );
};

export default Home;
