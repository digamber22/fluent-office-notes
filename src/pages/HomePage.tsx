
import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AudioUpload from '../components/AudioUpload';
import MeetingList from '../components/MeetingList';
import MeetingDetail from '../components/MeetingDetail';
import Header from '../components/Header';
import Footer from '../components/Footer';

const HomePage: React.FC = () => {
  const { id: meetingIdFromUrl } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(meetingIdFromUrl || null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Sync URL with selected meeting
  useEffect(() => {
    if (meetingIdFromUrl) {
      setSelectedMeetingId(meetingIdFromUrl);
    } else if (meetingIdFromUrl === undefined && selectedMeetingId !== null) {
      // Clear selection when navigating to home
      setSelectedMeetingId(null);
    }
  }, [meetingIdFromUrl, selectedMeetingId]);

  const handleSelectMeeting = useCallback((meetingId: string) => {
    setSelectedMeetingId(meetingId);
    navigate(`/meeting/${meetingId}`);
  }, [navigate]);

  const handleBackToList = useCallback(() => {
    setSelectedMeetingId(null);
    navigate('/');
  }, [navigate]);

  const handleUploadSuccess = useCallback((meetingId: string) => {
    // Trigger a refresh of the meeting list
    setRefreshCounter(prev => prev + 1);
    // Select the newly uploaded meeting
    setSelectedMeetingId(meetingId);
    navigate(`/meeting/${meetingId}`);
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        {!selectedMeetingId ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold">Meeting Management Dashboard</h2>
              <p className="text-gray-600 mt-2">Upload audio recordings or select an existing meeting to view details</p>
            </div>
          
            <div className="grid md:grid-cols-5 gap-6">
              <div className="md:col-span-2">
                <AudioUpload onUploadSuccess={handleUploadSuccess} />
                
                <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-blue-800 mb-2">Quick Tips</h3>
                  <ul className="text-sm text-blue-700 space-y-2">
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Upload meeting audio files for automatic transcription</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Review AI-generated meeting summaries</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Track action items automatically extracted from discussions</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Search through full transcripts to find specific information</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="md:col-span-3">
                <MeetingList 
                  onSelectMeeting={handleSelectMeeting} 
                  refreshTrigger={refreshCounter} 
                />
              </div>
            </div>
          </>
        ) : (
          <MeetingDetail meetingId={selectedMeetingId} onBack={handleBackToList} />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;
