import React, { useEffect, useRef, useState, useMemo, memo } from 'react';
import { TranscriptionSegment } from '../types';

interface TranscriptListProps {
  segments: TranscriptionSegment[];
  currentTime: number;
  onSeek: (time: number) => void;
  fileName: string;
  language?: string;
}

/**
 * Memoized Individual Segment Item.
 * Split into a wrapper div with two buttons: one for seeking (content) and one for copying.
 */
const TranscriptItem = memo(({
  segment,
  isActive,
  onSeek
}: {
  segment: TranscriptionSegment,
  isActive: boolean,
  onSeek: (t: number) => void
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Auto-scroll logic
  useEffect(() => {
    if (isActive && itemRef.current) {
      itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isActive]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent seeking when clicking copy
    navigator.clipboard.writeText(segment.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      ref={itemRef}
      className={`
        group relative flex items-start rounded-md transition-colors duration-200 border
        ${isActive
          ? 'bg-brand-subtle/10 border-brand-subtle shadow-sm ring-1 ring-brand-glow z-10'
          : 'bg-transparent border-transparent hover:bg-bg-elevated hover:border-border-default'
        }
      `}
    >
      {/* Primary Action: Seek */}
      <button
        type="button"
        onClick={() => onSeek(segment.startSeconds)}
        className="flex-1 text-left flex items-start gap-4 p-4 rounded-l-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1 focus:ring-offset-transparent"
        aria-label={`Seek to ${segment.timestamp}. ${segment.speaker ? segment.speaker + ': ' : ''}${segment.text}`}
        aria-current={isActive ? 'true' : undefined}
      >
        <div className="flex-shrink-0 w-16 pt-1">
          <span className={`
            text-xs font-mono font-medium px-1.5 py-0.5 rounded
            ${isActive ? 'text-brand-primary bg-brand-subtle' : 'text-text-muted bg-bg-elevated group-hover:text-text-secondary'}
          `}>
            {segment.timestamp}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {segment.speaker && (
            <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isActive ? 'text-brand-primary' : 'text-text-muted'}`}>
              {segment.speaker}
            </div>
          )}
          <p className={`text-base leading-relaxed whitespace-pre-wrap ${isActive ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
            {segment.text}
          </p>
        </div>
      </button>

      {/* Secondary Action: Copy */}
      <div className="py-4 pr-2 pl-0">
        <button
          type="button"
          onClick={handleCopy}
          className={`
                p-2 rounded-md transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-brand-primary
                ${copied
              ? 'text-status-success bg-status-success-bg'
              : 'text-text-muted hover:text-brand-primary hover:bg-brand-subtle opacity-0 group-hover:opacity-100 focus:opacity-100'
            }
            `}
          aria-label="Copy segment text"
          title="Copy text"
        >
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
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
  );
}, (prev, next) => {
  return prev.isActive === next.isActive && prev.segment === next.segment;
});

const TranscriptList: React.FC<TranscriptListProps> = ({ segments, currentTime, onSeek, fileName, language }) => {
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [allCopied, setAllCopied] = useState(false);

  const activeIndex = useMemo(() => {
    return segments.findIndex((seg, idx) => {
      const nextSeg = segments[idx + 1];
      const end = seg.endSeconds || (nextSeg ? nextSeg.startSeconds : Infinity);
      return currentTime >= seg.startSeconds && currentTime < end;
    });
  }, [segments, currentTime]);

  const handleCopyAll = () => {
    const fullText = segments.map(s => {
      const parts = [];
      if (includeTimestamps) parts.push(`[${s.timestamp}]`);
      if (s.speaker) parts.push(`${s.speaker}:`);
      parts.push(s.text);
      return parts.join(' ');
    }).join('\n\n');

    navigator.clipboard.writeText(fullText).then(() => {
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 2000);
    });
  };

  return (
    <div
      className="premium-card flex flex-col h-full overflow-hidden animate-fade-in-up"
      role="region"
      aria-label={`Transcription for ${fileName}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-surface sticky top-0 z-20 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-text-primary tracking-tight">Transcription</h2>
            {language && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-brand-subtle text-brand-primary border border-brand-subtle/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.083A8.002 8.002 0 004.083 9zM6.5 9a6.479 6.479 0 00-4.213 3.84c.411.66.891 1.258 1.42 1.792.487-.338.966-.718 1.428-1.135C5.454 12.59 5.8 11.393 6 10.043V9H6.5zm0-1c-.2-.733-.36-1.503-.475-2.296A16.463 16.463 0 016.96 4.16 8.026 8.026 0 004.99 6.204 14.542 14.542 0 006.5 8zM10 2a8 8 0 100 16 8 8 0 000-16zm1 14.917V10h-2v6.917A8.004 8.004 0 013.083 11h1.946c.089 1.546.383 2.97.837 4.083A8.002 8.002 0 0111 16.917zm2.917-1.006c-.487.338-.966.718-1.428 1.135-.316-.906-.662-2.103-.862-3.453h.525c.2.733.36 1.503.475 2.296.864-.17 1.68-.483 2.418-.909-.411-.66-.891-1.258-1.42-1.792zM12.917 4.083A8.002 8.002 0 0116.917 9h-1.946c-.089-1.546-.383-2.97-.837-4.083zM14.5 11h-.5c.2.733.36 1.503.475 2.296a16.463 16.463 0 00-1.96 1.544 8.026 8.026 0 001.97-2.044c.411-.66.891-1.258 1.42-1.792-.487.338-.966.718-1.428 1.135-.316.906-.662 2.103-.862 3.453h.525zM12 9V3.083c.732.128 1.398.508 1.874 1.077-.462.417-.941.797-1.428 1.135.316.906.662 2.103.862 3.453h-1.308z" clipRule="evenodd" />
                </svg>
                {language}
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-1 truncate" style={{ maxWidth: '200px' }}>{fileName}</p>
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
            onClick={handleCopyAll}
            className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-text-secondary bg-bg-page hover:bg-bg-elevated hover:text-brand-primary rounded-lg transition-all border border-border-default hover:border-brand-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary"
            aria-label="Copy entire transcription"
          >
            {allCopied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-status-success" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-status-success">Copied</span>
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

      <div
        className="flex-1 overflow-y-auto scrollbar-thin bg-bg-surface/50 p-2"
        role="feed"
        aria-busy="false"
      >
        <div className="flex flex-col gap-1">
          {segments.map((segment, idx) => (
            <TranscriptItem
              key={idx}
              segment={segment}
              isActive={idx === activeIndex}
              onSeek={onSeek}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TranscriptList;