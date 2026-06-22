import React from 'react';
import { Lock } from './Icons';
import { useAppContext } from '../hooks/useAppContext';

interface LockedFeatureGateProps {
  children?: React.ReactNode;
  featureName?: string;
  isFullPage?: boolean;
}

const LockedFeatureGate: React.FC<LockedFeatureGateProps> = ({ 
  children, 
  featureName = 'this feature',
  isFullPage = false
}) => {
  const { user } = useAppContext();

  if (user) {
    return <>{children}</>;
  }

  const containerClasses = isFullPage 
    ? "flex flex-col items-center justify-center min-h-[60vh] p-8 text-center"
    : "flex flex-col items-center justify-center min-h-[350px] p-8 text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl max-w-md mx-auto my-6";

  return (
    <div className={containerClasses}>
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30">
        <Lock className="w-8 h-8 text-white" />
      </div>
      <h3 className="font-bold text-2xl text-slate-800 dark:text-white mb-2">
        Premium Feature
      </h3>
      <p className="text-slate-500 dark:text-slate-400 mb-2 max-w-xs text-sm leading-relaxed">
        {featureName} is available to registered users only.
      </p>
      <p className="text-slate-400 dark:text-slate-500 mb-6 max-w-xs text-xs">
        Create a free account to unlock full access — no credit card needed.
      </p>
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('open-login'))}
        className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
      >
        <Lock className="w-4 h-4" />
        Log In / Create Account
      </button>
    </div>
  );
};

export default LockedFeatureGate;
