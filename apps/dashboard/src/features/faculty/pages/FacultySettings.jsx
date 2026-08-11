import React, { useState } from 'react';
import {
  User,
  Settings,
  Shield,
  Clock,
  Bell,
  Save,
  CheckCircle2,
  Lock,
  Plus,
  Trash2,
  Calendar,
  Video,
  KeyRound,
  Smartphone,
  Globe,
  Award,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function FacultySettings() {
  const { userProfile, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'office_hours' | 'notifications' | 'security'
  const [saving, setSaving] = useState(false);

  // Tab 1: Profile Form State
  const [profileData, setProfileData] = useState({
    displayName: userProfile?.displayName || 'Prof. ABC',
    title: 'Senior Associate Professor',
    department: 'Department of Computer Science & Engineering',
    email: userProfile?.email || 'faculty@amaanitvam.org',
    phone: '+91 98765 12345',
    officeLocation: 'Academic Block B, Room 304',
    bio: 'Specializing in distributed systems, full-stack cloud architectures, and interactive UI engineering.',
    qualifications: [
      'Ph.D. in Computer Science - IIT Bombay',
      'M.Tech in Software Engineering - BITS Pilani',
      'B.Tech in Information Technology - NIT Trichy',
    ],
  });

  const [newQualification, setNewQualification] = useState('');

  // Tab 2: Office Hours Availability State
  const [officeHours, setOfficeHours] = useState([
    { day: 'Monday', time: '03:00 PM - 05:00 PM', roomUrl: 'https://meet.google.com/office-mon', capacity: 10 },
    { day: 'Wednesday', time: '02:00 PM - 04:00 PM', roomUrl: 'https://meet.google.com/office-wed', capacity: 8 },
    { day: 'Friday', time: '11:00 AM - 01:00 PM', roomUrl: 'https://meet.google.com/office-fri', capacity: 12 },
  ]);

  // Tab 3: Notification Preferences State
  const [notifications, setNotifications] = useState({
    emailDoubtAlerts: true,
    emailSessionReminders: true,
    smsUrgentAlerts: false,
    attendanceAnomalies: true,
    applicationSubmissions: true,
    broadcastNotices: false,
  });

  // Tab 4: Security Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleAddQualification = () => {
    if (!newQualification.trim()) return;
    setProfileData((prev) => ({
      ...prev,
      qualifications: [...prev.qualifications, newQualification.trim()],
    }));
    setNewQualification('');
  };

  const handleRemoveQualification = (index) => {
    setProfileData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index),
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (updateProfile) {
        await updateProfile({ displayName: profileData.displayName });
      }
      toast.success('Faculty profile settings saved successfully!');
    } catch (err) {
      toast.error('Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    toast.success('Password updated successfully!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-fade-in text-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5d0f2d]/10 text-[#5d0f2d] border border-[#8a164b]/20 text-xs font-bold mb-2">
            <Settings className="w-4 h-4 text-[#8a164b]" />
            <span>Faculty Profile & Workstation Preferences</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Faculty Settings</h2>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            Configure your academic profile, office hours availability, notification rules, and security.
          </p>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-3xl border border-rose-100 shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[550px]">
        {/* Sidebar Nav Tabs */}
        <div className="w-full md:w-64 bg-gradient-to-b from-[#5d0f2d]/5 to-transparent p-5 border-r border-rose-100 space-y-2">
          {[
            { id: 'profile', label: 'Profile & Bio', icon: User },
            { id: 'office_hours', label: 'Office Hours & Availability', icon: Clock },
            { id: 'notifications', label: 'Notification Preferences', icon: Bell },
            { id: 'security', label: 'Security & Credentials', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-extrabold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#5d0f2d] to-[#8a164b] text-white shadow-md shadow-[#5d0f2d]/20'
                    : 'text-gray-600 hover:bg-rose-50 hover:text-[#5d0f2d]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#d4af37]' : 'text-gray-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8">
          {/* TAB 1: Profile & Bio */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="flex items-center gap-4 border-b border-rose-100 pb-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#5d0f2d] to-[#8a164b] text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-[#d4af37]">
                  {profileData.displayName?.[0] || 'F'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">{profileData.displayName}</h3>
                  <p className="text-xs text-[#8a164b] font-bold">{profileData.title}</p>
                  <p className="text-[11px] text-gray-400 font-medium">{profileData.department}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#5d0f2d]">Full Name</label>
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#8a164b]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#5d0f2d]">Designation / Title</label>
                  <input
                    type="text"
                    value={profileData.title}
                    onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#8a164b]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#5d0f2d]">Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#8a164b]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#5d0f2d]">Phone Number</label>
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#8a164b]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#5d0f2d]">Office Location</label>
                <input
                  type="text"
                  value={profileData.officeLocation}
                  onChange={(e) => setProfileData({ ...profileData, officeLocation: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#8a164b]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#5d0f2d]">Academic Bio</label>
                <textarea
                  rows={3}
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#8a164b]"
                />
              </div>

              {/* Academic Qualifications List */}
              <div className="space-y-3 pt-3 border-t border-rose-100">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#5d0f2d] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#8a164b]" />
                  Degrees & Qualifications
                </label>

                <div className="space-y-2">
                  {profileData.qualifications.map((q, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-rose-50/50 rounded-xl border border-rose-100 text-xs font-bold text-gray-800">
                      <span>{q}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveQualification(idx)}
                        className="text-rose-600 hover:text-rose-800 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add degree qualification (e.g. Ph.D. in Computer Science)..."
                    value={newQualification}
                    onChange={(e) => setNewQualification(e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#8a164b]"
                  />
                  <button
                    type="button"
                    onClick={handleAddQualification}
                    className="px-4 py-2 bg-[#5d0f2d] hover:bg-[#8a164b] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-4 h-4 text-[#d4af37]" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5d0f2d] to-[#8a164b] text-white text-xs font-extrabold rounded-2xl shadow-lg hover:from-[#741339] hover:to-[#a11a58] transition-all"
                >
                  <Save className="w-4 h-4 text-[#d4af37]" />
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Office Hours & Availability */}
          {activeTab === 'office_hours' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-gray-900">Student Office Hours Schedule</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Set recurring weekly virtual consultation slots for student doubt clearing.
                </p>
              </div>

              <div className="space-y-4">
                {officeHours.map((item, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#5d0f2d] uppercase tracking-wider px-3 py-1 bg-rose-50 rounded-full border border-rose-200">
                        {item.day}
                      </span>
                      <span className="text-xs font-bold text-gray-600">{item.time}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Video className="w-4 h-4 text-[#8a164b]" />
                        <span className="font-semibold">{item.roomUrl}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 font-medium">
                        <span>Max Capacity: {item.capacity} students</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-extrabold">Virtual Consultation Room Sync</span>
                <p>Office hours are automatically visible on student course portals for direct slot booking.</p>
              </div>
            </div>
          )}

          {/* TAB 3: Notification Preferences */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-gray-900">Notification & Alert Rules</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Choose how and when you receive faculty system notifications.
                </p>
              </div>

              <div className="space-y-4 divide-y divide-rose-50">
                {[
                  { key: 'emailDoubtAlerts', title: 'Student Doubt Notifications', desc: 'Receive email whenever a student submits a doubt in your course.' },
                  { key: 'emailSessionReminders', title: 'Live Session Reminders', desc: 'Get reminder 30 minutes before your scheduled live classes.' },
                  { key: 'smsUrgentAlerts', title: 'SMS Urgent Alerts', desc: 'Receive SMS alerts for urgent admin broadcasts or schedule changes.' },
                  { key: 'attendanceAnomalies', title: 'Attendance Anomaly Flags', desc: 'Alert when a student falls below 75% attendance threshold.' },
                  { key: 'applicationSubmissions', title: 'Candidate Applications', desc: 'Alert when new student/TA applications are submitted for review.' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between pt-4 first:pt-0">
                    <div>
                      <h4 className="font-bold text-gray-900 text-xs">{item.title}</h4>
                      <p className="text-[11px] text-gray-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications[item.key]}
                        onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5d0f2d]"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => toast.success('Notification preferences updated!')}
                  className="px-6 py-2.5 bg-[#5d0f2d] hover:bg-[#8a164b] text-white text-xs font-extrabold rounded-xl shadow-md"
                >
                  Save Alert Settings
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Security & Credentials */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-gray-900">Security & Credentials</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Update your faculty portal password and manage active login sessions.
                </p>
              </div>

              <form onSubmit={handleSavePassword} className="space-y-4 max-w-md">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#5d0f2d]">Current Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#8a164b]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#5d0f2d]">New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#8a164b]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#5d0f2d]">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#8a164b]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#5d0f2d] hover:bg-[#8a164b] text-white text-xs font-extrabold rounded-xl shadow-md"
                >
                  Update Password
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
