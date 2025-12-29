import React from 'react';

interface ProgressIndicatorProps {
  stage: string;
  percent: number;
  isUploading: boolean;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ stage, percent, isUploading }) => {
  return (
    <div className="w-full bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm animate-fade-in">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">
            {isUploading ? 'Uploading' : 'Processing'}
          </h4>
          <p className="text-xs text-gray-500 mt-1 font-mono">
            {stage}
          </p>
        </div>
        <span className={`text-2xl font-bold ${isUploading ? 'text-blue-600' : 'text-green-600'}`}>
          {Math.round(percent)}%
        </span>
      </div>

      <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden relative">
        <div 
          className={`h-full transition-all duration-300 ease-out 
            ${isUploading ? 'bg-blue-600' : 'bg-green-500'}
          `}
          style={{ width: `${Math.max(5, percent)}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressIndicator;