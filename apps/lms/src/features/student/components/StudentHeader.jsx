import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Clock, CheckCircle2, Menu } from 'lucide-react';
import { punchIn, punchOut } from '../../../config/api';
import { useAuth } from '../../../contexts/AuthContext';

export default function StudentHeader({
  userProfile,
  isPunchedIn,
  onPunchToggle,
  onSearch,
  onToggleSidebar,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');

  const displayName =
    userProfile?.displayName ||
    userProfile?.name ||
    userProfile?.email?.split('@')[0] ||
    'Student';
  const initial = String(displayName).trim().charAt(0).toUpperCase() || 'S';

  const handleSearch = (event) => {
    setQuery(event.target.value);
    if (onSearch) onSearch(event.target.value);
  };

  const handlePunch = async () => {
    if (!isPunchedIn) {
      try {
        const token = await user?.getIdToken();
        await punchIn(user?.uid || userProfile?.firebaseUid, token);
        onPunchToggle();
      } catch (error) {
        console.error('[student] Punch-in failed:', error?.message || error);
      }
    } else {
      try {
        const token = await user?.getIdToken();
        await punchOut(user?.uid || userProfile?.firebaseUid, token);
        onPunchToggle();
      } catch (error) {
        console.error('[student] Punch-out failed:', error?.message || error);
      }
    }
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle menu"
        className="lg:hidden p-2.5 rounded-xl bg-gray-100/80 text-gray-700 hover:bg-gray-200/80 transition-colors cursor-pointer shrink-0"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-md min-w-0">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search courses, sessions, doubts..."
          value={query}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#8a164b] focus:ring-2 focus:ring-[#8a164b]/10 transition-all"
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-5 shrink-0">
        <button
          onClick={handlePunch}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
            isPunchedIn
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm hover:bg-emerald-100'
              : 'bg-[#56051a] text-white shadow-md shadow-[#56051a]/20 hover:bg-[#8a164b]'
          }`}
        >
          {isPunchedIn ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Punched In</span>
            </>
          ) : (
            <>
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Punch In Now</span>
            </>
          )}
        </button>

        <button
          onClick={() => navigate('/student/notifications')}
          className="relative p-2.5 rounded-xl bg-gray-100/80 text-gray-600 hover:bg-gray-200/80 transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-gray-200">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#56051a] to-[#8a164b] flex items-center justify-center font-bold text-white shadow-md">
            {initial}
          </div>
          <div className="hidden sm:block text-left">
            <h4 className="text-sm font-bold text-gray-800 leading-tight">
              {displayName}
            </h4>
            <p className="text-xs text-gray-500 font-medium">
              {userProfile?.email || 'student@amaanitvam.org'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}