import React, { useState } from 'react';
import FacultySidebar from './FacultySidebar';
import FacultyHeader from './FacultyHeader';
import { useAuth } from '../../../contexts/AuthContext';

export default function FacultyLayout({ children }) {
  const { userProfile, logout } = useAuth();
  const [isPunchedIn, setIsPunchedIn] = useState(false);

  const handlePunchToggle = () => {
    setIsPunchedIn((prev) => !prev);
  };

  return (
    <div className="flex h-screen bg-gray-50/50 overflow-hidden font-sans">
      {/* Sidebar */}
      <FacultySidebar onLogout={logout} />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <FacultyHeader
          userProfile={userProfile}
          isPunchedIn={isPunchedIn}
          onPunchToggle={handlePunchToggle}
        />

        <main className="flex-1 overflow-y-auto bg-[#fafafa]">
          {children}
        </main>
      </div>
    </div>
  );
}
