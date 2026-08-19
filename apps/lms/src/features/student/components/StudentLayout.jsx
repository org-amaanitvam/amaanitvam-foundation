import { useState } from 'react';
import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';
import { useAuth } from '../../../contexts/AuthContext';

export default function StudentLayout({ children }) {
  const { userProfile, logout } = useAuth();
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handlePunchToggle = () => {
    setIsPunchedIn((prev) => !prev);
  };

  return (
    <div className="flex h-screen bg-gray-50/50 overflow-hidden font-(family-name:--font-body) text-[#3d2b2b]">
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      <StudentSidebar
        onLogout={logout}
        userProfile={userProfile}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <StudentHeader
          userProfile={userProfile}
          isPunchedIn={isPunchedIn}
          onPunchToggle={handlePunchToggle}
          onSearch={setSearchQuery}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto bg-[#fafafa]">
          {children({ searchQuery, isPunchedIn })}
        </main>
      </div>
    </div>
  );
}