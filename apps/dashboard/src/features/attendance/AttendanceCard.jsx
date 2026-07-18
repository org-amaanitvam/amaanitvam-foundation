import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { UserCheck } from 'lucide-react';

export default function AttendanceCard() {
  const [loading, setLoading] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      // Fires the attendance data to your backend
      await api.post('/users/attendance', { status: 'Present', date: new Date() });
      toast.success('Attendance registered for today! ✅');
      setCheckedIn(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-premium p-6 flex items-center justify-between bg-gradient-to-r from-background to-gold/10">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gold/20 text-primary rounded-xl flex items-center justify-center shadow-sm">
          <UserCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold text-primary">Daily Attendance</h2>
          <p className="text-sm text-text-muted font-ui">Don't forget to mark your presence for today.</p>
        </div>
      </div>

      <button 
        onClick={handleCheckIn}
        disabled={loading || checkedIn}
        className={`py-2 px-6 font-ui font-bold rounded-lg transition-colors disabled:opacity-50 ${
          checkedIn 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-primary text-white hover:bg-primary-dark'
        }`}
      >
        {loading ? 'Registering...' : checkedIn ? 'Checked In' : 'Check In Now'}
      </button>
    </div>
  );
}