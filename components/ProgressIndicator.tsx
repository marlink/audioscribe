import React from 'react';

interface ProgressIndicatorProps {
  stage: string;
  percent: number;
  isUploading: boolean;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ stage, percent, isUploading }) => {
  return (
    <div className="w-full bg-bg-surface rounded-lg p-6 border border-border-default shadow-sm animate-fade-in">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h4 className="font-semibold text-text-primary text-sm uppercase tracking-wider">
            {isUploading ? 'Uploading' : 'Processing'}
          </h4>
          <p className="text-xs text-text-muted mt-1 font-mono">
            {stage}
          </p>
        </div>
        <span className={`text-2xl font-bold ${isUploading ? 'text-brand-primary' : 'text-status-success'} drop-shadow-sm`}>
          {Math.round(percent)}%
        </span>
      </div>

      <div className="h-3 w-full bg-bg-elevated rounded-full overflow-hidden relative">
        <div
          className={`h-full transition-all duration-300 ease-out 
            ${isUploading ? 'bg-brand-primary' : 'bg-status-success'}
            shadow-[0_0_10px_var(--accent-glow)]
          `}
          style={{ width: `${Math.max(5, percent)}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressIndicator;