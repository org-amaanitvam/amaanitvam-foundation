import { useEffect, useState } from 'react';
import { CalendarCheck, ClipboardList, Eye, Loader2, Save, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'half-day', label: 'Half day' },
  { value: 'leave', label: 'Leave' },
];

const statusClasses = {
  present: 'bg-emerald-100 text-emerald-700',
  absent: 'bg-rose-100 text-rose-700',
  late: 'bg-amber-100 text-amber-700',
  'half-day': 'bg-sky-100 text-sky-700',
  leave: 'bg-violet-100 text-violet-700',
};

export default function AttendancePage() {
  const { userProfile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('view');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [myAttendance, setMyAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingUserId, setSavingUserId] = useState(null);
  const [drafts, setDrafts] = useState({});

  const [isAdmin, setIsAdmin] = useState(false);
  const [isDepartmentHead, setIsDepartmentHead] = useState(false);
  
  // Wait until we fetch API rights to determine if they can register
  const [rightsLoaded, setRightsLoaded] = useState(false);
  const canRegister = isAdmin || isDepartmentHead;
  const isViewerOnly = rightsLoaded && !canRegister;

  useEffect(() => {
    if (authLoading || !userProfile) return;
    loadDepartmentOptions();
  }, [authLoading, userProfile]);

  useEffect(() => {
    if (!rightsLoaded) return;
    
    if (isViewerOnly) {
      setActiveTab('view');
      loadMyAttendance();
      return;
    }

    if (activeTab === 'view') {
      loadDepartmentAttendance(selectedDepartmentId, selectedDate);
    }

    if (activeTab === 'register') {
      if (!selectedDepartmentId) return;
      loadDepartmentUsers(selectedDepartmentId);
    }
  }, [selectedDepartmentId, activeTab, selectedDate, isViewerOnly, rightsLoaded]);

  const loadDepartmentOptions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/attendance/users');
      
      setIsAdmin(data.isAdmin);
      setIsDepartmentHead(data.isDepartmentHead || data.isAdmin);
      
      if (data.isAdmin) {
        const options = [
          { departmentId: 'all', departmentName: 'All Departments' },
          ...(data.departments || []),
        ];
        setDepartmentOptions(options);
        setSelectedDepartmentId('all');
      } else if (data.isDepartmentHead) {
        const options = [{ departmentId: data.departmentId, departmentName: data.departmentName }];
        setDepartmentOptions(options);
        setSelectedDepartmentId(data.departmentId || '');
      }

      if (data.users?.length) {
        setUsers(data.users);
      }
      setRightsLoaded(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load attendance data');
      setRightsLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartmentAttendance = async (departmentId, date) => {
    if (!departmentId) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/attendance/department/${departmentId}`, { params: { date } });
      setAttendanceRecords(data.attendance || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartmentUsers = async (departmentId) => {
    if (!departmentId) return;

    try {
      setLoading(true);
      const { data } = await api.get('/attendance/users', { params: { departmentId } });
      setUsers(data.users || []);
      const nextDrafts = {};
      (data.users || []).forEach((user) => {
        nextDrafts[user._id] = 'present';
      });
      setDrafts(nextDrafts);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadMyAttendance = async () => {
    try {
      setLoading(true);
      // Fetch ALL records — no date param. Client filters for display.
      const { data } = await api.get('/attendance/me');
      setMyAttendance(data.attendance || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load your attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAttendance = async (userItem) => {
    try {
      const targetDepartmentId = userItem.departmentId || (selectedDepartmentId !== 'all' ? selectedDepartmentId : null);
      if (!targetDepartmentId) {
        toast.error('Cannot mark attendance: User has no valid department assigned.');
        return;
      }
      setSavingUserId(userItem._id);
      const status = drafts[userItem._id] || 'present';
      await api.post('/attendance/mark', {
        departmentId: targetDepartmentId,
        userId: userItem._id,
        date: selectedDate,
        status,
        title: 'Attendance Register',
        remark: '',
      });
      toast.success(`${userItem.name || userItem.email} marked`);
      loadDepartmentAttendance(selectedDepartmentId, selectedDate);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save attendance');
    } finally {
      setSavingUserId(null);
    }
  };

  const handleDepartmentChange = (value) => {
    setSelectedDepartmentId(value);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Attendance</h1>
            <p className="mt-1 text-sm text-slate-500">
              View attendance records or register attendance for your department.
            </p>
          </div>
          {canRegister && (
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                onClick={() => setActiveTab('view')}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${activeTab === 'view' ? 'bg-[#56051a] text-white' : 'text-slate-600'}`}
              >
                <Eye className="mr-1 inline h-4 w-4" />
                View Attendance
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${activeTab === 'register' ? 'bg-[#56051a] text-white' : 'text-slate-600'}`}
              >
                <ClipboardList className="mr-1 inline h-4 w-4" />
                Register Attendance
              </button>
            </div>
          )}
          {isViewerOnly && (
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600">
              Viewing only your attendance
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <label className="flex flex-col text-sm font-medium text-slate-600">
              Date
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-1 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#56051a]"
              />
            </label>

            {!isViewerOnly && (
              <label className="flex flex-col text-sm font-medium text-slate-600">
                Department
                <select
                  value={selectedDepartmentId}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="mt-1 min-w-[220px] rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#56051a]"
                >
                  {departmentOptions.length === 0 ? (
                    <option value="">No department available</option>
                  ) : (
                    departmentOptions.map((dept) => (
                      <option key={dept.departmentId} value={dept.departmentId}>
                        {dept.departmentName}
                      </option>
                    ))
                  )}
                </select>
              </label>
            )}
          </div>

          <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {canRegister
              ? 'Admins and department heads can register attendance for their team.'
              : 'You can only view your own attendance records.'}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading attendance...
        </div>
      ) : activeTab === 'register' && canRegister ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-[#56051a]" />
            <h2 className="text-lg font-semibold text-slate-800">Register attendance</h2>
          </div>

          {users.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              No users are available for this department today.
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((userItem) => (
                <div key={userItem._id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-slate-800">{userItem.name || userItem.email}</p>
                    <p className="text-sm text-slate-500">{userItem.email} • {userItem.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={drafts[userItem._id] || 'present'}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [userItem._id]: e.target.value }))}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#56051a]"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleSaveAttendance(userItem)}
                      disabled={savingUserId === userItem._id}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#56051a] px-3 py-2 text-sm font-semibold text-white hover:bg-[#7a0622] disabled:opacity-70"
                    >
                      {savingUserId === userItem._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-[#56051a]" />
            <h2 className="text-lg font-semibold text-slate-800">
              {canRegister ? 'Attendance summary' : 'Your attendance'}
            </h2>
          </div>

          {canRegister ? (
            attendanceRecords.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                No attendance records found for this department and date.
              </div>
            ) : (
              <div className="space-y-3">
                {attendanceRecords.map((record) => (
                  <div key={record._id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-slate-800">{record.user?.name || record.user?.email || 'Unknown user'}</p>
                      <p className="text-sm text-slate-500">{record.user?.email} • {record.user?.role}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${statusClasses[record.status] || 'bg-slate-100 text-slate-700'}`}>
                        {record.status}
                      </span>
                      <span className="text-sm text-slate-500">Marked by {record.markedBy?.name || 'admin'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (() => {
            const filtered = selectedDate
              ? myAttendance.filter((r) => new Date(r.date).toISOString().slice(0, 10) === selectedDate)
              : myAttendance;
            return filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                {selectedDate ? `No attendance record found for ${new Date(selectedDate).toLocaleDateString()}.` : 'No attendance records found for your account.'}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((record) => (
                  <div key={record._id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-slate-800">{record.department?.departmentName || 'Department'}</p>
                      <p className="text-sm text-slate-500">{new Date(record.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${statusClasses[record.status] || 'bg-slate-100 text-slate-700'}`}>
                      {record.status}
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
