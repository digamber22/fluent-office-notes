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
  transcript?: string | null; // Original transcript
  detected_language?: string | null;
  summary_en?: string | null;
  summary_zh?: string | null;
  action_items_en?: string[]; // Will be parsed from JSON string
  action_items_zh?: string[]; // Will be parsed from JSON string
  status: MeetingStatus;
  error_message?: string | null;
  // Remove old generic fields
  // summary?: string | null;
  // actionItems?: string[]; 
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
  // Helper to safely parse JSON string for action items
  const parseActionItems = (jsonString: string | null | undefined): string[] => {
    if (!jsonString) return [];
    try {
      const items = JSON.parse(jsonString);
      return Array.isArray(items) ? items.map(String) : []; // Ensure it's an array of strings
    } catch (e) {
      console.error("Failed to parse action items JSON:", e);
      return []; // Return empty array on parse error
    }
  };

  return {
    // Spread backend data first
    ...backendMeeting, 
    // Override/transform specific fields
    id: String(backendMeeting.id), 
    upload_time: new Date(backendMeeting.upload_time).toISOString(), 
    filename: backendMeeting.filename || `Meeting ${backendMeeting.id}`, 
    // Parse action items from JSON strings
    action_items_en: parseActionItems(backendMeeting.action_items_en), 
    action_items_zh: parseActionItems(backendMeeting.action_items_zh),
    // Ensure other fields are passed through correctly
    transcript: backendMeeting.transcript,
    detected_language: backendMeeting.detected_language,
    summary_en: backendMeeting.summary_en,
    summary_zh: backendMeeting.summary_zh,
    status: backendMeeting.status,
    error_message: backendMeeting.error_message,
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
  },

  // Delete a meeting by ID
  deleteMeeting: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
      method: 'DELETE',
    });
    // Check if the response is ok, but don't necessarily need to parse JSON body for DELETE
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    // No return value needed for successful delete
  }
};
