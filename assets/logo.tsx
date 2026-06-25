import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = 'h-9 w-auto' }) => {
  // If the className doesn't already contain text color utility classes, default to theme-aware colors
  const hasColorClass = /\btext-\w+/.test(className);
  const colorClass = hasColorClass ? '' : 'text-slate-900 dark:text-white';

  return (
    <svg
      viewBox="0 0 180 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${colorClass}`}
    >
      <defs>
        {/* Brand gradient for the icon and the text "Coders" */}
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" /> {/* Cyan 500 */}
          <stop offset="50%" stopColor="#6366f1" /> {/* Indigo 500 */}
          <stop offset="100%" stopColor="#8b5cf6" /> {/* Violet 500 */}
        </linearGradient>
      </defs>

      {/* Hexagonal container */}
      <path
        d="M 20 4 L 34 12 L 34 28 L 20 36 L 6 28 L 6 12 Z"
        stroke="url(#logoGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.05"
      />

      {/* Left Coding Bracket < */}
      <path
        d="M 15 15 L 10 20 L 15 25"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right Coding Bracket > */}
      <path
        d="M 25 15 L 30 20 L 25 25"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Medical/Science Cross in center - inherits SVG color */}
      <path
        d="M 20 14 L 20 26 M 14 20 L 26 20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Center dot/node */}
      <circle cx="20" cy="20" r="1.5" fill="url(#logoGradient)" />

      {/* Brand Name Text - inherits SVG color */}
      <text
        x="45"
        y="27"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="800"
        fontSize="21"
        letterSpacing="-0.03em"
        fill="currentColor"
      >
        Cure
        <tspan fill="url(#logoGradient)">Coders</tspan>
      </text>
    </svg>
  );
};

export const LogoIcon: React.FC<LogoProps> = ({ className = 'h-9 w-9' }) => {
  const hasColorClass = /\btext-\w+/.test(className);
  const colorClass = hasColorClass ? '' : 'text-slate-900 dark:text-white';

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${colorClass}`}
    >
      <defs>
        <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      {/* Hexagonal container */}
      <path
        d="M 20 4 L 34 12 L 34 28 L 20 36 L 6 28 L 6 12 Z"
        stroke="url(#iconGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.05"
      />

      {/* Left Coding Bracket < */}
      <path
        d="M 15 15 L 10 20 L 15 25"
        stroke="url(#iconGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right Coding Bracket > */}
      <path
        d="M 25 15 L 30 20 L 25 25"
        stroke="url(#iconGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Medical/Science Cross in center - inherits SVG color */}
      <path
        d="M 20 14 L 20 26 M 14 20 L 26 20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Center dot/node */}
      <circle cx="20" cy="20" r="1.5" fill="url(#iconGradient)" />
    </svg>
  );
};