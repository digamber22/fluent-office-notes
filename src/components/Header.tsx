
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm py-4 px-6 mb-8">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-blue-600 mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Multilingual Note-Taking Agent</h1>
            <p className="text-sm text-gray-500">Transcribe, summarize, and extract action items from meetings</p>
          </div>
        </div>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <a href="/" className="text-blue-500 hover:text-blue-700">
                Home
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
