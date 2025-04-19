
import React, { useState } from 'react';
import { api } from '../utils/api';

interface ExportOptionsProps {
  meetingId: string;
  summary?: string;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ meetingId, summary }) => {
  const [copyStatus, setCopyStatus] = useState('');

  const handleExportPDF = () => {
    // In a real implementation, this would trigger a file download
    // For now, we'll just simulate the download with the mock API
    const pdfUrl = api.exportPDF(meetingId);
    
    // In a real app, this might be:
    // window.open(pdfUrl, '_blank');
    // or
    // const a = document.createElement('a');
    // a.href = pdfUrl;
    // a.download = `meeting-${meetingId}.pdf`;
    // document.body.appendChild(a);
    // a.click();
    // document.body.removeChild(a);
    
    // For now, just show success message
    setCopyStatus('PDF export initiated');
    setTimeout(() => setCopyStatus(''), 3000);
  };

  const handleCopySummary = async () => {
    if (!summary) {
      setCopyStatus('No summary available to copy');
      setTimeout(() => setCopyStatus(''), 3000);
      return;
    }

    try {
      await navigator.clipboard.writeText(summary);
      setCopyStatus('Summary copied to clipboard!');
      setTimeout(() => setCopyStatus(''), 3000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopyStatus('Failed to copy summary');
      setTimeout(() => setCopyStatus(''), 3000);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleExportPDF}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded flex items-center transition-colors"
        >
          <svg
            className="h-5 w-5 mr-2 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          Export as PDF
        </button>
        <button
          onClick={handleCopySummary}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded flex items-center transition-colors"
          disabled={!summary}
        >
          <svg
            className="h-5 w-5 mr-2 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Copy Summary
        </button>
      </div>

      {copyStatus && (
        <div className="text-sm text-green-600 mt-2 animate-fade-in">{copyStatus}</div>
      )}
    </div>
  );
};

export default ExportOptions;
