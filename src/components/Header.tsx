
import React from 'react';
import { Mic } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg py-6">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-white/10 rounded-lg">
              <Mic className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Multilingual Note-Taking Agent
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                Transcribe, summarize, and extract action items from meetings
              </p>
            </div>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <a href="/" className="text-blue-100 hover:text-white transition-colors">
                  Home
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
