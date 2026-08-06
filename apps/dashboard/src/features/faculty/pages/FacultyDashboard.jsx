import React from 'react';
import { BookOpen, Users, HelpCircle, Calendar, Sparkles } from 'lucide-react';
import MetricCard from '../components/MetricCard';

export default function FacultyDashboard() {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#5d0f2d] to-[#8a164b] text-white shadow-xl flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-rose-200 backdrop-blur-md mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Faculty Command Center</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Welcome Back, Professor!</h2>
          <p className="text-sm text-rose-100/80 mt-1 max-w-xl">
            Here is your daily teaching overview. You have 3 live classes scheduled today and 5 student doubts awaiting resolution.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Assigned Courses" value="4" icon={BookOpen} changeText="+1 this term" />
        <MetricCard title="Total Students" value="128" icon={Users} changeText="Active Cohorts" />
        <MetricCard title="Pending Doubts" value="5" icon={HelpCircle} changeText="Urgent Action" isPositive={false} />
        <MetricCard title="Classes Today" value="3" icon={Calendar} changeText="On Schedule" />
      </div>

      {/* Main Workspace Grid Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[300px]">
          <h3 className="font-bold text-gray-900 text-lg mb-4">Today's Class Schedule</h3>
          <p className="text-sm text-gray-500">Live sessions for today will render here in Phase 3.</p>
        </div>
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[300px]">
          <h3 className="font-bold text-gray-900 text-lg mb-4">Pending Student Doubts</h3>
          <p className="text-sm text-gray-500">High priority doubts queue will render here in Phase 3.</p>
        </div>
      </div>
    </div>
  );
}
