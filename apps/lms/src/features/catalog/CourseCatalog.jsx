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
} from 'lucide-react';
import { fetchPublishedCourses } from '../../config/api';
import './CourseCatalog.css';

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
    <div className="catalog">
      {/* Hero */}
      <section className="catalog-hero">
        <div className="catalog-hero-inner">
          <span className="catalog-label">Learning Management System</span>
          <h1 className="catalog-title">Expand Your Mind, One Course At A Time</h1>
          <p className="catalog-desc">
            Explore curated learning pathways crafted by our educators — free to start, designed to empower.
          </p>
          <form
            className="catalog-search"
            onSubmit={(e) => e.preventDefault()}
            role="search"
            aria-label="Search courses"
          >
            <Search size={20} className="catalog-search-icon" aria-hidden="true" />
            <input
              type="search"
              className="catalog-search-input"
              placeholder="Search courses…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
            <button type="submit" className="catalog-search-btn">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Catalog */}
      <section className="section">
        <div className="container">
          <header className="catalog-header">
            <span className="catalog-label">Course Catalog</span>
            <h2 className="catalog-subtitle">Browse Available Courses</h2>
            <p className="catalog-subdesc">
              All courses are free and available to enrolled learners of the foundation.
            </p>
          </header>

          <div className="catalog-filters" role="group" aria-label="Filter courses by category">
            {[
              ['all', 'All'],
              ['academic', 'Academic'],
              ['skill', 'Skill'],
              ['career', 'Career'],
              ['hobby', 'Hobby'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`catalog-chip ${category === key ? 'is-active' : ''}`}
                onClick={() => setCategory(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {loading && (
            <div className="catalog-state" role="status">
              <School size={40} className="catalog-state-icon" aria-hidden="true" />
              <span>Loading courses…</span>
            </div>
          )}

          {error && !loading && (
            <div className="catalog-state">
              <CloudOff size={40} className="catalog-state-icon" aria-hidden="true" />
              <h3>Couldn't load courses</h3>
              <p>The LMS catalog is unavailable right now.</p>
              <button type="button" className="catalog-retry" onClick={load}>
                <RefreshCw size={16} /> Retry
              </button>
            </div>
          )}

          {!loading && !error && visible.length === 0 && (
            <div className="catalog-state">
              <Search size={40} className="catalog-state-icon" aria-hidden="true" />
              <h3>No courses found</h3>
              <p>Try a different category or search term.</p>
            </div>
          )}

          {!loading && !error && visible.length > 0 && (
            <div className="catalog-grid">
              {visible.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function CourseCard({ course }) {
  const category = CATEGORY_LABELS[course.category] || 'General';
  const isFree = course.is_free || !course.price || Number(course.price) <= 0;
  const priceLabel = isFree ? 'Free' : `₹${Number(course.price).toLocaleString('en-IN')}`;

  return (
    <article className="course-card">
      <div className="course-card-thumb">
        {course.thumbnail_url || course.thumbnail ? (
          <img
            src={course.thumbnail_url || course.thumbnail || ''}
            alt={course.title}
            loading="lazy"
          />
        ) : (
          <div className="course-card-thumb-fallback" aria-hidden="true">
            {category}
          </div>
        )}
        <span className={`course-card-badge ${isFree ? 'is-free' : ''}`}>{priceLabel}</span>
      </div>
      <div className="course-card-body">
        <h3 className="course-card-title">{course.title}</h3>
        <p className="course-card-desc">{course.description || 'No description provided.'}</p>
        <div className="course-card-meta">
          <span>
            <Tags size={14} aria-hidden="true" /> {category}
          </span>
          <span>
            <BookOpen size={14} aria-hidden="true" /> {course.total_modules || 0} modules
          </span>
          <span>
            <SquarePlay size={14} aria-hidden="true" /> {course.total_lessons || 0} lessons
          </span>
          <span>
            <Clock size={14} aria-hidden="true" /> {formatMinutes(course.total_duration_min)}
          </span>
        </div>
        <div className="course-card-footer">
          <span className="course-card-language">
            <Languages size={14} aria-hidden="true" /> {course.language || 'English'}
          </span>
          <Link to={`/course/${encodeURIComponent(course.slug || course.id)}`} className="course-card-btn">
            View Course <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}