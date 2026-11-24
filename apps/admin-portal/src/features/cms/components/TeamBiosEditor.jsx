import { useMemo } from 'react';
import { Users, Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';

const AVATARS = [
  { value: 'a', label: 'Maroon' },
  { value: 'b', label: 'Gold' },
  { value: 'c', label: 'Teal' },
  { value: 'd', label: 'Plum' },
];

const emptyMember = (order) => ({
  name: '',
  role: '',
  email: '',
  bio: '',
  group: 1,
  avatar: AVATARS[order % AVATARS.length].value,
  order,
  visible: true,
});

export default function TeamBiosEditor({ team, onChange }) {
  const members = useMemo(
    () => (Array.isArray(team?.members) ? team.members : []),
    [team],
  );

  const setMembers = (next) =>
    onChange({
      ...team,
      members: next.map((member, index) => ({ ...member, order: index })),
    });

  const updateMember = (index, patch) =>
    setMembers(members.map((m, i) => (i === index ? { ...m, ...patch } : m)));

  const removeMember = (index) =>
    setMembers(members.filter((_, i) => i !== index));

  const moveMember = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= members.length) return;
    const next = [...members];
    [next[index], next[target]] = [next[target], next[index]];
    setMembers(next);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-slate-400" />
          <div>
            <h2 className="font-semibold text-slate-800">Team Bios</h2>
            <p className="text-xs text-slate-500">
              Shown in the &ldquo;Our Team&rdquo; section on the public About page
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMembers([...members, emptyMember(members.length)])}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#56051a] bg-[#56051a]/5 hover:bg-[#56051a]/10 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add member
        </button>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Section Heading</label>
            <input
              type="text"
              value={team?.heading || ''}
              onChange={(e) => onChange({ ...team, heading: e.target.value })}
              placeholder="Leadership Team"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Section Subheading</label>
            <input
              type="text"
              value={team?.subheading || ''}
              onChange={(e) => onChange({ ...team, subheading: e.target.value })}
              placeholder="The dedicated individuals driving our mission forward."
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20"
            />
          </div>
        </div>

        {members.length === 0 && (
          <p className="text-sm text-slate-500 border border-dashed border-slate-200 rounded-xl p-6 text-center">
            No team members yet. Click &ldquo;Add member&rdquo; to create the first bio.
          </p>
        )}

        <div className="space-y-4">
          {members.map((member, index) => (
            <div
              key={index}
              className={`rounded-xl border p-4 space-y-4 transition-colors ${
                member.visible === false
                  ? 'border-slate-200 bg-slate-50 opacity-70'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Member {index + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button type="button" title="Move up" onClick={() => moveMember(index, -1)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button type="button" title="Move down" onClick={() => moveMember(index, 1)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title={member.visible === false ? 'Show on website' : 'Hide from website'}
                    onClick={() => updateMember(index, { visible: member.visible === false })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    {member.visible === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button type="button" title="Remove" onClick={() => removeMember(index)}
                    className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
                  <input
                    type="text"
                    value={member.name || ''}
                    onChange={(e) => updateMember(index, { name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Role / Designation</label>
                  <input
                    type="text"
                    value={member.role || ''}
                    onChange={(e) => updateMember(index, { role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Email (optional)</label>
                  <input
                    type="email"
                    value={member.email || ''}
                    onChange={(e) => updateMember(index, { email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Row</label>
                    <select
                      value={Number(member.group) === 2 ? 2 : 1}
                      onChange={(e) => updateMember(index, { group: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#56051a]/20"
                    >
                      <option value={1}>Row 1 &mdash; Leadership</option>
                      <option value={2}>Row 2 &mdash; Department heads</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Avatar colour</label>
                    <select
                      value={member.avatar || 'a'}
                      onChange={(e) => updateMember(index, { avatar: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#56051a]/20"
                    >
                      {AVATARS.map((a) => (
                        <option key={a.value} value={a.value}>{a.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Short bio (optional)</label>
                <textarea
                  rows={2}
                  value={member.bio || ''}
                  onChange={(e) => updateMember(index, { bio: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
