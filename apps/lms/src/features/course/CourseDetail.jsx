import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  CloudOff,
  Loader2,
  School,
  BookOpen,
  SquarePlay,
  Clock,
  Languages,
  Tags,
  ListChecks,
} from 'lucide-react';
import { fetchCourseBySlug, fetchCourseModules, fetchModuleLessons } from '../../config/api';

const CATEGORY_LABELS = {
  academic: 'Academic',
  skill: 'Skill',
  career: 'Career',
  hobby: 'Hobby',
};

function formatMinutes(min) {
  if (!min || min <= 0) return 'Self-paced';
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

export default function CourseDetail() {
  const { slug } = useParams();
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
        const found = await fetchCourseBySlug(slug);
        if (cancelled) return;
        if (!found) {
          setError(true);
          setLoading(false);
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
  }, [slug]);

  if (loading) {
    return (
      <div className="card-premium flex flex-col items-center justify-center gap-3 py-20">
        <Loader2 className="w-10 h-10 text-[#d8a15f] animate-spin" aria-hidden="true" />
        <span className="text-sm text-text-muted font-ui font-semibold">Loading course…</span>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="card-premium flex flex-col items-center justify-center gap-3 py-20 text-center">
        <CloudOff className="w-10 h-10 text-[#c46b87]" aria-hidden="true" />
        <h2 className="text-2xl font-heading font-bold text-primary">Course not found</h2>
        <p className="text-sm text-text-muted">This course is unavailable or hasn't been published yet.</p>
        <Link to="/" className="btn-maroon">
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
      </div>
    );
  }

  const category = CATEGORY_LABELS[course.category] || 'Course';

  return (
    <div className="space-y-7 animate-fade-in">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-ui font-bold text-[#8a164b] hover:text-[#56051a] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Course Catalog
      </Link>

      {/* Hero */}
      <div className="rounded-3xl overflow-hidden bg-linear-to-r from-[#56051a] via-[#6f0b24] to-[#8b1730] text-white p-8 lg:p-10 shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#d8a15f]/15 border border-[#d8a15f]/30 text-[#ffd9a0] text-[11px] font-ui font-bold uppercase tracking-widest rounded-full">
              <Tags className="w-3 h-3" /> {category}
            </span>
            <h1 className="mt-4 text-4xl lg:text-5xl font-extrabold text-white drop-shadow-lg leading-tight">
              {course.title}
            </h1>
            <p className="mt-4 text-lg text-pink-100 leading-relaxed">
              {course.description || 'No description provided.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 shrink-0">
            <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-5 text-center">
              <BookOpen className="w-5 h-5 mx-auto text-[#d8a15f]" />
              <p className="mt-2 text-3xl font-bold text-white">{course.total_modules || 0}</p>
              <p className="text-[11px] uppercase tracking-widest text-white/70 mt-1">Modules</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-5 text-center">
              <SquarePlay className="w-5 h-5 mx-auto text-[#d8a15f]" />
              <p className="mt-2 text-3xl font-bold text-white">{course.total_lessons || 0}</p>
              <p className="text-[11px] uppercase tracking-widest text-white/70 mt-1">Lessons</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-5 text-center">
              <Clock className="w-5 h-5 mx-auto text-[#d8a15f]" />
              <p className="mt-2 text-sm font-bold text-white">{formatMinutes(course.total_duration_min)}</p>
              <p className="text-[11px] uppercase tracking-widest text-white/70 mt-1">Duration</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-5 text-center">
              <Languages className="w-5 h-5 mx-auto text-[#d8a15f]" />
              <p className="mt-2 text-sm font-bold text-white">{course.language || 'English'}</p>
              <p className="text-[11px] uppercase tracking-widest text-white/70 mt-1">Language</p>
            </div>
          </div>
        </div>
      </div>

      {/* Syllabus */}
      <div className="card-premium overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-border-custom flex items-center gap-2 bg-slate-50/60">
          <ListChecks className="w-4 h-4 text-[#d8a15f]" />
          <h2 className="font-heading text-xl font-bold text-primary">Course Content</h2>
          <span className="ml-auto text-sm text-text-muted">{modules.length} modules</span>
        </div>

        <div className="p-5 space-y-5">
          {modules.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <School className="w-10 h-10 text-[#d8a15f]" aria-hidden="true" />
              <p className="text-sm text-text-muted">Course content is being prepared.</p>
            </div>
          ) : (
            modules.map((mod, idx) => (
              <article key={mod._id} className="rounded-2xl border border-border-custom bg-white overflow-hidden">
                <div className="flex items-start gap-4 p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#d8a15f] to-[#b98243] text-[#4a0b23] font-heading font-bold">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-primary">{mod.title}</h3>
                    {mod.description && (
                      <p className="mt-1 text-sm text-text-muted leading-relaxed">{mod.description}</p>
                    )}
                  </div>
                </div>

                {mod.lessons && mod.lessons.length > 0 && (
                  <ul className="border-t border-border-custom">
                    {mod.lessons.map((lesson, i) => (
                      <li
                        key={lesson._id}
                        className="flex items-center gap-3 px-5 py-3 text-sm border-b border-border-custom last:border-b-0 hover:bg-slate-50 transition-colors"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#56051a]/10 text-[11px] font-ui font-bold text-[#8a164b]">
                          {i + 1}
                        </span>
                        <span className="flex-1 text-[#3d2b2b]">{lesson.title}</span>
                        <ChevronRight className="w-4 h-4 text-slate-300" aria-hidden="true" />
                      </li>
                    ))}
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