import { UserCheck, Download, Clock3, CheckCircle2, XCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const sampleApplications = [
  {
    _id: 'app-1',
    type: 'Course Registration',
    entity: 'Civic Leadership',
    submitted_at: '2026-07-28T09:00:00',
    status: 'approved',
    note: 'Your registration has been approved.',
  },
  {
    _id: 'app-2',
    type: 'Internship Program',
    entity: 'Community Outreach Intern',
    submitted_at: '2026-07-15T14:30:00',
    status: 'pending',
    note: 'Your application is under review.',
  },
];

const STATUS_STYLES = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function StudentApplications() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="My Applications"
        subtitle="Track course registrations, internships, and program applications you have submitted"
        image="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=70"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-premium flex items-center gap-4">
          <div className="rounded-xl bg-[#5d0f2d]/5 p-3">
            <UserCheck className="h-6 w-6 text-[#8a164b]" />
          </div>
          <div>
            <p className="text-3xl font-[family-name:var(--font-heading)] font-bold text-[#5d0f2d]">
              {sampleApplications.length}
            </p>
            <p className="text-xs font-semibold text-gray-400">Total Applications</p>
          </div>
        </div>
        <div className="card-premium flex items-center gap-4">
          <div className="rounded-xl bg-[#5d0f2d]/5 p-3">
            <Clock3 className="h-6 w-6 text-[#8a164b]" />
          </div>
          <div>
            <p className="text-3xl font-[family-name:var(--font-heading)] font-bold text-[#5d0f2d]">
              {sampleApplications.filter((a) => a.status === 'pending').length}
            </p>
            <p className="text-xs font-semibold text-gray-400">Under Review</p>
          </div>
        </div>
        <div className="card-premium flex items-center gap-4">
          <div className="rounded-xl bg-[#5d0f2d]/5 p-3">
            <CheckCircle2 className="h-6 w-6 text-[#8a164b]" />
          </div>
          <div>
            <p className="text-3xl font-[family-name:var(--font-heading)] font-bold text-[#5d0f2d]">
              {sampleApplications.filter((a) => a.status === 'approved').length}
            </p>
            <p className="text-xs font-semibold text-gray-400">Approved</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sampleApplications.map((application) => (
          <div key={application._id} className="card-premium">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4 min-w-0">
                <div className="rounded-xl bg-[#5d0f2d]/5 p-3 shrink-0">
                  <UserCheck className="h-6 w-6 text-[#8a164b]" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#5d0f2d]">
                    {application.entity}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    {application.type} · Submitted {formatDate(application.submitted_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[application.status] || 'bg-gray-100 text-gray-600'}`}>
                  {application.status}
                </span>
                <button className="inline-flex items-center gap-1.5 rounded-xl border border-[#5d0f2d] px-4 py-2 text-xs font-bold text-[#5d0f2d] hover:bg-[#5d0f2d] hover:text-white transition-colors cursor-pointer">
                  <Download className="w-4 h-4" /> Receipt
                </button>
              </div>
            </div>
            {application.note && (
              <p className="mt-3 text-sm text-gray-500 font-medium">{application.note}</p>
            )}
          </div>
        ))}
      </div>

      <p className="rounded-xl border border-dashed border-gray-300 bg-white/60 px-5 py-4 text-xs text-gray-500">
        Your course registrations and program applications are tracked here. Submissions you
        make through the foundation's application forms will appear automatically once the
        application workflow is connected to the portal.
      </p>
    </div>
  );
}