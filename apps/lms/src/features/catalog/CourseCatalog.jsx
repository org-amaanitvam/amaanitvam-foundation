import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  SquarePlay,
  Clock,
  Languages,
  Tags,
  CloudOff,
  RefreshCw,
  School,
  ArrowRight,
  BookMarked,
} from 'lucide-react';
import { fetchPublishedCourses } from '../../config/api';

const CATEGORY_LABELS = {
  academic: 'Academic',
  skill: 'Skill',
  career: 'Career',
  hobby: 'Hobby',
};

const CATEGORY_FILTERS = [
  ['all', 'All'],
  ['academic', 'Academic'],
  ['skill', 'Skill'],
  ['career', 'Career'],
  ['hobby', 'Hobby'],
];

function formatMinutes(min) {
  if (!min || min <= 0) return 'Self-paced';
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchPublishedCourses();
      setCourses(data);
    } catch (err) {
      console.error('LMS catalog load error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((c) => {
      const catOk = category === 'all' || c.category === category;
      const searchOk =
        !q ||
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        (c.tags || []).some((t) => String(t).toLowerCase().includes(q));
      return catOk && searchOk;
    });
  }, [courses, category, query]);

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl text-white p-8 lg:p-10 shadow-xl">
        <img
          src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1800&q=70"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#56051a] via-[#6f0b24]/90 to-[#8b1730]/70" />
        <div className="relative flex flex-col lg:flex-row justify-between lg:items-center gap-8">
          <div>
            <p className="uppercase tracking-[0.3em] text-[#d8a15f] text-xs font-bold">
              Learning Management System
            </p>
            <h1 className="mt-3 text-4xl lg:text-5xl font-extrabold text-white drop-shadow-lg">
              Expand Your Mind, One Course At A Time
            </h1>
            <p className="mt-4 text-lg text-pink-100 max-w-xl leading-relaxed">
              Explore curated learning pathways crafted by our educators — free to start, designed to empower.
            </p>

            <form
              className="mt-7"
              onSubmit={(e) => e.preventDefault()}
              role="search"
              aria-label="Search courses"
            >
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d8a15f]" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search courses…"
                  autoComplete="off"
                  className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/15 focus:bg-white/15 focus:border-[#d8a15f] focus:ring-1 focus:ring-[#d8a15f] backdrop-blur-md rounded-xl text-white placeholder-white/60 text-sm outline-none transition-all"
                />
              </div>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-5 shrink-0">
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/15 hover:shadow-2xl">
              <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-[#d8a15f]/10 blur-2xl"></div>
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/70">Courses</p>
                  <h2 className="mt-3 text-5xl font-bold text-white">{courses.length}</h2>
                  <div className="mt-4 flex items-center gap-2 text-sm text-[#d8a15f]">
                    <BookMarked className="h-4 w-4" />
                    <span>Available</span>
                  </div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15">
                  <BookOpen className="h-7 w-7 text-[#d8a15f]" />
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/15 hover:shadow-2xl">
              <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-[#d8a15f]/10 blur-2xl"></div>
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/70">Total Lessons</p>
                  <h2 className="mt-3 text-5xl font-bold text-white">
                    {courses.reduce((sum, c) => sum + (c.total_lessons || 0), 0)}
                  </h2>
                  <div className="mt-4 flex items-center gap-2 text-sm text-[#d8a15f]">
                    <SquarePlay className="h-4 w-4" />
                    <span>Learner lessons</span>
                  </div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15">
                  <SquarePlay className="h-7 w-7 text-[#d8a15f]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog header + filters */}
      <div className="card-premium overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-border-custom flex items-center gap-2 bg-slate-50/60">
          <BookMarked className="w-4 h-4 text-[#d8a15f]" />
          <h2 className="font-heading text-xl font-bold text-primary">Course Catalog</h2>
          <p className="ml-auto hidden sm:block text-sm text-text-muted">
            All courses are free for enrolled learners.
          </p>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter courses by category">
            {CATEGORY_FILTERS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`px-4 py-2 text-xs font-ui font-bold uppercase tracking-wide rounded-full transition-all cursor-pointer ${
                  category === key
                    ? 'bg-[#56051a] text-white shadow-md'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
                onClick={() => setCategory(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="card-premium flex flex-col items-center justify-center gap-3 py-16">
          <School className="w-10 h-10 text-[#d8a15f]" aria-hidden="true" />
          <span className="text-sm text-text-muted font-ui font-semibold">Loading courses…</span>
        </div>
      )}

      {error && !loading && (
        <div className="card-premium flex flex-col items-center justify-center gap-3 py-16 text-center">
          <CloudOff className="w-10 h-10 text-[#c46b87]" aria-hidden="true" />
          <h3 className="text-xl font-heading font-bold text-primary">Couldn't load courses</h3>
          <p className="text-sm text-text-muted">The LMS catalog is unavailable right now.</p>
          <button type="button" className="btn-maroon" onClick={load}>
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="card-premium flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Search className="w-10 h-10 text-[#d8a15f]" aria-hidden="true" />
          <h3 className="text-xl font-heading font-bold text-primary">No courses found</h3>
          <p className="text-sm text-text-muted">Try a different category or search term.</p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && visible.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {visible.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course }) {
  const category = CATEGORY_LABELS[course.category] || 'General';
  const isFree = course.is_free || !course.price || Number(course.price) <= 0;
  const priceLabel = isFree ? 'Free' : `₹${Number(course.price).toLocaleString('en-IN')}`;

  return (
    <article className="card-premium overflow-hidden p-0 group flex flex-col">
      <div className="relative h-44 overflow-hidden bg-[#56051a]">
        {course.thumbnail_url || course.thumbnail ? (
          <img
            src={course.thumbnail_url || course.thumbnail || ''}
            alt={course.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#7a1d44] to-[#4a0b23] text-[#d8a15f] font-heading font-bold text-3xl uppercase tracking-widest">
            {category}
          </div>
        )}
        <span className={`absolute top-3 right-3 px-3 py-1 text-[10px] font-ui font-bold uppercase tracking-wider rounded-full shadow-lg ${
          isFree ? 'bg-[#d8a15f] text-[#4a0b23]' : 'bg-white text-[#56051a]'
        }`}>
          {priceLabel}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#d8a15f]/15 text-[#8a164b] text-[10px] font-ui font-bold uppercase tracking-wider rounded-full w-fit">
          <Tags className="w-3 h-3" /> {category}
        </span>
        <h3 className="mt-3 font-heading text-2xl font-bold text-primary leading-snug line-clamp-2">
          {course.title}
        </h3>
        <p className="mt-2 text-sm text-text-muted leading-relaxed line-clamp-2">
          {course.description || 'No description provided.'}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-text-muted font-ui font-medium">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#8a164b]" /> {course.total_modules || 0} modules
          </span>
          <span className="flex items-center gap-1.5">
            <SquarePlay className="w-3.5 h-3.5 text-[#8a164b]" /> {course.total_lessons || 0} lessons
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#8a164b]" /> {formatMinutes(course.total_duration_min)}
          </span>
          <span className="flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-[#8a164b]" /> {course.language || 'English'}
          </span>
        </div>

        <div className="mt-5 pt-4 border-t border-border-custom mt-auto">
          <Link to={`/course/${encodeURIComponent(course.slug || course.id)}`} className="btn-maroon w-full">
            View Course <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}