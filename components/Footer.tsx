import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} CureCoders. All rights reserved. Demo purposes only.</p>
        <p className="mt-2">
          Images from <a href="https://unsplash.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Unsplash</a>. 
          Built with React, Tailwind CSS, and Gemini API.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
