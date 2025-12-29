import React, { memo } from 'react';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = memo(() => {
  return (
    <header className="glass-panel border-b border-border-subtle sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-10">
        <div className="flex justify-between items-center h-16">
          <a href="/" className="flex items-center gap-2 group transition-all duration-300">
            <div className="bg-brand-primary p-2 rounded-md group-hover:shadow-lg group-hover:shadow-brand-glow">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">AudioScribe <span className="text-brand-primary">AI</span></h1>
          </a>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
});

export default Header;