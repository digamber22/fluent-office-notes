import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, Meeting } from '../utils/api'; // Import Meeting from api.ts

interface MeetingListProps {
  refreshTrigger?: number;
}

const MeetingList: React.FC<MeetingListProps> = ({ refreshTrigger }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const data = await api.getMeetings();
        setMeetings(data);
        setError('');
      } catch (err) {
        console.error('Error fetching meetings:', err);
        setError('Failed to load meetings');
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [refreshTrigger]);

  // Filter based on filename now
  const filteredMeetings = meetings.filter(meeting => 
    meeting.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Meeting Recordings</h2>
        </div>
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
          <p className="mt-2 text-gray-500">Loading meetings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Meeting Recordings</h2>
        </div>
        <div className="p-4 text-red-500 text-center">{error}</div>
      </div>
    );
  }

  // Updated formatDate to handle ISO string from upload_time
  const formatDate = (isoString: string) => {
    if (!isoString) return 'Date unavailable'; // Handle cases where date might be null/undefined
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true // Optional: Use 12-hour format
    };
    try {
      return new Date(isoString).toLocaleDateString(undefined, options);
    } catch (e) {
      console.error("Error formatting date:", isoString, e);
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold mb-2">Meeting Recordings</h2>
        <div className="relative">
          <input
            type="search"
            placeholder="Search meetings..."
            className="w-full p-2 pl-10 pr-4 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {meetings.length === 0 ? (
        <div className="p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <p className="text-gray-500">No meetings found. Upload an audio file to get started.</p>
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500">No meetings match your search.</p>
        </div>
      ) : (
        <ul className="divide-y max-h-[450px] overflow-y-auto">
          {filteredMeetings.map((meeting) => (
            <li key={meeting.id} className="p-4 hover:bg-gray-50 transition-colors">
              <Link 
                to={`/meetings/${meeting.id}`}
                className="flex justify-between items-start"
              >
                <div>
                  {/* Use filename and upload_time */}
                  <div className="font-medium text-gray-800">{meeting.filename}</div>
                  <div className="text-sm text-gray-500 mt-1">{formatDate(meeting.upload_time)}</div>
                </div>
                <div className="text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MeetingList;
