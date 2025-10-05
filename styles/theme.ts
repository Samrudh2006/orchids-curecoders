// Professional styling constants for CureCoders platform
export const pharmaTheme = {
  colors: {
    primary: '#06b6d4', // Pharmaceutical Cyan
    secondary: '#f59e0b', // Pharmaceutical Orange
    success: '#10b981', // Green
    danger: '#ef4444', // Red
    warning: '#f59e0b', // Orange
    info: '#06b6d4', // Cyan
    dark: '#1e293b', // Dark Blue
    light: '#f8fafc', // Light Gray
  },
  
  gradients: {
    primary: 'bg-gradient-to-r from-cyan-500 to-blue-600',
    secondary: 'bg-gradient-to-r from-orange-500 to-amber-600',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600',
    dark: 'bg-gradient-to-r from-slate-800 to-slate-900',
    pharmaceutical: 'bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50',
    pharmaceuticalDark: 'bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900',
  },
  
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    pharmaceutical: 'shadow-lg shadow-cyan-500/10',
    pharmaceuticalHover: 'shadow-xl shadow-cyan-500/20',
  },
  
  animations: {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    spin: 'animate-spin',
    float: 'animate-float',
    gradientX: 'animate-gradient-x',
  },
  
  typography: {
    display: 'font-display', // Poppins
    body: 'font-sans', // Inter
    mono: 'font-mono', // JetBrains Mono
    
    sizes: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
    },
    
    weights: {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
    }
  },
  
  spacing: {
    section: 'py-16 lg:py-24',
    container: 'container mx-auto px-4 sm:px-6 lg:px-8',
    cardPadding: 'p-6 lg:p-8',
    buttonPadding: 'px-6 py-3',
  },
  
  borders: {
    radius: {
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      full: 'rounded-full',
    },
    
    width: {
      DEFAULT: 'border',
      2: 'border-2',
      4: 'border-4',
      8: 'border-8',
    }
  },
  
  components: {
    button: {
      primary: 'bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 hover:-translate-y-0.5',
      secondary: 'bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5',
      outline: 'border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-500 hover:text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200',
      ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 font-medium px-4 py-2 rounded-lg transition-colors',
    },
    
    card: {
      default: 'bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 transition-all duration-200 hover:shadow-xl',
      pharmaceutical: 'bg-white dark:bg-slate-800 rounded-xl shadow-lg shadow-cyan-500/10 border border-cyan-200 dark:border-cyan-800 p-6 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-500/20',
      gradient: 'bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-lg border border-cyan-200 dark:border-cyan-800 p-6',
    },
    
    input: {
      default: 'w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200',
      pharmaceutical: 'w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200',
    },
    
    badge: {
      primary: 'inline-flex items-center px-3 py-1 text-xs font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 rounded-full',
      secondary: 'inline-flex items-center px-3 py-1 text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 rounded-full',
      success: 'inline-flex items-center px-3 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full',
      danger: 'inline-flex items-center px-3 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full',
    }
  }
};

// Utility functions for consistent styling
export const cn = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'success':
    case 'done':
    case 'completed':
      return 'text-green-600 dark:text-green-400';
    case 'error':
    case 'failed':
    case 'danger':
      return 'text-red-600 dark:text-red-400';
    case 'warning':
    case 'pending':
      return 'text-orange-600 dark:text-orange-400';
    case 'info':
    case 'running':
      return 'text-cyan-600 dark:text-cyan-400';
    default:
      return 'text-slate-600 dark:text-slate-400';
  }
};

export const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'success':
    case 'done':
    case 'completed':
      return pharmaTheme.components.badge.success;
    case 'error':
    case 'failed':
    case 'danger':
      return pharmaTheme.components.badge.danger;
    case 'warning':
    case 'pending':
      return pharmaTheme.components.badge.secondary;
    case 'info':
    case 'running':
      return pharmaTheme.components.badge.primary;
    default:
      return 'inline-flex items-center px-3 py-1 text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 rounded-full';
  }
};