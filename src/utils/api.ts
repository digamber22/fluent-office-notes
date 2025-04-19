// Define the MeetingStatus enum based on backend/app/models.py
export enum MeetingStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

// Define the Meeting type based on backend/app/schemas.py Meeting
export interface Meeting {
  id: string; // Changed from number in backend to string for consistency in frontend usage
  filename: string; // Renamed from title
  upload_time: string; // Keep as string, will format from backend datetime
  audio_file_path?: string | null;
  transcript?: string | null;
  summary?: string | null;
  actionItems?: string[]; // Changed from string in backend, will parse
  status: MeetingStatus;
  error_message?: string | null;
}

// Define the UploadResponse type based on backend/app/schemas.py UploadResponse
export interface UploadResponse {
    success: boolean;
    meetingId?: string; // Kept as string
    error?: any;
}


// Base URL for the API (assuming backend runs on the same origin or is proxied)
const API_BASE_URL = '/api'; // Adjust if your backend API is hosted elsewhere

// Helper function to handle response and errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to transform backend data to frontend Meeting type
const transformMeetingData = (backendMeeting: any): Meeting => {
  // Parse action items string into an array (split by newline, filter empty lines)
  const actionItemsArray = backendMeeting.action_items
    ? backendMeeting.action_items.split('\n').filter((item: string) => item.trim() !== '')
    : [];

  return {
    ...backendMeeting,
    id: String(backendMeeting.id), // Convert id to string
    upload_time: new Date(backendMeeting.upload_time).toISOString(), // Keep ISO string or format as needed
    filename: backendMeeting.filename || `Meeting ${backendMeeting.id}`, // Use filename, provide fallback
    actionItems: actionItemsArray, // Use parsed array
  };
};


// Actual API functions
export const api = {
  // Get all meetings
  getMeetings: async (): Promise<Meeting[]> => {
    const response = await fetch(`${API_BASE_URL}/meetings/`);
    const data = await handleResponse(response);
    // Assuming the backend returns a list of meetings matching its schema
    return data.map(transformMeetingData);
  },

  // Get a specific meeting by ID
  getMeeting: async (id: string): Promise<Meeting> => {
    const response = await fetch(`${API_BASE_URL}/meetings/${id}`);
    const data = await handleResponse(response);
    // Assuming the backend returns a single meeting matching its schema
    return transformMeetingData(data);
  },

  // Upload audio file
  uploadAudio: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/meetings/upload`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, browser does it automatically for FormData
      });
      // Backend returns UploadResponse schema directly
      const data: UploadResponse = await handleResponse(response);
      return data;
    } catch (error: any) {
      console.error("Upload failed:", error);
      return { success: false, error: error.message || 'Upload failed due to an unknown error.' };
    }
  },

  // Get PDF export URL (or trigger download if backend handles it differently)
  exportPDF: (meetingId: string): string => {
    // This simply returns the URL. The actual download should be handled
    // by navigating to this URL or using it in an anchor tag.
    return `${API_BASE_URL}/meetings/${meetingId}/export/pdf`;
  },

  // Search meeting transcripts
  searchMeetings: async (query: string): Promise<Meeting[]> => {
    const response = await fetch(`${API_BASE_URL}/meetings/search/?query=${encodeURIComponent(query)}`);
    const data = await handleResponse(response);
    return data.map(transformMeetingData);
  }
};
