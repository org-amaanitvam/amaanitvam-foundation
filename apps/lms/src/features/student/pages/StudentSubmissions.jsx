import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, CheckCircle2, Clock3, BookOpen } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const sampleAssignments = {
  'sample-1': {
    title: 'Community Impact Essay',
    course: 'Civic Leadership',
    due_date: '2026-09-15T10:00:00',
    description: 'Write a 500-word essay on a community project you would lead.',
    submission: {
      submitted_at: '2026-09-10T16:45:00',
      file: 'community-impact-essay-final.pdf',
      status: 'submitted',
      feedback: '',
    },
  },
};

const STATUS_META = {
  submitted: { label: 'Submitted', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  graded: { label: 'Graded', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
};

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function StudentSubmissions() {
  const { id } = useParams();
  const assignment = sampleAssignments[id];

  if (!assignment) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <PageHeader title="Submission" subtitle="Assignment ID: {id}" />
        <div className="card-premium flex flex-col items-center justify-center gap-3 py-20 text-center">
          <FileText className="w-10 h-10 text-[#c46b87]" aria-hidden="true" />
          <h2 className="text-2xl font-[family-name:var(--font-heading)] font-bold text-[#5d0f2d]">
            Assignment not found
          </h2>
          <p className="text-sm text-gray-500">
            This assignment isn't available, or it hasn't been published for submission.
          </p>
          <Link to="/student/assignments" className="btn-maroon">
            <ArrowLeft className="w-4 h-4" /> Back to Assignments
          </Link>
        </div>
      </div>
    );
  }

  const submission = assignment.submission;
  const status = STATUS_META[submission.status] || STATUS_META.pending;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <Link
        to="/student/assignments"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8a164b] hover:text-[#56051a] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Assignments
      </Link>

      <PageHeader
        title={assignment.title}
        subtitle={`${assignment.course} · Due ${formatDate(assignment.due_date)}`}
        image="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1600&q=70"
      />

      <div className="card-premium">
        <p className="text-sm text-gray-600 leading-relaxed">{assignment.description}</p>
      </div>

      <div className="card-premium overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center gap-2 bg-slate-50/60">
          <Upload className="w-4 h-4 text-[#8a164b]" />
          <h2 className="text-lg font-[family-name:var(--font-heading)] font-bold text-[#5d0f2d]">
            Your Submission
          </h2>
          <span className={`ml-auto rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${status.cls}`}>
            {status.label}
          </span>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-slate-50/60 px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="rounded-lg bg-[#5d0f2d]/5 p-2 shrink-0">
                <FileText className="h-5 w-5 text-[#8a164b]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#3d2b2b]">{submission.file}</p>
                <p className="text-xs text-gray-500 font-medium">
                  Submitted {formatDate(submission.submitted_at)}
                </p>
              </div>
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-xl bg-[#5d0f2d] px-4 py-2 text-xs font-bold text-white hover:bg-[#8a164b] transition-colors cursor-pointer">
              <Upload className="w-4 h-4" /> Upload New
            </button>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Status</p>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                <span className="text-sm font-medium text-gray-700">Submitted to faculty</span>
              </div>
              <div className="flex items-center gap-2">
                {submission.status === 'graded' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                ) : (
                  <Clock3 className="h-4 w-4 text-amber-500" aria-hidden="true" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {submission.status === 'graded' ? 'Graded by faculty' : 'Awaiting review'}
                </span>
              </div>
            </div>
          </div>

          {submission.status === 'graded' && !submission.feedback && (
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 px-4 py-3">
              <BookOpen className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              <p className="text-sm text-emerald-800">Grade and feedback will appear here.</p>
            </div>
          )}

          <p className="text-xs text-gray-500">
            Submission and grading are wired as a UI feature on the student portal. When your
            faculty publishes assignments, files you upload will be tracked here with review status.
          </p>
        </div>
      </div>
    </div>
  );
}