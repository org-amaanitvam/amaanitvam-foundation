import React from 'react';
import { Search, Bell, Clock, CheckCircle2, LogOut } from 'lucide-react';

export default function FacultyHeader({ userProfile, isPunchedIn, onPunchToggle, onLogout }) {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search courses, students, doubts..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#8a164b] focus:ring-2 focus:ring-[#8a164b]/10 transition-all"
        />
      </div>

      {/* Action Controls & Profile */}
      <div className="flex items-center gap-5">
        {/* Clock In / Out Quick Button */}
        <button
          onClick={onPunchToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
            isPunchedIn
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm hover:bg-emerald-100'
              : 'bg-[#5d0f2d] text-white shadow-md shadow-[#5d0f2d]/20 hover:bg-[#8a164b]'
          }`}
        >
          {isPunchedIn ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>On Duty (Clocked In)</span>
            </>
          ) : (
            <>
              <Clock className="w-4 h-4" />
              <span>Clock In Now</span>
            </>
          )}
        </button>

        {/* Notifications Button */}
        <button className="relative p-2.5 rounded-xl bg-gray-100/80 text-gray-600 hover:bg-gray-200/80 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Profile Avatar & Info */}
        <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#5d0f2d] to-[#8a164b] flex items-center justify-center font-bold text-white shadow-md">
            {userProfile?.displayName?.[0] || 'F'}
          </div>
          <div className="hidden sm:block text-left">
            <h4 className="text-sm font-bold text-gray-800 leading-tight">
              {userProfile?.displayName || 'Faculty Member'}
            </h4>
            <p className="text-xs text-gray-500 font-medium">{userProfile?.email || 'faculty@amaanitvam.org'}</p>
          </div>

          {/* Sign Out Action Button */}
          <button
            onClick={onLogout}
            className="p-2 ml-1 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
