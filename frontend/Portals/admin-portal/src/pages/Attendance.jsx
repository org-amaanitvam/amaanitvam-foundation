import { useState, useEffect } from 'react';
import { CalendarCheck, Search, Calendar, CheckCircle, XCircle, Clock, AlertCircle, X, Pencil, Users, UserCircle } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

export default function Attendance() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDepartmentHead, setIsDepartmentHead] = useState(false);
  
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDepartmentName, setSelectedDepartmentName] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(true);

  // Tabs and My Attendance
  const [activeTab, setActiveTab] = useState('my-attendance');
  const [myRecords, setMyRecords] = useState([]);
  const [myRecordsLoading, setMyRecordsLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [markForm, setMarkForm] = useState({
    status: 'present',
    title: 'Daily Attendance',
    remark: ''
  });

  useEffect(() => {
    fetchUsersAndDepartments();
    fetchMyAttendance();
  }, []);

  useEffect(() => {
    if (activeTab === 'manage-attendance') {
      if (selectedDepartment || (!isAdmin && users.length > 0)) {
        fetchAttendanceData();
      }
    }
  }, [selectedDepartment, selectedDate, isAdmin, activeTab]);

  const fetchUsersAndDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/attendance/users');
      if (res.data) {
        setIsAdmin(res.data.isAdmin);
        setIsDepartmentHead(res.data.isDepartmentHead || res.data.isAdmin);
        setUsers(res.data.users || []);
        
        if (res.data.isAdmin && res.data.departments) {
          setDepartments(res.data.departments);
          setSelectedDepartment('all');
          setSelectedDepartmentName('All Departments');
        } else if (res.data.departmentId) {
          setSelectedDepartment(res.data.departmentId);
          setSelectedDepartmentName(res.data.departmentName);
        }

        // If they have manage rights, default to manage tab
        if (res.data.isAdmin || res.data.isDepartmentHead) {
          setActiveTab('manage-attendance');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load user access rights');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAttendance = async () => {
    setMyRecordsLoading(true);
    try {
      const res = await api.get('/attendance/me');
      if (res.data && res.data.attendance) {
        setMyRecords(res.data.attendance);
      }
    } catch (err) {
      console.error('Failed to load personal attendance', err);
    } finally {
      setMyRecordsLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    if (!selectedDepartment) return;
    
    setLoading(true);
    try {
      if (isAdmin) {
        const usersRes = await api.get(`/attendance/users?departmentId=${selectedDepartment}`);
        setUsers(usersRes.data.users || []);
      }

      const attendanceRes = await api.get(`/attendance/department/${selectedDepartment}?date=${selectedDate}`);
      
      if (attendanceRes.data && attendanceRes.data.attendance) {
        const recordsMap = {};
        attendanceRes.data.attendance.forEach(record => {
          if (!record.user) return; // Skip corrupted records where user was deleted
          const userId = typeof record.user === 'object' ? record.user._id : record.user;
          recordsMap[userId] = record;
        });
        setAttendanceRecords(recordsMap);
      } else {
        setAttendanceRecords({});
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load attendance records');
      setAttendanceRecords({});
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    const existingRecord = attendanceRecords[user._id];
    
    setMarkForm({
      status: existingRecord ? existingRecord.status : 'present',
      title: existingRecord ? existingRecord.title : 'Daily Attendance',
      remark: existingRecord ? existingRecord.remark : ''
    });
    setShowModal(true);
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const targetDepartmentId = selectedDepartment === 'all' ? selectedUser.departmentId : selectedDepartment;
    
    if (!targetDepartmentId) {
      toast.error('Cannot mark attendance: User has no valid department assigned.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await api.post('/attendance/mark', {
        departmentId: targetDepartmentId,
        userId: selectedUser._id,
        date: selectedDate,
        status: markForm.status,
        title: markForm.title,
        remark: markForm.remark
      });

      if (res.data && res.data.attendance) {
        setAttendanceRecords(prev => ({
          ...prev,
          [selectedUser._id]: res.data.attendance
        }));
        toast.success('Attendance marked successfully!');
        setShowModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">Not Marked</span>;
    
    const styles = {
      present: 'bg-emerald-50 text-emerald-700',
      absent: 'bg-red-50 text-red-700',
      late: 'bg-amber-50 text-amber-700',
      'half-day': 'bg-blue-50 text-blue-700',
      leave: 'bg-purple-50 text-purple-700'
    };

    const icons = {
      present: <CheckCircle className="w-3 h-3 mr-1" />,
      absent: <XCircle className="w-3 h-3 mr-1" />,
      late: <Clock className="w-3 h-3 mr-1" />,
      'half-day': <AlertCircle className="w-3 h-3 mr-1" />,
      leave: <Calendar className="w-3 h-3 mr-1" />
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
        {icons[status]}
        {status.replace('-', ' ')}
      </span>
    );
  };

  const SkeletonRow = () => (
    <tr className="border-b border-slate-50">
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-[#56051a]" />
            Attendance
          </h1>
          <p className="text-sm text-slate-500 mt-1">View your attendance history and manage team records</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('my-attendance')}
          className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'my-attendance' 
              ? 'border-[#56051a] text-[#56051a]' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <UserCircle className="w-4 h-4" />
          My Attendance
        </button>
        
        {isDepartmentHead && (
          <button
            onClick={() => setActiveTab('manage-attendance')}
            className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'manage-attendance' 
                ? 'border-[#56051a] text-[#56051a]' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            Manage Attendance
          </button>
        )}
      </div>

      {/* MY ATTENDANCE TAB */}
      {activeTab === 'my-attendance' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {myRecordsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={`my-sk-${i}`} />)
                ) : myRecords.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12">
                      <CalendarCheck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">No attendance records found for you.</p>
                    </td>
                  </tr>
                ) : (
                  myRecords.map(record => (
                    <tr key={record._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-700">
                          {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(record.status)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-700">{record.title || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{record.remark || '—'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MANAGE ATTENDANCE TAB */}
      {activeTab === 'manage-attendance' && isDepartmentHead && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">Daily Roster</h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {isAdmin ? (
                <select
                  value={selectedDepartment}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setSelectedDepartment(selectedId);
                    if (selectedId === 'all') {
                      setSelectedDepartmentName('All Departments');
                    } else {
                      const dept = departments.find(d => d.departmentId === selectedId);
                      if (dept) setSelectedDepartmentName(dept.departmentName);
                    }
                  }}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#56051a]/20"
                >
                  <option value="" disabled>Select Department</option>
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.departmentId} value={dept.departmentId}>
                      {dept.departmentName}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700">
                  {selectedDepartmentName || 'Department'}
                </div>
              )}

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#56051a]/20"
                />
              </div>
            </div>
          </div>

          {/* Department Details Summary Card */}
          {isAdmin && selectedDepartment !== 'all' && departments.find(d => d.departmentId === selectedDepartment) && (
            <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">
                  Department Details: {selectedDepartmentName}
                </h3>
                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Department Head:</span>{' '}
                  {departments.find(d => d.departmentId === selectedDepartment)?.head?.name || 'Unassigned'}
                  {departments.find(d => d.departmentId === selectedDepartment)?.head?.email && (
                    <span className="text-slate-500 ml-1">({departments.find(d => d.departmentId === selectedDepartment)?.head?.email})</span>
                  )}
                </p>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-xs font-semibold text-slate-600">
                Total Members: {users.length}
              </div>
            </div>
          )}

          {/* Data Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Remarks</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p className="text-sm font-medium text-slate-500">No members found to manage.</p>
                      </td>
                    </tr>
                  ) : (
                    users.map(user => {
                      const record = attendanceRecords[user._id];
                      const currentDeptObj = departments.find(d => d.departmentId === user.departmentId);
                      const isHead = currentDeptObj && currentDeptObj.head && currentDeptObj.head._id === user._id;
                      
                      return (
                        <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-800">
                                {user.name}
                                {isHead && (
                                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
                                    Head
                                  </span>
                                )}
                              </span>
                              <span className="text-xs text-slate-500">{user.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#56051a]/10 text-[#56051a] truncate max-w-[120px]" title={user.departmentName}>
                              {user.departmentName || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 capitalize">
                              {isHead ? 'Dept Head' : user.role?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(record?.status)}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-600 truncate max-w-[150px] inline-block" title={record?.remark}>
                              {record?.remark || '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleOpenModal(user)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              {record ? 'Edit' : 'Mark'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Mark Attendance Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-[slideUp_0.25s_ease-out]">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Mark Attendance</h2>
                <p className="text-sm text-slate-500">{selectedUser.name} • {new Date(selectedDate).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 p-2 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleMarkAttendance} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['present', 'absent', 'late', 'half-day', 'leave'].map((status) => (
                    <label 
                      key={status}
                      className={`
                        cursor-pointer border rounded-xl p-3 text-center transition-all
                        ${markForm.status === status 
                          ? 'border-[#56051a] bg-[#56051a]/5 text-[#56051a] ring-1 ring-[#56051a]' 
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}
                      `}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={markForm.status === status}
                        onChange={(e) => setMarkForm({...markForm, status: e.target.value})}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium capitalize block mt-1">{status.replace('-', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={markForm.title}
                  onChange={(e) => setMarkForm({...markForm, title: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20"
                  placeholder="e.g. Daily Update"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Remarks (Optional)</label>
                <textarea
                  value={markForm.remark}
                  onChange={(e) => setMarkForm({...markForm, remark: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 resize-none"
                  placeholder="Add any additional notes..."
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#56051a] hover:bg-[#7a1e3a] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
