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
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-cyan-900">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-no-repeat bg-cover bg-center opacity-20 dark:opacity-10"
        style={{backgroundImage: "url('https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=2070&auto=format&fit=crop')"}}
      ></div>
      
      {/* Animated Particles */}
      <MoleculeParticles />
      
      {/* Content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center animate-fade-in">
          {/* Main Heading */}
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 rounded-full text-sm font-semibold mb-6 animate-bounce-soft">
              🧬 AI-Powered Pharmaceutical Intelligence
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 leading-tight">
              CureCoders
            </h1>
            <p className="mt-4 font-display text-xl sm:text-2xl lg:text-3xl font-bold text-slate-700 dark:text-slate-200">
              Pharmaceutical Intelligence Platform
            </p>
          </div>
          
          {/* Subtitle */}
          <p className="mt-8 text-lg sm:text-xl max-w-4xl mx-auto text-slate-600 dark:text-slate-300 leading-relaxed animate-slide-up">
            From query to comprehensive insights in minutes. Our AI agents orchestrate dynamic, 
            data-driven reports to accelerate your strategic decisions in drug discovery, 
            competitive intelligence, and market analysis.
          </p>
          
          {/* Key Features */}
          <div className="mt-12 flex flex-wrap justify-center gap-4 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center space-x-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Multi-Agent AI</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Real-time Analysis</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Advanced Reporting</span>
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="mt-12 animate-slide-up" style={{animationDelay: '0.4s'}}>
            <button
              onClick={onTryDemo}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center space-x-2">
                <span>Start Your Analysis</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                </svg>
              </span>
            </button>
            
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              No signup required • Instant access • Professional results
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;