
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MeetingDetail from '../components/MeetingDetail';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MeetingDetailPage: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();

  const handleBackToList = () => {
    navigate('/');
  };

  if (!meetingId) {
    navigate('/');
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <MeetingDetail meetingId={meetingId} onBack={handleBackToList} />
      </main>
      <Footer />
    </div>
  );
};

export default MeetingDetailPage;
