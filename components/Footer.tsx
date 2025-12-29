import React, { memo } from 'react';

const Footer: React.FC = memo(() => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} AudioScribe AI. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <span className="text-xs text-gray-400">Open Source Audio Transcription</span>
        </div>
      </div>
    </footer>
  );
});

export default Footer;