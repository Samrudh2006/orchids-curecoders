import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'chart' | 'table';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  lines = 1
}) => {
  const baseClass = "animate-pulse bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer";
  
  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  switch (variant) {
    case 'text':
      return (
        <div className={`space-y-2 ${className}`}>
          {Array.from({ length: lines }).map((_, i) => (
            <div 
              key={i} 
              className={`${baseClass} h-4 rounded`} 
              style={{ width: i === lines - 1 && lines > 1 ? '70%' : '100%' }}
            />
          ))}
        </div>
      );
    case 'circular':
      return (
        <div 
          className={`${baseClass} rounded-full ${className}`} 
          style={{ ...style, aspectRatio: '1' }}
        />
      );
    case 'card':
      return (
        <div className={`${baseClass} rounded-xl ${className}`} style={style}>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
            <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-1/2"></div>
            <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded w-1/3 mt-4"></div>
          </div>
        </div>
      );
    case 'chart':
      return (
        <div className={`rounded-xl p-4 bg-slate-100 dark:bg-slate-800 ${className}`}>
          <div className={`${baseClass} h-4 w-32 rounded mb-4`}></div>
          <div className="flex items-end gap-2 h-32">
            {[40, 65, 45, 80, 55, 70, 60].map((h, i) => (
              <div 
                key={i} 
                className={`${baseClass} flex-1 rounded-t`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className={`${baseClass} h-2 w-6 rounded`}></div>
            ))}
          </div>
        </div>
      );
    case 'table':
      return (
        <div className={`rounded-xl overflow-hidden ${className}`}>
          <div className={`${baseClass} h-10 mb-1`}></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`${baseClass} h-12 mb-1`} style={{ opacity: 1 - i * 0.15 }}></div>
          ))}
        </div>
      );
    default:
      return <div className={`${baseClass} rounded ${className}`} style={style} />;
  }
};

export const AgentCardSkeleton: React.FC = () => (
  <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="space-y-2">
          <Skeleton variant="rectangular" width={120} height={16} className="rounded" />
          <Skeleton variant="rectangular" width={80} height={12} className="rounded" />
        </div>
      </div>
      <Skeleton variant="circular" width={24} height={24} />
    </div>
    <div className="mt-4">
      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-500 animate-loading-bar"></div>
      </div>
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="mt-8 animate-pulse">
    <div className="text-center space-y-3">
      <Skeleton variant="rectangular" width={300} height={32} className="mx-auto rounded" />
      <Skeleton variant="rectangular" width={400} height={16} className="mx-auto rounded" />
    </div>
    
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <Skeleton variant="rectangular" width={80} height={12} className="rounded mb-2" />
          <Skeleton variant="rectangular" width={100} height={28} className="rounded mb-2" />
          <Skeleton variant="rectangular" width={60} height={14} className="rounded" />
        </div>
      ))}
    </div>
    
    <div className="mt-8 space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-slate-100/50 dark:bg-slate-800/50 rounded-xl p-4">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="space-y-2">
              <Skeleton variant="rectangular" width={180} height={20} className="rounded" />
              <Skeleton variant="rectangular" width={240} height={14} className="rounded" />
            </div>
          </div>
          <Skeleton variant="text" lines={4} className="mt-4" />
        </div>
      ))}
    </div>
  </div>
);

export const ChatSkeleton: React.FC = () => (
  <div className="space-y-4 p-4">
    <div className="flex justify-start">
      <div className="max-w-[80%] bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-md">
        <div className="flex items-start space-x-2">
          <Skeleton variant="circular" width={20} height={20} />
          <div className="space-y-2">
            <Skeleton variant="rectangular" width={200} height={14} className="rounded" />
            <Skeleton variant="rectangular" width={150} height={14} className="rounded" />
          </div>
        </div>
      </div>
    </div>
    <div className="flex justify-end">
      <div className="max-w-[80%] bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl px-4 py-3">
        <Skeleton variant="rectangular" width={180} height={14} className="rounded" />
      </div>
    </div>
  </div>
);

export default Skeleton;
