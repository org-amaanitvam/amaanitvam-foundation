import { Link } from 'react-router-dom';
import { FileCheck, Upload, CalendarDays, BookOpen, Eye } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

const sampleAssignments = [
  {
    _id: 'sample-1',
    title: 'Community Impact Essay',
    course: 'Civic Leadership',
    due_date: '2026-09-15T10:00:00',
    status: 'pending',
    description: 'Write a 500-word essay on a community project you would lead.',
  },
  {
    _id: 'sample-2',
    title: 'Volunteer Hours Log',
    course: 'Social Responsibility',
    due_date: '2026-09-30T17:00:00',
    status: 'pending',
    description: 'Log at least 10 hours of community service with supervisor sign-off.',
  },
];

const formatDue = (value) => {
  if (!value) return 'No due date';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function StudentAssignments() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Assignments"
        subtitle="Track submissions, deadlines, and graded work for your courses"
        image="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1600&q=70"
      />

      <div className="space-y-4">
        {sampleAssignments.length === 0 ? (
          <EmptyState
            title="No assignments yet"
            message="Assignments shared by your faculty will appear here."
          />
        ) : (
          sampleAssignments.map((assignment) => (
            <div key={assignment._id} className="card-premium">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="rounded-xl bg-[#5d0f2d]/5 p-3 shrink-0">
                    <FileCheck className="h-6 w-6 text-[#8a164b]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#5d0f2d]">
                      {assignment.title}
                    </h3>
                    <p className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                      <BookOpen className="w-3.5 h-3.5" /> {assignment.course}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-700 border border-amber-200">
                    <CalendarDays className="w-3.5 h-3.5" /> Due {formatDue(assignment.due_date)}
                  </span>
                  <Link
                    to={`/student/assignments/${assignment._id}/submissions`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#5d0f2d] px-3 py-2 text-xs font-bold text-[#5d0f2d] hover:bg-[#5d0f2d] hover:text-white transition-colors"
                  >
                    <Eye className="w-4 h-4" /> View Submission
                  </Link>
                  <button className="btn-maroon text-xs py-2 px-3" type="button">
                    <Upload className="w-4 h-4" /> Submit
                  </button>
                </div>
              </div>
              {assignment.description && (
                <p className="mt-3 text-sm text-gray-500 font-medium">
                  {assignment.description}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      <p className="rounded-xl border border-dashed border-gray-300 bg-white/60 px-5 py-4 text-xs text-gray-500">
        Assignment submission and grading is wired as a UI feature. When your faculty
        publishes assignments on the portal, they will appear here with submit and
        submission-status actions.
      </p>
    </div>
  );
}