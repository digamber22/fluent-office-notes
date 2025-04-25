
import React from 'react';
import { Mic } from 'lucide-react';
import { ModeToggle } from "@/components/ModeToggle"; // Import ModeToggle

const Header: React.FC = () => {
  return (
    <header className="bg-primary text-primary-foreground shadow-lg py-4">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary-foreground/10 rounded-lg">
              <Mic className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">
                LingoMate.AI
              </h1>
              <p className="text-primary-foreground/80 text-sm mt-1">
                Transcribe, summarize, and extract action items from meetings
              </p>
            </div>
          </div>
          <nav>
            <ul className="flex space-x-6 items-center"> {/* Added items-center */}
              <li>
                {/* Updated Home link to point to / */}
                <a href="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Home
                </a>
              </li>
              <li>
                {/* Added Dashboard link */}
                <a href="/dashboard" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Dashboard
                </a>
              </li>
              {/* Moved ModeToggle inside the nav for better alignment */}
              <li> 
                <ModeToggle />
              </li>
            </ul>
          </nav>
          {/* Removed ModeToggle from here as it's moved into the nav */}
        </div>
      </div> {/* Added missing closing div tag */}
    </header>
  );
};

export default Header;
