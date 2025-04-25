import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header'; // Use alias
import Footer from '@/components/Footer'; // Use alias
import { Button } from '@/components/ui/button'; // Use alias
// Import more icons
import { FileText, ListChecks, BrainCircuit } from 'lucide-react'; 

const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      {/* Adjust gradient based on current theme (cyan/amber) */}
      <main className="flex-grow container mx-auto px-4 py-16 flex items-center bg-gradient-to-br from-background to-cyan-50 dark:to-slate-900"> 
        <div className="text-center mx-auto max-w-3xl">
          {/* Add multiple icons */}
          <div className="flex justify-center space-x-8 mb-8">
            <FileText className="h-12 w-12 text-primary opacity-80" />
            <ListChecks className="h-12 w-12 text-secondary opacity-80" />
            <BrainCircuit className="h-12 w-12 text-primary opacity-80" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Effortless Meeting Notes
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10"> {/* Increased margin */}
            Automatically transcribe, summarize, and extract key insights from your meeting recordings. Focus on the conversation, not the note-taking.
          </p>
          <Link to="/dashboard">
            {/* Use default Button styling which now uses the theme */}
            <Button size="lg"> 
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
