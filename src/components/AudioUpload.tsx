
import React, { useState, useRef } from 'react';
import { api } from '../utils/api';

interface AudioUploadProps {
  onUploadSuccess?: (meetingId: string) => void;
}

const AudioUpload: React.FC<AudioUploadProps> = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setMessage({ text: '', type: '' });
      setUploadProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({ text: 'Please select an audio file first', type: 'error' });
      return;
    }

    try {
      setIsUploading(true);
      setMessage({ text: 'Processing audio...', type: 'info' });
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);
      
      const result = await api.uploadAudio(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (result.success && result.meetingId) {
        setMessage({ text: 'Audio processed successfully!', type: 'success' });
        if (onUploadSuccess) {
          onUploadSuccess(result.meetingId);
        }
        // Reset the file input
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setMessage({ text: result.error || 'Upload failed', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'An error occurred during upload', type: 'error' });
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    // Remove bg-white as parent Card provides background. Remove shadow as Card has it.
    <div className="rounded-lg"> 
      {/* Remove border-b, use card's structure */}
      {/* <div className="p-4 border-b"> 
        <h2 className="text-xl font-semibold">Upload Meeting Audio</h2> 
      </div> */}
      {/* Use card's padding (p-6 was default in CardContent) */}
      <div className="p-0"> 
        <div className="flex flex-col gap-4">
          {/* Use theme colors for drag-drop area */}
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted hover:bg-accent transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {/* Use muted foreground for icon */}
              <svg className="w-10 h-10 mb-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              {/* Use muted foreground for text */}
              <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-foreground">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-muted-foreground">MP3, WAV, or M4A audio files</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="audio/*" 
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={isUploading}
            />
          </label>
          
          {selectedFile && (
            // Use accent theme colors for selected file display
            <div className="bg-accent p-3 rounded flex items-center">
              {/* Use primary color for icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              {/* Use accent foreground for text */}
              <span className="text-sm text-accent-foreground truncate max-w-xs">{selectedFile.name}</span>
            </div>
          )}
          
          {isUploading && (
            <div className="mt-2">
              {/* Use muted foreground for progress text */}
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Processing audio</span>
                <span>{uploadProgress}%</span>
              </div>
              {/* Use muted background for progress bar track */}
              <div className="w-full bg-muted rounded-full h-2">
                 {/* Use primary background for progress bar fill */}
                <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}
          
          {/* Use theme colors for button states */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className={`w-full py-2 px-4 rounded-lg text-center font-medium transition-colors ${
              !selectedFile || isUploading
                ? 'bg-muted text-muted-foreground cursor-not-allowed' // Disabled state
                : 'bg-primary hover:bg-primary/90 text-primary-foreground' // Enabled state
            }`}
          >
            {isUploading ? 'Processing...' : 'Upload & Process Audio'}
          </button>
          
          {message.text && (
             // Use theme colors for message types
            <div
              className={`p-3 rounded text-sm ${ // Added text-sm
                message.type === 'error'
                  ? 'bg-destructive/10 text-destructive' // Destructive theme colors (with transparency)
                  : message.type === 'success'
                  ? 'bg-primary/10 text-primary' // Primary theme colors (with transparency)
                  : 'bg-accent text-accent-foreground' // Accent theme colors
              }`}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioUpload;
