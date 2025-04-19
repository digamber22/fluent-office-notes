
import { Meeting, mockMeetings } from './mockData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const api = {
  // Get all meetings
  getMeetings: async (): Promise<Meeting[]> => {
    await delay(500);
    return mockMeetings;
  },

  // Get a specific meeting by ID
  getMeeting: async (id: string): Promise<Meeting> => {
    await delay(300);
    const meeting = mockMeetings.find(m => m.id === id);
    if (!meeting) {
      throw new Error('Meeting not found');
    }
    return meeting;
  },

  // Upload audio file
  uploadAudio: async (file: File): Promise<{ success: boolean; meetingId?: string; error?: string }> => {
    await delay(1500); // Longer delay to simulate upload
    
    // Check if file is an audio file
    if (!file.type.startsWith('audio/')) {
      return { success: false, error: 'File must be an audio file' };
    }
    
    // Simulate successful upload and processing
    return {
      success: true,
      meetingId: (mockMeetings.length + 1).toString()
    };
  },

  // Export meeting as PDF (mock function that would normally trigger a download)
  exportPDF: (meetingId: string): string => {
    // In a real implementation, this would trigger a file download
    // Here we just return the URL that would be used
    return `/api/meetings/${meetingId}/export/pdf`;
  }
};
