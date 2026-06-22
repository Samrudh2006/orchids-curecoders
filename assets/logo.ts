import React from 'react';

// Render the premium CureCoders PNG branding logo uploaded by the user
export const Logo = ({ className }: { className?: string }) => {
  return React.createElement('img', { 
    src: '/curecoders-logo.png', 
    alt: "CureCoders Logo", 
    className: className 
  });
};