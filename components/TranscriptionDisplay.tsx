import React, { useState } from 'react';
import { TranscriptionResult } from '../types';

interface TranscriptionDisplayProps {
  result: TranscriptionResult;
}

const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = () => {
    const fullText = result.segments.map(s => {
      const parts = [];
      if (includeTimestamps) parts.push(`[${s.timestamp}]`);
      if (s.speaker) parts.push(`${s.speaker}:`);
      parts.push(s.text);
      return parts.join(' ');
    }).join('\n');

    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSingleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  return (
    <div className="bg-bg-surface rounded-xl shadow-lg border border-border-default flex flex-col h-full overflow-hidden animate-fade-in-up ring-1 ring-border-subtle">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-surface sticky top-0 z-10 gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">Transcription</h2>
          <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
            {result.fileName}
          </p>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-auto">
          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer select-none hover:text-brand-primary transition-colors">
            <input
              type="checkbox"
              checked={includeTimestamps}
              onChange={(e) => setIncludeTimestamps(e.target.checked)}
              className="rounded border-border-default text-brand-primary focus:ring-brand-primary h-4 w-4 accent-brand-primary"
            />
            <span>Timestamps</span>
          </label>

          <button
            onClick={handleCopy}
            className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-secondary bg-bg-page hover:bg-bg-elevated hover:text-brand-primary rounded-lg transition-all border border-border-default hover:border-brand-subtle"
          >
            {copied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-status-success" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-status-success">Copied!</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:text-brand-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy All
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin bg-bg-surface/50">
        <div className="divide-y divide-border-subtle">
          {result.segments.map((segment, idx) => (
            <div key={idx} className="group relative flex flex-col sm:flex-row hover:bg-brand-subtle/50 transition-colors duration-150 px-6 py-4 gap-y-2 sm:gap-x-6 pr-12">
              {/* Timestamp Column */}
              <div className="flex-shrink-0 w-24 pt-0.5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-bg-page text-text-muted font-mono group-hover:bg-brand-subtle group-hover:text-brand-primary transition-colors">
                  {segment.timestamp}
                </span>
              </div>

              {/* Text Column */}
              <div className="flex-1 min-w-0">
                {segment.speaker && (
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
                    {segment.speaker}
                  </p>
                )}
                <p className="text-text-primary leading-relaxed whitespace-pre-wrap text-base">
                  {segment.text}
                </p>
              </div>

              {/* Single Copy Button */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleSingleCopy(segment.text, idx)}
                  className="p-1.5 text-text-muted hover:text-brand-primary hover:bg-bg-elevated rounded-md transition-colors shadow-sm border border-transparent hover:border-border-default"
                  title="Copy segment text"
                >
                  {copiedIndex === idx ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-status-success" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TranscriptionDisplay;