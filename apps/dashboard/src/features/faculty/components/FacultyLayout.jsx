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
    <div className="flex h-screen bg-gradient-to-br from-rose-50/70 via-slate-50 to-amber-50/50 overflow-hidden font-sans text-gray-900">
      {/* Background Decorative Soft Ambient Glows */}
      <div className="fixed top-0 left-1/3 w-[500px] h-[500px] bg-rose-200/25 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-1/3 w-[450px] h-[450px] bg-amber-200/20 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Sidebar */}
      <div className="relative z-10">
        <FacultySidebar onLogout={logout} />
      </div>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <FacultyHeader
          userProfile={userProfile}
          isPunchedIn={isPunchedIn}
          onPunchToggle={handlePunchToggle}
          onLogout={logout}
        />

        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-rose-50/50 via-slate-50 to-rose-100/30">
          {children}
        </main>
      </div>
    </div>
  );
}
