import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Loader2, School, Clock, Languages, ListChecks, ChevronRight, CheckCircle2 } from 'lucide-react';
import { fetchPublishedCourses, fetchCourseModules, fetchModuleLessons } from '../../../config/api';

const CATEGORY_LABELS = {
  academic: 'Academic',
  skill: 'Skill',
  career: 'Career',
  hobby: 'Hobby',
};

const formatMinutes = (min) => {
  if (!min || min <= 0) return 'Self-paced';
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
};

const STATUS_MAP = {
  not_started: { label: 'Not Started', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  in_progress: { label: 'In Progress', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  completed: { label: 'Completed', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

export default function StudentCourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);
      try {
        const courses = await fetchPublishedCourses();
        if (cancelled) return;
        const found = courses.find((c) => String(c._id) === String(courseId));
        if (!found) {
          setError(true);
          return;
        }
        setCourse(found);

        try {
          const mods = await fetchCourseModules(found._id);
          if (cancelled) return;
          const withLessons = await Promise.all(
            mods.map(async (m) => {
              try {
                const lessons = await fetchModuleLessons(found._id, m._id);
                return { ...m, lessons };
              } catch {
                return { ...m, lessons: [] };
              }
            }),
          );
          if (!cancelled) setModules(withLessons);
        } catch {
          if (!cancelled) setModules([]);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const progress = useMemo(() => {
    const lessons = modules.flatMap((m) => m.lessons || []);
    if (lessons.length === 0) return 0;
    return Math.round((lessons.filter((l) => l.is_completed).length / lessons.length) * 100);
  }, [modules]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="card-premium flex flex-col items-center justify-center gap-3 py-20">
          <Loader2 className="w-10 h-10 text-[#d8a15f] animate-spin" aria-hidden="true" />
          <span className="text-sm font-semibold text-gray-500">Loading course details...</span>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="card-premium flex flex-col items-center justify-center gap-3 py-20 text-center">
          <School className="w-10 h-10 text-[#c46b87]" aria-hidden="true" />
          <h2 className="text-2xl font-(family-name:--font-heading) font-bold text-[#5d0f2d]">Course not found</h2>
          <p className="text-sm text-gray-500">This course is unavailable or hasn't been published yet.</p>
          <Link to="/student/courses" className="btn-maroon">
            <ArrowLeft className="w-4 h-4" /> Back to My Courses
          </Link>
        </div>
      </div>
    );
  }

  const category = CATEGORY_LABELS[course.category] || 'Course';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <Link
        to="/student/courses"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8a164b] hover:text-[#56051a] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Courses
      </Link>

      {/* Hero */}
      <div className="rounded-3xl overflow-hidden bg-linear-to-r from-[#56051a] via-[#6f0b24] to-[#8b1730] text-white p-8 lg:p-10 shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#d8a15f]/15 border border-[#d8a15f]/30 text-[#ffd9a0] text-[11px] font-bold uppercase tracking-widest rounded-full">
              {category}
            </span>
            <h1 className="mt-4 text-3xl lg:text-4xl font-(family-name:--font-heading) font-bold text-white leading-tight">
              {course.title}
            </h1>
            <p className="mt-4 text-base text-pink-100 leading-relaxed">
              {course.description || 'No description provided.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 shrink-0">
            <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-5 text-center">
              <BookOpen className="w-5 h-5 mx-auto text-[#d8a15f]" />
              <p className="mt-2 text-3xl font-bold">{course.total_modules || 0}</p>
              <p className="text-[10px] uppercase tracking-widest text-white/70 mt-1">Modules</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-5 text-center">
              <ListChecks className="w-5 h-5 mx-auto text-[#d8a15f]" />
              <p className="mt-2 text-3xl font-bold">{course.total_lessons || 0}</p>
              <p className="text-[10px] uppercase tracking-widest text-white/70 mt-1">Lessons</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-5 text-center">
              <Clock className="w-5 h-5 mx-auto text-[#d8a15f]" />
              <p className="mt-2 text-sm font-bold">{formatMinutes(course.total_duration_min)}</p>
              <p className="text-[10px] uppercase tracking-widest text-white/70 mt-1">Duration</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-5 text-center">
              <Languages className="w-5 h-5 mx-auto text-[#d8a15f]" />
              <p className="mt-2 text-sm font-bold">{course.language || 'English'}</p>
              <p className="text-[10px] uppercase tracking-widest text-white/70 mt-1">Language</p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-black/20 p-5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-white/70 mb-2">
            <span>Course Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#d8a15f] to-[#f5c98a] transition-all duration-500"
              style={{ width: `${Math.max(progress, 2)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Syllabus */}
      <div className="card-premium overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 bg-slate-50/60">
          <ListChecks className="w-4 h-4 text-[#d8a15f]" />
          <h2 className="text-xl font-[family-name:var(--font-heading)] font-bold text-[#5d0f2d]">Course Content</h2>
          <span className="ml-auto text-sm text-gray-500">{modules.length} modules</span>
        </div>

        <div className="p-5 space-y-5">
          {modules.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <School className="w-10 h-10 text-[#d8a15f]" aria-hidden="true" />
              <p className="text-sm text-gray-500">Course content is being prepared.</p>
            </div>
          ) : (
            modules.map((mod, idx) => (
              <article key={mod._id} className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
                <div className="flex items-start gap-4 p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#d8a15f] to-[#b98243] text-[#4a0b23] font-[family-name:var(--font-heading)] font-bold">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-[family-name:var(--font-heading)] font-bold text-[#5d0f2d]">{mod.title}</h3>
                    {mod.description && (
                      <p className="mt-1 text-sm text-gray-500 leading-relaxed">{mod.description}</p>
                    )}
                  </div>
                </div>

                {mod.lessons && mod.lessons.length > 0 && (
                  <ul className="border-t border-gray-100">
                    {mod.lessons.map((lesson, i) => {
                      const status = lesson.is_completed
                        ? STATUS_MAP.completed
                        : STATUS_MAP.not_started;
                      return (
                        <li
                          key={lesson._id}
                          className="flex items-center gap-3 px-5 py-3 text-sm border-b border-gray-100 last:border-b-0 hover:bg-slate-50 transition-colors"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#56051a]/10 text-[11px] font-semibold text-[#8a164b]">
                            {i + 1}
                          </span>
                          <span className="flex-1 font-medium text-[#3d2b2b]">{lesson.title}</span>
                          {lesson.is_completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-300" aria-hidden="true" />
                          )}
                          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${status.cls}`}>
                            {status.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}