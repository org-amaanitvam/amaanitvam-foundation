import { useState, useEffect } from 'react';
import { Users, Plus, X, Pencil } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { firebaseConfig } from '../config/firebase';
import api from '../config/api';
import toast from 'react-hot-toast';

const INITIAL_FORM = { name: '', email: '', phone: '', role: 'member', department: '', designation: '',
  domain: '' };

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

const [editMember, setEditMember] = useState({
  id: '',
  name: '',
  email: '',
  phone: '',
  role: '',
  department: '',
  designation: '',
  domain: ''
});
  const [newMember, setNewMember] = useState(INITIAL_FORM);
  const [departments, setDepartments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchMembers();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/public/departments');
      if (res.data && res.data.departments) {
        setDepartments(res.data.departments);
      }
    } catch (err) {
      console.error('Failed to load departments', err);
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/members?t=${new Date().getTime()}`);
      setMembers(res.data.members || res.data || []);
    } catch (err) {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) {
      toast.error('Name and email are required');
      return;
    }
    setSubmitting(true);
    try {
      // 1. Create User in Firebase silently using a secondary app instance
      // This prevents the admin from being automatically logged out
      const secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp');
      const secondaryAuth = getAuth(secondaryApp);
      
      const defaultPassword = 'Password123!'; // Default password for new members
      
      try {
        await createUserWithEmailAndPassword(secondaryAuth, newMember.email, defaultPassword);
      } catch (fbError) {
        if (fbError.code === 'auth/email-already-in-use') {
          // If already in Firebase, we just continue to add them to MongoDB
          console.log('User already exists in Firebase Auth, proceeding to sync with DB.');
        } else {
          throw new Error(fbError.message);
        }
      } finally {
        await signOut(secondaryAuth); // Clear the secondary session
      }

      // 2. Save user in our MongoDB Database
      await api.post('/admin/members', newMember);
      
      toast.success('Member added and synced with Firebase successfully! Default password is: Password123!');
      setShowAddModal(false);
      setNewMember(INITIAL_FORM);
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to add member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
  const previousMembers = members;

  setActionLoading(id);
  setMembers((currentMembers) =>
    currentMembers.map((member) =>
      (member._id === id || member.id === id)
        ? { ...member, role: newRole }
        : member
    )
  );

  try {
    const res = await api.put(`/admin/members/${id}/role`, { role: newRole });
    const updatedMember = res.data?.member;

    if (updatedMember) {
      setMembers((currentMembers) =>
        currentMembers.map((member) =>
          (member._id === id || member.id === id)
            ? { ...member, ...updatedMember }
            : member
        )
      );
    }

    toast.success('Role updated successfully!');
  } catch (err) {
    setMembers(previousMembers);
    toast.error(err.response?.data?.message || 'Failed to update role');
  } finally {
    setActionLoading(null);
  }
};

const handleDeactivate = async (id) => {
  const previousMembers = members;

  setActionLoading(id);
  setMembers((currentMembers) =>
    currentMembers.map((member) =>
      (member._id === id || member.id === id)
        ? { ...member, status: 'inactive' }
        : member
    )
  );

  try {
    const res = await api.put(`/admin/members/${id}/deactivate`);
    const updatedMember = res.data?.member;

    if (updatedMember) {
      setMembers((currentMembers) =>
        currentMembers.map((member) =>
          (member._id === id || member.id === id)
            ? { ...member, ...updatedMember }
            : member
        )
      );
    }

    toast.success('Member deactivated');
  } catch (err) {
    setMembers(previousMembers);
    toast.error(err.response?.data?.message || 'Failed to deactivate member');
  } finally {
    setActionLoading(null);
  }
};

const handleDelete = async (id) => {
  if (!window.confirm('Are you sure you want to delete this member? This action cannot be undone.')) return;

  const previousMembers = members;

  setActionLoading(id);
  setMembers((currentMembers) =>
    currentMembers.filter((member) => member._id !== id && member.id !== id)
  );

  try {
    await api.delete(`/admin/members/${id}`);
    toast.success('Member deleted successfully');
  } catch (err) {
    setMembers(previousMembers);
    toast.error(err.response?.data?.message || 'Failed to delete member');
  } finally {
    setActionLoading(null);
  }
};

const handleEditMember = async (e) => {
  e?.preventDefault?.();

  if (!editMember.name || !editMember.email) {
    toast.error("Name and Email are required");
    return;
  }

  setSubmitting(true);

  try {
    const detailsRes = await api.put(`/admin/members/${editMember.id}`, {
      name: editMember.name,
      phone: editMember.phone,
      department: editMember.department,
      designation: editMember.designation,
      domain: editMember.domain,
    });

    const roleRes = await api.put(`/admin/members/${editMember.id}/role`, {
      role: editMember.role,
    });

    const updatedMember = {
      ...(detailsRes.data?.member || {}),
      ...(roleRes.data?.member || {}),
      name: editMember.name,
      email: editMember.email,
      phone: editMember.phone,
      department: editMember.department,
      role: editMember.role,
    };

    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        (member._id === editMember.id || member.id === editMember.id)
          ? { ...member, ...updatedMember }
          : member
      )
    );

    toast.success("Member updated successfully!");
    setShowEditModal(false);
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to update member");
  } finally {
    setSubmitting(false);
  }
};

const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-indigo-50 text-indigo-700',
      member: 'bg-blue-50 text-blue-700',
      intern: 'bg-slate-100 text-slate-600',
      volunteer: 'bg-amber-50 text-amber-700',
    };
    const label = role?.replace('_', ' ');
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${styles[role] || 'bg-slate-100 text-slate-600'}`}>
        {label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-emerald-50 text-emerald-700',
      inactive: 'bg-slate-100 text-slate-500',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
        {status}
      </span>
    );
  };

  const SkeletonRow = () => (
    <tr className="border-b border-slate-50">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  );

  return (
    <div>
      {/* Topbar */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Member Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#56051a] hover:bg-[#7a1e3a] text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Joined On</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-medium">No members found</p>
                  </td>
                </tr>
              ) : (
                members.map((member) => {
                  const memberId = member._id || member.id;
                  return (
                    <tr key={memberId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{member.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{member.email}</td>
                      <td className="px-6 py-4 text-sm">{getRoleBadge(member.role || 'member')}</td>
                      <td className="px-6 py-4 text-sm">{getStatusBadge(member.status || 'active')}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">

                          <button
  onClick={() => {
    setEditMember({
      id: memberId,
      name: member.name || "",
      email: member.email || "",
      phone: member.phone || "",
      role: member.role || "member",
      department: member.department || "",
    });
    setShowEditModal(true);
  }}
  className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
>
  <Pencil className="w-3 h-3" />
  Edit
</button>
                          
                          {member.status !== 'inactive' ? (
                            <button
                              onClick={() => handleDeactivate(memberId)}
                              disabled={actionLoading === memberId}
                              className="text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDelete(memberId)}
                              disabled={actionLoading === memberId}
                              className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-[slideUp_0.25s_ease-out]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-slate-800">Add New Member</h2>
              <button
                onClick={() => { setShowAddModal(false); setNewMember(INITIAL_FORM); }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  required
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30"
                >
                  <option value="intern">Intern</option>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="volunteer">Volunteer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <select
                  value={newMember.department}
                  onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30"
                >
                  <option value="">Select a department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setNewMember(INITIAL_FORM); }}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#56051a] hover:bg-[#7a1e3a] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Member Modal */}
{showEditModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]">
    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-[slideUp_0.25s_ease-out]">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-slate-800">
          Edit Member
        </h2>

        <button
          onClick={() => setShowEditModal(false)}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleEditMember} className="space-y-4">

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            required
            value={editMember.name}
            onChange={(e) =>
              setEditMember({
                ...editMember,
                name: e.target.value,
              })
            }
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>

         <input
  type="email"
  required
  disabled
  value={editMember.email}
  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-100 text-slate-500 cursor-not-allowed"
/>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Phone
          </label>

          <input
            type="tel"
            value={editMember.phone}
            onChange={(e) =>
              setEditMember({
                ...editMember,
                phone: e.target.value,
              })
            }
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Role
          </label>

          <select
            value={editMember.role}
            onChange={(e) =>
              setEditMember({
                ...editMember,
                role: e.target.value,
              })
            }
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30"
          >
            <option value="intern">Intern</option>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
                            <option value="volunteer">Volunteer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Department
          </label>

          <select
            value={editMember.department}
            onChange={(e) =>
              setEditMember({
                ...editMember,
                department: e.target.value,
              })
            }
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30"
          >
            <option value="">Select a department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowEditModal(false)}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={handleEditMember}
            className="flex-1 bg-[#56051a] hover:bg-[#7a1e3a] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </form>
    </div>
  </div>
)}
    </div>
  );
}