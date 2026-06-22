import React from 'react';
import { useTheme } from '../context/ThemeContext';

// Renders theme-aware CureCoders logo
// - Light mode: cc-logo-light.png (dark text on white)
// - Dark mode:  cc-logo-dark.png  (white text on dark)
export const Logo = ({ className }: { className?: string }) => {
  const { isDark } = useTheme();
  return React.createElement('img', {
    src: isDark ? '/cc-logo-dark.png' : '/cc-logo-light.png',
    alt: 'CureCoders Logo',
    className: className,
  });
};

// Small square icon mark (used for favicons, avatars, etc.)
export const LogoIcon = ({ className }: { className?: string }) => {
  return React.createElement('img', {
    src: '/cc-icon.png',
    alt: 'CureCoders',
    className: className,
  });
};