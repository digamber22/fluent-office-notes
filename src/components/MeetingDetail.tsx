
import React, { useState, useEffect } from 'react';
import { api, Meeting, MeetingStatus } from '../utils/api'; // Import Meeting and MeetingStatus from api.ts
import SearchTranscript from './SearchTranscript';
import ExportOptions from './ExportOptions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components
import { Terminal } from "lucide-react"; // Import an icon for the alert

interface MeetingDetailProps {
  meetingId: string;
  onBack: () => void;
}

const MeetingDetail: React.FC<MeetingDetailProps> = ({ meetingId, onBack }) => {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [highlightedTranscript, setHighlightedTranscript] = useState<React.ReactNode>('');
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript'>('summary');
  const pollingIntervalRef = React.useRef<NodeJS.Timeout | null>(null); // Ref to store interval ID

  const fetchMeetingDetails = async (isPolling = false) => {
      // Don't show main loading indicator during polling, only initial load
      if (!isPolling) {
          setLoading(true);
      }
      try {
        setLoading(true);
        const data = await api.getMeeting(meetingId);
        setMeeting(data);
        setHighlightedTranscript(data.transcript || '');
        setError('');

        // --- Polling Logic ---
        // If status is still pending/processing, start or continue polling
        if (data.status === MeetingStatus.PENDING || data.status === MeetingStatus.PROCESSING) {
          if (!pollingIntervalRef.current) { // Start polling if not already started
            console.log(`Meeting ${meetingId} is processing, starting polling...`);
            pollingIntervalRef.current = setInterval(() => fetchMeetingDetails(true), 5000); // Poll every 5 seconds
          }
        } else {
          // If status is completed or failed, stop polling
          if (pollingIntervalRef.current) {
            console.log(`Meeting ${meetingId} processing finished (status: ${data.status}), stopping polling.`);
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
        // --- End Polling Logic ---

      } catch (err) {
        console.error('Error fetching meeting details:', err);
        setError('Failed to load meeting details');
        // Stop polling on error too
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
      } finally {
         // Combined finally logic:
         // Stop polling if it's running (e.g., on error)
         // Note: Polling is already stopped on success within the try block
         // if (pollingIntervalRef.current) { // This check is now redundant due to the catch block handling it
         //     clearInterval(pollingIntervalRef.current);
         //     pollingIntervalRef.current = null;
         // }
         // Stop initial loading indicator
         if (!isPolling) {
             setLoading(false);
         }
      }
    };

  useEffect(() => {
    fetchMeetingDetails(); // Initial fetch

    // Cleanup function to stop polling when component unmounts
    return () => {
      if (pollingIntervalRef.current) {
        console.log(`Unmounting MeetingDetail for ${meetingId}, stopping polling.`);
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [meetingId]); // Re-run effect if meetingId changes

  // Show loading only on initial load, not during polling refreshes
  if (loading && !meeting) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <button 
            onClick={onBack}
            className="text-blue-500 hover:text-blue-700 flex items-center"
          >
            ← Back to Meetings
          </button>
        </div>
        <div className="p-8 text-red-500 text-center font-medium">{error || 'Meeting not found'}</div>
      </div>
    );
  }

  // Updated formatDate to handle ISO string from upload_time
  const formatDate = (isoString: string) => {
    if (!isoString) return 'Date unavailable';
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    try {
      return new Date(isoString).toLocaleDateString(undefined, options);
    } catch (e) {
       console.error("Error formatting date:", isoString, e);
       return 'Invalid date';
    }
  };

  // Helper to render status alert
  const renderStatusAlert = () => {
    if (!meeting) return null;

    switch (meeting.status) {
      case MeetingStatus.PENDING:
      case MeetingStatus.PROCESSING:
        return (
          <Alert variant="default" className="mb-6 bg-blue-50 border-blue-200">
            <Terminal className="h-4 w-4" />
            <AlertTitle className="text-blue-800">Processing</AlertTitle>
            <AlertDescription className="text-blue-700">
              This meeting is currently being processed (transcription and summary). Please check back later.
            </AlertDescription>
          </Alert>
        );
      case MeetingStatus.FAILED:
        return (
          <Alert variant="destructive" className="mb-6">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Processing Failed</AlertTitle>
            <AlertDescription>
              {meeting.error_message || 'An error occurred during processing.'}
            </AlertDescription>
          </Alert>
        );
      case MeetingStatus.COMPLETED:
        // No alert needed for completed status
        return null;
      default:
        return null;
    }
  };


  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <button 
          onClick={onBack}
          className="text-blue-500 hover:text-blue-700 flex items-center mb-4"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Meetings
        </button>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            {/* Use filename and upload_time */}
            <h1 className="text-2xl font-bold mb-1">{meeting.filename}</h1>
            <p className="text-gray-500">{formatDate(meeting.upload_time)}</p>
          </div>
          <div className="mt-4 md:mt-0">
            {/* Only show export if completed */}
            {meeting.status === MeetingStatus.COMPLETED && (
              <ExportOptions meetingId={meeting.id} summary={meeting.summary || undefined} />
            )}
          </div>
        </div>
      </div>

      {/* Status Alert Area */}
      <div className="p-6 pt-0"> 
        {renderStatusAlert()}
      </div>

      {/* Tabs - Only show if processing is complete */}
      {meeting.status === MeetingStatus.COMPLETED && (
        <>
          <div className="border-b">
        <div className="flex">
          <button
            className={`px-6 py-3 text-center ${
              activeTab === 'summary'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-600 hover:text-blue-500'
            }`}
            onClick={() => setActiveTab('summary')}
          >
            Summary & Actions
          </button>
          <button
            className={`px-6 py-3 text-center ${
              activeTab === 'transcript'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-600 hover:text-blue-500'
            }`}
            onClick={() => setActiveTab('transcript')}
          >
            Full Transcript
          </button>
        </div> {/* Closes flex div */}
      </div> {/* Add missing closing div for border-b */}

          {/* Tab Content */}
          {activeTab === 'summary' ? (
            <div className="p-6">
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Meeting Summary</h2>
                <div className="bg-gray-50 p-4 rounded-lg border text-gray-700 whitespace-pre-wrap">
                  {meeting.summary || "Summary not available."}
            </div>
          </div>
              
              {/* Use the actionItems array directly */}
              {meeting.actionItems && meeting.actionItems.length > 0 ? (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Action Items</h2>
                  <ul className="bg-gray-50 p-4 rounded-lg border divide-y">
                    {meeting.actionItems.map((item, index) => (
                      <li key={index} className="py-3 flex items-start">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mr-3">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                 <div className="text-gray-500">No action items identified.</div>
              )}
            </div>
          ) : (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Full Transcript</h2>
              {meeting.transcript ? (
                <>
                  <SearchTranscript transcript={meeting.transcript} />
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border max-h-[500px] overflow-y-auto whitespace-pre-wrap text-left text-gray-700">
                    {highlightedTranscript || meeting.transcript} {/* Ensure transcript is displayed */}
                  </div>
                </>
              ) : (
                <div className="text-gray-500">Transcript not available.</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MeetingDetail;
