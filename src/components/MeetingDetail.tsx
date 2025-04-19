
import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Meeting } from '../utils/mockData';
import SearchTranscript from './SearchTranscript';
import ExportOptions from './ExportOptions';

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

  useEffect(() => {
    const fetchMeetingDetails = async () => {
      try {
        setLoading(true);
        const data = await api.getMeeting(meetingId);
        setMeeting(data);
        setHighlightedTranscript(data.transcript || '');
        setError('');
      } catch (err) {
        console.error('Error fetching meeting details:', err);
        setError('Failed to load meeting details');
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingDetails();
  }, [meetingId]);

  if (loading) {
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

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
            <h1 className="text-2xl font-bold mb-1">{meeting.title}</h1>
            <p className="text-gray-500">{formatDate(meeting.date)}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <ExportOptions meetingId={meeting.id} summary={meeting.summary} />
          </div>
        </div>
      </div>
      
      {/* Tabs */}
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
        </div>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'summary' ? (
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Meeting Summary</h2>
            <div className="bg-gray-50 p-4 rounded-lg border text-gray-700">
              {meeting.summary}
            </div>
          </div>
          
          {meeting.actionItems && meeting.actionItems.length > 0 && (
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
          )}
        </div>
      ) : (
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Full Transcript</h2>
          {meeting.transcript && (
            <>
              <SearchTranscript transcript={meeting.transcript} />
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border max-h-[500px] overflow-y-auto whitespace-pre-wrap text-left text-gray-700">
                {highlightedTranscript}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MeetingDetail;
