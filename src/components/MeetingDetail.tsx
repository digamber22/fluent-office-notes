import React, { useState, useEffect } from 'react';
import { api, Meeting, MeetingStatus } from '../utils/api'; // Import Meeting and MeetingStatus from api.ts
import SearchTranscript from './SearchTranscript';
import ExportOptions from './ExportOptions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown
import remarkGfm from 'remark-gfm'; // Import remarkGfm for GitHub Flavored Markdown
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card components
import { Terminal, Languages, CheckCircle2 } from "lucide-react"; // Import Languages and CheckCircle2 icons
import { Button } from "@/components/ui/button"; // Import Button
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Import AlertDialog components
import { toast } from "@/components/ui/use-toast"; // Import toast for notifications
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

interface MeetingDetailProps {
  meetingId: string;
  onBack: () => void;
}

const MeetingDetail: React.FC<MeetingDetailProps> = ({ meetingId, onBack }) => {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript'>('summary');
  // const [displayLanguage, setDisplayLanguage] = useState<'en' | 'zh'>('en'); // Removed state for language selection
  const pollingIntervalRef = React.useRef<NodeJS.Timeout | null>(null); 
  const navigate = useNavigate(); 

  // --- Delete Handler ---
  const handleDelete = async () => {
    if (!meeting) return;
    try {
      await api.deleteMeeting(meeting.id); 
      toast({
        title: "Success",
         description: `Meeting "${meeting.filename}" deleted successfully.`,
         variant: "default", 
       });
       navigate('/dashboard'); 
     } catch (error) {
      console.error("Failed to delete meeting:", error);
      toast({
        title: "Error",
        description: `Failed to delete meeting. ${error instanceof Error ? error.message : 'Please try again.'}`,
        variant: "destructive",
      });
    }
  };
  // --- End Delete Handler ---


  const fetchMeetingDetails = async (isPolling = false) => {
      if (!isPolling) {
          setLoading(true);
      }
      try {
         setLoading(true); // Keep loading true until fetch completes
         const data = await api.getMeeting(meetingId);
         setMeeting(data);
         setError('');
         // Removed setDisplayLanguage call

        // --- Polling Logic ---
        if (data.status === MeetingStatus.PENDING || data.status === MeetingStatus.PROCESSING) {
          if (!pollingIntervalRef.current) { 
            console.log(`Meeting ${meetingId} is processing, starting polling...`);
            pollingIntervalRef.current = setInterval(() => fetchMeetingDetails(true), 5000); 
          }
        } else {
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
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
      } finally {
         // Stop initial loading indicator only if not polling or if fetch failed
         if (!isPolling || error) { 
             setLoading(false);
         }
      }
    };

  useEffect(() => {
    fetchMeetingDetails(); 
    return () => {
      if (pollingIntervalRef.current) {
        console.log(`Unmounting MeetingDetail for ${meetingId}, stopping polling.`);
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [meetingId]); 

  // Loading state
  if (loading && !meeting) { // Show loading only if meeting data isn't available yet
    return (
      <div className="bg-card text-card-foreground rounded-lg shadow p-8"> 
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div> 
        </div>
      </div>
    );
  }

  // Error/Not Found state
  if (error || !meeting) {
    return (
      <div className="bg-card text-card-foreground rounded-lg shadow p-6"> 
        <div className="mb-6">
          <button 
            onClick={onBack}
            className="text-primary hover:text-primary/80 flex items-center" 
          >
            ← Back to Meetings
          </button>
        </div>
        <div className="p-8 text-destructive text-center font-medium">{error || 'Meeting not found'}</div> 
      </div>
    );
  }

  // Date Formatter
  const formatDate = (isoString: string) => {
    if (!isoString) return 'Date unavailable';
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    };
    try {
      return new Date(isoString).toLocaleDateString(undefined, options);
    } catch (e) {
       console.error("Error formatting date:", isoString, e);
       return 'Invalid date';
    }
  };

  // Status Alert Renderer
  const renderStatusAlert = () => {
    if (!meeting) return null;
    switch (meeting.status) {
      case MeetingStatus.PENDING:
      case MeetingStatus.PROCESSING:
        return (
          // Use primary theme colors with opacity for processing alert
          <Alert variant="default" className="mb-6 bg-primary/10 border-primary/20 text-primary"> 
            <Terminal className="h-4 w-4" /> 
            <AlertTitle>Processing</AlertTitle> 
            <AlertDescription> 
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
      default: return null;
    }
  };

  // Action Item Cleaner Function
  const cleanActionItem = (item: string): string => {
    let cleanedItem = item;
    if (cleanedItem.startsWith('- "- ')) cleanedItem = cleanedItem.substring(4);
    else if (cleanedItem.startsWith('- ')) cleanedItem = cleanedItem.substring(2);
    cleanedItem = cleanedItem.replace(/^\d+\.\s*/, ''); 
    cleanedItem = cleanedItem.replace(/^\s*\*\*|\*\*\s*$/g, '').trim();
    if (cleanedItem.endsWith('"')) cleanedItem = cleanedItem.substring(0, cleanedItem.length - 1);
    if (cleanedItem.endsWith('.')) cleanedItem = cleanedItem.substring(0, cleanedItem.length - 1);
    return cleanedItem.trim();
  };

  // Function to open Google Translate
  const openGoogleTranslate = (text: string) => {
    const googleTranslateUrl = `https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(text)}&op=translate`;
    window.open(googleTranslateUrl, '_blank', 'noopener,noreferrer');
  };

  // Main Render
  return (
    <div className="bg-card text-card-foreground rounded-lg shadow"> 
      {/* Header Section */}
      <div className="p-6 border-b border-border"> 
        <button 
          onClick={onBack}
          className="text-primary hover:text-primary/80 flex items-center mb-4" 
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Meetings
        </button>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1 text-foreground">{meeting.filename}</h1> 
            <p className="text-muted-foreground">{formatDate(meeting.upload_time)}</p> 
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-2"> 
            {meeting.status === MeetingStatus.COMPLETED && (
              <>
                <ExportOptions meetingId={meeting.id} summary={meeting.summary_en || undefined} /> 
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="destructive" size="sm">Delete</Button></AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the meeting "{meeting.filename}" and its associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Yes, delete meeting</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Status Alert */}
      <div > 
        {renderStatusAlert()}
      </div>

      {/* Tabs & Content (Only if Completed) */}
      {meeting.status === MeetingStatus.COMPLETED && (
        <>
          <div className="border-b border-border"> 
            <div className="flex">
              <button
                className={`px-6 py-3 text-center transition-colors ${activeTab === 'summary' ? 'border-b-2 border-primary text-primary font-medium' : 'text-muted-foreground hover:text-primary'}`}
                onClick={() => setActiveTab('summary')}
              >
                Summary & Actions
              </button>
              <button
                className={`px-6 py-3 text-center transition-colors ${activeTab === 'transcript' ? 'border-b-2 border-primary text-primary font-medium' : 'text-muted-foreground hover:text-primary'}`}
                onClick={() => setActiveTab('transcript')}
              >
                Full Transcript
              </button>
            </div> 
          </div> 

          {/* Summary Tab Content */}
          {activeTab === 'summary' && (
            <div className="p-6 space-y-6"> {/* Add spacing between cards */}
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Meeting Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Use ReactMarkdown to render summary */}
                  <div className="prose prose-sm dark:prose-invert max-w-none bg-muted p-4 rounded-lg border border-border text-foreground/90 min-h-[50px]"> 
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {meeting.detected_language === 'zh' && meeting.summary_zh ? meeting.summary_zh
                       : meeting.summary_en ? meeting.summary_en
                       : '*Processing summary...*'}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
              
              {/* Action Items Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Action Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const actionItems = meeting.detected_language === 'zh' ? meeting.action_items_zh : meeting.action_items_en;
                    return actionItems && actionItems.length > 0 ? (
                      <ul className="divide-y divide-border"> {/* Removed extra background/padding, card provides it */}
                        {actionItems.map((item, index) => (
                          <li key={index} className="py-3 flex items-start"> {/* Adjusted padding */}
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-medium mr-3 flex-shrink-0">{index + 1}</span>
                            <span className="text-foreground flex-1">{cleanActionItem(item)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div>
                        <div className="flex items-center text-muted-foreground">
                           <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> {/* Added check icon */}
                           No actionable items were identified in this meeting.
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          (Tip: To get better action items, try clearly stating tasks with assignees and deadlines during the meeting.)
                        </p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Transcript Tab Content */}
          {activeTab === 'transcript' && (
             <div className="p-6">
               <h2 className="text-xl font-semibold mb-4 text-foreground">Full Transcript</h2> 
               {meeting.transcript ? (
                 <>
                   <SearchTranscript transcript={meeting.transcript} />
                   {/* Add Google Translate Button */}
                   <div className="mt-4 text-right"> {/* Align button to the right */}
                     <Button 
                       variant="outline" 
                       size="sm" 
                       onClick={() => openGoogleTranslate(meeting.transcript || '')}
                       disabled={!meeting.transcript}
                     >
                       <Languages className="mr-2 h-4 w-4" /> 
                       Translate with Google
                     </Button>
                   </div>
                 </>
               ) : (
                 <div className="text-muted-foreground">Transcript not available.</div>
               )}
             </div>
          )}
        </>
      )}
    </div>
  );
};

export default MeetingDetail;
