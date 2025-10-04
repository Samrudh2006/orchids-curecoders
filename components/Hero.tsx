import React from 'react';

interface HeroProps {
    onTryDemo: () => void;
}

const MoleculeParticles = () => (
    <div className="absolute inset-0 z-0" aria-hidden="true">
        {/* A scattered set of particles with varying sizes, positions, colors, and animation delays */}
        <div className="absolute top-[20%] left-[10%] w-2 h-2 bg-primary/40 rounded-full animate-float" style={{ animationDelay: '0s', animationDuration: '10s' }}></div>
        <div className="absolute top-[80%] left-[5%] w-3 h-3 bg-secondary/40 rounded-full animate-float" style={{ animationDelay: '1.5s', animationDuration: '12s' }}></div>
        <div className="absolute top-[15%] left-[30%] w-1 h-1 bg-primary/30 rounded-full animate-float" style={{ animationDelay: '3s', animationDuration: '8s' }}></div>
        <div className="absolute top-[50%] left-[45%] w-3 h-3 bg-secondary/50 rounded-full animate-float" style={{ animationDelay: '0.5s', animationDuration: '11s' }}></div>
        <div className="absolute top-[5%] left-[60%] w-2 h-2 bg-primary/40 rounded-full animate-float" style={{ animationDelay: '2s', animationDuration: '9s' }}></div>
        <div className="absolute top-[70%] left-[75%] w-4 h-4 bg-secondary/30 rounded-full animate-float" style={{ animationDelay: '1s', animationDuration: '13s' }}></div>
        <div className="absolute top-[30%] left-[90%] w-2 h-2 bg-primary/50 rounded-full animate-float" style={{ animationDelay: '2.5s', animationDuration: '10s' }}></div>
        <div className="absolute top-[90%] left-[50%] w-1 h-1 bg-secondary/30 rounded-full animate-float" style={{ animationDelay: '4s', animationDuration: '7s' }}></div>
    </div>
);


const Hero: React.FC<HeroProps> = ({ onTryDemo }) => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"></div>
      <div
        className="absolute inset-0 bg-no-repeat bg-cover bg-center opacity-30 dark:opacity-20"
        style={{backgroundImage: "url('https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=2070&auto=format&fit=crop')"}}
      ></div>
      <MoleculeParticles />
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
        <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          Pharma Intelligence, Reimagined
        </h1>
        <p className="mt-6 text-lg sm:text-xl max-w-3xl mx-auto text-slate-600 dark:text-slate-300">
          From query to dashboard in minutes. Our AI agents build dynamic, interactive reports to accelerate your strategic decisions in drug development and repurposing.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <button
            onClick={onTryDemo}
            className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-primary to-secondary hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800"
          >
            <span className="relative px-8 py-3 transition-all ease-in duration-75 bg-white dark:bg-slate-900 rounded-md group-hover:bg-opacity-0">
              Try the Demo
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;