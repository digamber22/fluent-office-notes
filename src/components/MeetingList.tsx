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

  // Loading state: Use theme colors
  if (loading) {
    return (
      // Remove outer div, rely on parent Card's padding/background
      <div className="p-8 text-center"> 
        {/* Use border-primary for spinner */}
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div> 
        {/* Use muted foreground for text */}
        <p className="mt-2 text-muted-foreground">Loading meetings...</p> 
      </div>
    );
  }

  // Error state: Use theme colors
  if (error) {
    return (
      // Remove outer div, rely on parent Card's padding/background
      // Use destructive theme colors for error message
      <div className="p-4 text-destructive text-center">{error}</div> 
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
    // Remove outer div, rely on parent Card's padding/background
    <div className="p-0"> 
      {/* Search input section */}
      <div className="relative mb-4"> {/* Added margin-bottom */}
        {/* Use theme colors for input */}
        <input
          type="search"
          placeholder="Search meetings..."
          className="w-full p-2 pl-10 pr-4 border border-border bg-input rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-ring" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* Use muted foreground for icon */}
        <div className="absolute left-3 top-2.5 text-muted-foreground"> 
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      {/* No meetings state */}
      {meetings.length === 0 ? (
        <div className="p-8 text-center">
          {/* Use muted foreground for icon and text */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <p className="text-muted-foreground">No meetings found. Upload an audio file to get started.</p>
        </div>
      // No search results state
      ) : filteredMeetings.length === 0 ? (
        <div className="p-8 text-center">
          {/* Use muted foreground for text */}
          <p className="text-muted-foreground">No meetings match your search.</p>
        </div>
      // Meeting list
      ) : (
        // Use theme border for divider, remove max-height for now
        <ul className="divide-y divide-border overflow-y-auto"> 
          {filteredMeetings.map((meeting) => (
            // Use accent hover background
            <li key={meeting.id} className="p-4 hover:bg-accent transition-colors"> 
              <Link 
                to={`/meetings/${meeting.id}`}
                className="flex justify-between items-start"
              >
                <div>
                  {/* Use theme text colors */}
                  <div className="font-medium text-foreground">{meeting.filename}</div>
                  <div className="text-sm text-muted-foreground mt-1">{formatDate(meeting.upload_time)}</div>
                </div>
                {/* Use primary color for arrow */}
                <div className="text-primary"> 
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
