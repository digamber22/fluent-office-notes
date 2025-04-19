
import React, { useState, useEffect } from 'react';

interface SearchTranscriptProps {
  transcript: string;
  onSearchResults?: (results: { text: string; matches: number }) => void;
}

const SearchTranscript: React.FC<SearchTranscriptProps> = ({ 
  transcript, 
  onSearchResults 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedText, setHighlightedText] = useState<React.ReactNode>(transcript);
  const [matchCount, setMatchCount] = useState(0);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setHighlightedText(transcript);
      setMatchCount(0);
      if (onSearchResults) {
        onSearchResults({ text: transcript, matches: 0 });
      }
      return;
    }

    try {
      // Create a regex for the search term (case insensitive)
      const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const matches = (transcript.match(regex) || []).length;
      setMatchCount(matches);
      
      // Split the text by the regex and wrap matches in highlighted spans
      const parts = transcript.split(regex);
      
      const highlighted = (
        <>
          {parts.map((part, i) => 
            regex.test(part) ? (
              <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark>
            ) : (
              part
            )
          )}
        </>
      );
      
      setHighlightedText(highlighted);
      
      if (onSearchResults) {
        onSearchResults({ 
          text: transcript, 
          matches 
        });
      }
    } catch (e) {
      // If regex fails (e.g., with special characters), fallback to normal text
      setHighlightedText(transcript);
      setMatchCount(0);
    }
  }, [searchTerm, transcript, onSearchResults]);

  return (
    <div>
      <div className="flex items-center mb-3">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="search"
            placeholder="Search in transcript"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full p-2.5 pl-10 pr-20 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            aria-label="Search in transcript"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {searchTerm.trim() !== '' && (
        <div className="mb-3 text-sm">
          {matchCount > 0 ? (
            <div className="text-gray-600">
              Found <span className="font-medium">{matchCount}</span> {matchCount === 1 ? 'match' : 'matches'}
            </div>
          ) : (
            <div className="text-gray-600">No matches found</div>
          )}
        </div>
      )}

      <div className="bg-white border rounded-lg p-4 max-h-[400px] overflow-y-auto whitespace-pre-wrap text-left text-gray-700 leading-relaxed">
        {highlightedText}
      </div>
    </div>
  );
};

export default SearchTranscript;
