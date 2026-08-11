import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, CloudOff, Loader2, School } from 'lucide-react';
import { fetchCourseBySlug, fetchCourseModules, fetchModuleLessons } from '../../config/api';
import './CourseDetail.css';

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
      <div className="detail-state">
        <Loader2 size={40} className="spin" aria-hidden="true" />
        <span>Loading course…</span>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="detail-state">
        <CloudOff size={40} className="detail-state-icon" aria-hidden="true" />
        <h2>Course not found</h2>
        <p>This course is unavailable or hasn't been published yet.</p>
        <Link to="/" className="detail-btn">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="detail">
      <div className="container detail-container">
        <Link to="/" className="detail-back">
          <ArrowLeft size={16} /> Course Catalog
        </Link>

        <header className="detail-hero">
          <span className="catalog-label">{course.category || 'Course'}</span>
          <h1 className="detail-title">{course.title}</h1>
          <p className="detail-desc">{course.description || 'No description provided.'}</p>
          <div className="detail-stats">
            <span>{course.total_modules || 0} modules</span>
            <span>{course.total_lessons || 0} lessons</span>
            <span>{course.language || 'English'}</span>
          </div>
        </header>

        <section className="detail-modules" aria-label="Course content">
          {modules.length === 0 ? (
            <div className="detail-state">
              <School size={36} className="detail-state-icon" aria-hidden="true" />
              <p>Course content is being prepared.</p>
            </div>
          ) : (
            modules.map((mod, idx) => (
              <article key={mod._id} className="module-card">
                <div className="module-head">
                  <span className="module-index">{String(idx + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="module-title">{mod.title}</h3>
                    {mod.description && <p className="module-desc">{mod.description}</p>}
                  </div>
                </div>
                {mod.lessons && mod.lessons.length > 0 && (
                  <ul className="lesson-list">
                    {mod.lessons.map((lesson, i) => (
                      <li key={lesson._id} className="lesson-item">
                        <span className="lesson-num">{i + 1}</span>
                        <span className="lesson-name">{lesson.title}</span>
                        <ChevronRight size={16} className="lesson-chevron" aria-hidden="true" />
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
