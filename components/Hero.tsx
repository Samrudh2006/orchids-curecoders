import React from 'react';
import { Link } from 'react-router-dom';
import { useVoiceFeatures } from '../hooks/useVoiceFeatures';
import { useTheme } from '../context/ThemeContext';

interface HeroProps {
    onTryDemo: () => void;
}

const MoleculeParticles = () => (
    <div className="absolute inset-0 z-10 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[20%] left-[10%] w-2 h-2 bg-cyan-400/60 rounded-full animate-float" style={{ animationDelay: '0s', animationDuration: '10s' }}></div>
        <div className="absolute top-[80%] left-[5%] w-3 h-3 bg-purple-400/60 rounded-full animate-float" style={{ animationDelay: '1.5s', animationDuration: '12s' }}></div>
        <div className="absolute top-[15%] left-[30%] w-1 h-1 bg-cyan-400/50 rounded-full animate-float" style={{ animationDelay: '3s', animationDuration: '8s' }}></div>
        <div className="absolute top-[50%] left-[45%] w-3 h-3 bg-blue-400/50 rounded-full animate-float" style={{ animationDelay: '0.5s', animationDuration: '11s' }}></div>
        <div className="absolute top-[5%] left-[60%] w-2 h-2 bg-cyan-400/60 rounded-full animate-float" style={{ animationDelay: '2s', animationDuration: '9s' }}></div>
        <div className="absolute top-[70%] left-[75%] w-4 h-4 bg-purple-400/40 rounded-full animate-float" style={{ animationDelay: '1s', animationDuration: '13s' }}></div>
        <div className="absolute top-[30%] left-[90%] w-2 h-2 bg-cyan-400/60 rounded-full animate-float" style={{ animationDelay: '2.5s', animationDuration: '10s' }}></div>
        <div className="absolute top-[90%] left-[50%] w-1 h-1 bg-blue-400/40 rounded-full animate-float" style={{ animationDelay: '4s', animationDuration: '7s' }}></div>
    </div>
);

const Hero: React.FC<HeroProps> = ({ onTryDemo }) => {
  const { explainFeature } = useVoiceFeatures();
  const { isDark } = useTheme();

  const handleDemoClick = () => {
    explainFeature('demo-suggestion');
    onTryDemo();
  };

  return (
    <div className="relative overflow-hidden min-h-[85vh] flex items-center">

      {/* ── Layer 1: Background Image — conditional filter for crispness ── */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-300"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=2070&auto=format&fit=crop')",
          filter: isDark 
            ? 'brightness(0.85) contrast(1.05) saturate(0.95)' 
            : 'brightness(1.04) contrast(1.18) saturate(1.22)'
        }}
      />

      {/* ── Layer 2: Theme-specific overlays (Layered Glass Architecture) ── */}

      {/* LIGHT: Backdrop blur + subtle base transparency (22% opacity) */}
      <div
        className="absolute inset-0 z-[1] backdrop-blur-[1.5px] dark:hidden"
        style={{ background: 'rgba(255, 255, 255, 0.22)' }}
      />
      {/* LIGHT: Subtle brand gradient (average ~30-40% overlay) */}
      <div
        className="absolute inset-0 z-[2] dark:hidden"
        style={{ 
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.24) 50%, rgba(255, 255, 255, 0.38) 100%)' 
        }}
      />

      {/* DARK: ~60% dark overlay — preserves depth, image visible */}
      <div
        className="absolute inset-0 z-[1] hidden dark:block"
        style={{ background: 'rgba(15,23,42,0.60)' }}
      />
      {/* DARK: Subtle cyan vignette from edges */}
      <div
        className="absolute inset-0 z-[2] hidden dark:block"
        style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(6,182,212,0.08) 100%)' }}
      />

      {/* ── Layer 3: Floating Particles ── */}
      <MoleculeParticles />

      {/* ── Layer 4: Content ── */}
      <div className="relative z-20 w-full container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center animate-fade-in">

          {/* Badge */}
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-bounce-soft
              bg-white/85 dark:bg-cyan-900/40
              text-cyan-900 dark:text-cyan-300
              border border-cyan-200/90 dark:border-cyan-700/50
              shadow-md shadow-cyan-500/5 dark:shadow-cyan-500/10
              backdrop-blur-sm"
            >
              🧬 AI-Powered Pharmaceutical Intelligence
            </div>

            {/* Title — strong text shadow for readability over image */}
            <h1
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight"
              style={{
                background: 'linear-gradient(135deg, #0e7490 0%, #2563eb 50%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 2px 8px rgba(6,182,212,0.25))',
              }}
            >
              CureCoders
            </h1>

            {/* Subtitle with theme-aware text shadow for readability */}
            <p
              className="mt-4 font-display text-xl sm:text-2xl lg:text-3xl font-extrabold"
              style={{ 
                color: 'var(--hero-subtitle)',
                textShadow: isDark 
                  ? '0 2px 10px rgba(0,0,0,0.5)' 
                  : '0 2px 8px rgba(255,255,255,0.95)'
              }}
            >
              <span className="dark:text-slate-100 text-slate-900">Pharmaceutical Intelligence Platform</span>
            </p>
          </div>

          {/* Description — bold/medium weight and high contrast white glow in light mode */}
          <p className="mt-8 text-lg sm:text-xl max-w-4xl mx-auto leading-relaxed
            text-slate-900 dark:text-slate-200 font-semibold"
            style={{ 
              textShadow: isDark 
                ? '0 1px 3px rgba(0,0,0,0.4)' 
                : '0 1px 6px rgba(255,255,255,0.95)' 
            }}
          >
            From query to comprehensive insights in minutes. Our AI agents orchestrate dynamic,
            data-driven reports to accelerate your strategic decisions in drug discovery,
            competitive intelligence, and market analysis.
          </p>

          {/* Feature Badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {[
              { dot: 'bg-emerald-500', label: 'Multi-Agent AI' },
              { dot: 'bg-blue-500',    label: 'Real-time Analysis' },
              { dot: 'bg-purple-500',  label: 'Advanced Reporting' },
            ].map(({ dot, label }) => (
              <div
                key={label}
                className="flex items-center space-x-2 px-4 py-2 rounded-full shadow-md
                  bg-white/90 dark:bg-slate-800/80
                  border border-slate-200/80 dark:border-slate-700/60
                  backdrop-blur-sm"
              >
                <div className={`w-2 h-2 ${dot} rounded-full animate-pulse`}></div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={handleDemoClick}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white rounded-xl shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #2563eb)' }}
              onMouseEnter={() => explainFeature('workspace')}
            >
              <span className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, #38bdf8, #3b82f6)' }}
              />
              <span className="relative flex items-center space-x-2">
                <span>Start Your Analysis</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                </svg>
              </span>
            </button>

            <p className="mt-4 text-sm text-slate-900 dark:text-slate-400 font-semibold" 
              style={{ 
                textShadow: isDark 
                  ? '0 1px 2px rgba(0,0,0,0.5)' 
                  : '0 1px 4px rgba(255,255,255,0.95)' 
              }}
            >
              No signup required • Instant access • Professional results
            </p>
          </div>

          {/* Quick Links Grid */}
          <div className="mt-16 pt-12 border-t border-slate-300/40 dark:border-slate-600/40 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-6 text-slate-800 dark:text-slate-400"
              style={{ 
                textShadow: isDark 
                  ? 'none' 
                  : '0 1px 3px rgba(255,255,255,0.8)'
              }}
            >
              Explore Our Platform
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-5xl mx-auto">
              {[
                { to: '/architecture', icon: '🏗️', label: 'Architecture', desc: '7 AI Agents' },
                { to: '/samples',      icon: '📊', label: 'Sample Outputs', desc: 'Live Demos' },
                { to: '/apis',         icon: '🔌', label: 'Mock APIs',      desc: 'Data Sources' },
                { to: '/queries',      icon: '🔍', label: 'Queries',        desc: '10+ Examples' },
                { to: '/journey',      icon: '🚀', label: 'Product Journey', desc: '5-Slide PPT' },
                { to: '/reports',      icon: '📄', label: 'Reports',        desc: 'PDF & Excel' },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group flex flex-col items-center p-4 rounded-xl border transition-all hover:-translate-y-0.5
                    bg-white/80 dark:bg-slate-800/70
                    border-slate-200 dark:border-slate-700/60
                    hover:border-cyan-400 dark:hover:border-cyan-500
                    hover:shadow-lg hover:shadow-cyan-500/15
                    backdrop-blur-sm"
                >
                  <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{item.label}</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{item.desc}</span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Hero;