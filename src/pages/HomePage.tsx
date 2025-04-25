
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AudioUpload from '../components/AudioUpload';
import MeetingList from '@/components/MeetingList'; // Use alias
import Header from '@/components/Header'; // Use alias
import Footer from '@/components/Footer'; // Use alias
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Import Card components

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [refreshCounter, setRefreshCounter] = React.useState(0);

  const handleUploadSuccess = useCallback((meetingId: string) => {
    setRefreshCounter(prev => prev + 1);
    navigate(`/meetings/${meetingId}`);
  }, [navigate]);

  return (
    // Use theme background color
    <div className="flex flex-col min-h-screen bg-background"> 
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          {/* Use theme foreground color */}
          <h2 className="text-2xl font-semibold text-foreground">Meeting Management Dashboard</h2> 
          {/* Use muted foreground color */}
          <p className="text-muted-foreground mt-2">Upload audio recordings or select an existing meeting to view details</p> 
        </div>
        
        <div className="grid md:grid-cols-5 gap-6">
          {/* Wrap Audio Upload and Quick Tips in a Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Upload New Meeting</CardTitle>
            </CardHeader>
            <CardContent>
              <AudioUpload onUploadSuccess={handleUploadSuccess} />
              
              {/* Quick Tips section - styling adjusted slightly for Card context */}
              <div className="mt-6 border-t border-border pt-4"> 
                <h3 className="font-medium text-foreground mb-2">Quick Tips</h3>
                <ul className="text-sm text-muted-foreground space-y-2"> 
                  <li className="flex items-start">
                    {/* Use primary color for the icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Upload meeting audio files for automatic transcription</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Review AI-generated meeting summaries</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Track action items automatically extracted from discussions</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Search through full transcripts to find specific information</span>
                </li>
              </ul>
            </div>
            </CardContent> {/* Add missing closing CardContent tag */}
          </Card> {/* Add missing closing Card tag */}
          
          {/* Wrap Meeting List in a Card */}
          <Card className="md:col-span-3">
             <CardHeader>
              <CardTitle>Meeting Recordings</CardTitle>
            </CardHeader>
            <CardContent>
              <MeetingList refreshTrigger={refreshCounter} />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
