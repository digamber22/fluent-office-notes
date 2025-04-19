
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
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Upload Meeting Audio</h2>
      </div>
      <div className="p-6">
        <div className="flex flex-col gap-4">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-gray-500">MP3, WAV, or M4A audio files</p>
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
            <div className="bg-blue-50 p-3 rounded flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <span className="text-sm text-blue-700 truncate max-w-xs">{selectedFile.name}</span>
            </div>
          )}
          
          {isUploading && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Processing audio</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className={`py-2 px-4 rounded-lg text-center font-medium ${
              !selectedFile || isUploading
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isUploading ? 'Processing...' : 'Upload & Process Audio'}
          </button>
          
          {message.text && (
            <div
              className={`p-3 rounded ${
                message.type === 'error'
                  ? 'bg-red-100 text-red-700'
                  : message.type === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
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
