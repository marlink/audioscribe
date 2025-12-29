import React, { memo } from 'react';

const Footer: React.FC = memo(() => {
  return (
    <footer className="bg-bg-surface border-t border-border-subtle py-4 mt-auto transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-text-muted">
          v.0.2.3 | © 2026 Design System
        </p>
      </div>
    </footer>
  );
});

export default Footer;