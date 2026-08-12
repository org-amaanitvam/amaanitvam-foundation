import React from 'react';
import { Search, Bell, Clock, CheckCircle2, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FacultyHeader({ userProfile, isPunchedIn, onPunchToggle, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="h-20 bg-white/90 backdrop-blur-md border-b border-rose-100 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search sessions, applications, notices..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50/90 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#8a164b] focus:ring-2 focus:ring-[#8a164b]/10 transition-all text-gray-800 font-medium"
        />
      </div>

      {/* Action Controls & Profile */}
      <div className="flex items-center gap-4">
        {/* Clock In / Out Quick Button */}
        <button
          onClick={onPunchToggle}
          className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-extrabold tracking-wide transition-all duration-200 shadow-md ${
            isPunchedIn
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-emerald-600/10 hover:bg-emerald-100'
              : 'bg-gradient-to-r from-[#5d0f2d] to-[#8a164b] text-white shadow-[#5d0f2d]/25 hover:from-[#741339] hover:to-[#a11a58]'
          }`}
        >
          {isPunchedIn ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>On Duty (Clocked In)</span>
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 text-[#d4af37]" />
              <span>Clock In Now</span>
            </>
          )}
        </button>

        {/* Notifications Button */}
        <button
          onClick={() => navigate('/faculty/notifications')}
          className="relative p-2.5 rounded-xl bg-gray-100/90 text-gray-600 hover:bg-gray-200/90 transition-colors border border-gray-200/60"
          title="Notifications Center"
        >
          <Bell className="w-5 h-5 text-[#8a164b]" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>

        {/* Profile Avatar & Info */}
        <div
          onClick={() => navigate('/faculty/settings')}
          className="flex items-center gap-3 pl-3 border-l border-gray-200 cursor-pointer group"
          title="Go to Faculty Settings"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#5d0f2d] to-[#8a164b] flex items-center justify-center font-black text-white shadow-md border border-[#d4af37]/40 group-hover:scale-105 transition-transform">
            {userProfile?.displayName?.[0] || 'F'}
          </div>
          <div className="hidden sm:block text-left">
            <h4 className="text-xs font-extrabold text-gray-900 leading-tight group-hover:text-[#8a164b] transition-colors">
              {userProfile?.displayName || 'Faculty Member'}
            </h4>
            <p className="text-[11px] text-[#8a164b] font-bold">{userProfile?.email || 'faculty@amaanitvam.org'}</p>
          </div>
        </div>

        {/* Settings Quick Icon */}
        <button
          onClick={() => navigate('/faculty/settings')}
          className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-[#8a164b] transition-colors border border-gray-200/60"
          title="Faculty Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Sign Out Action Button */}
        <button
          onClick={onLogout}
          className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
