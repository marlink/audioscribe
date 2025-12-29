import React, { useCallback, useState } from 'react';
import { ALLOWED_MIME_TYPES } from '../types';
import { formatFileSize } from '../utils/fileUtils';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, disabled }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateAndSelectFile = (file: File) => {
    setErrorMessage(null);
    
    // Check type
    const isAudio = file.type.startsWith('audio/') || ALLOWED_MIME_TYPES.includes(file.type);
    
    if (!isAudio) {
      setErrorMessage("Please upload a valid audio file (MP3, WAV, M4A).");
      return;
    }

    // Check size (Limit to 20MB for inline base64 safety)
    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage("File size exceeds the 20MB limit for this demo.");
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  }, [disabled, onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelectFile(e.target.files[0]);
    }
  }, [onFileSelect]);

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 ease-in-out flex flex-col items-center justify-center text-center
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : 'cursor-pointer'}
          ${isDragOver ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
        `}
      >
        <input
          type="file"
          accept="audio/*,.mp3,.wav,.m4a"
          onChange={handleFileInput}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="bg-blue-100 p-4 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          {isDragOver ? 'Drop audio file here' : 'Upload Audio File'}
        </h3>
        <p className="text-sm text-gray-500 mb-4 max-w-xs">
          Drag & drop or click to browse. Supports MP3, WAV, M4A (Max 20MB).
        </p>
      </div>

      {errorMessage && (
        <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-sm text-red-600 animate-fade-in">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default FileUploader;