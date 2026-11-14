import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, Clock, ListTree, Languages } from 'lucide-react';
import { fetchPublishedCourses } from '../../../config/api';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

const CATEGORIES = ['All', 'Academic', 'Skill', 'Career', 'Hobby'];

export default function StudentCourses({ searchQuery = '' }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    let cancelled = false;
    fetchPublishedCourses()
      .then((data) => {
        if (!cancelled) setCourses(data);
      })
      .catch((error) => console.error('[student] Courses load error:', error?.message || error))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = String(searchQuery || '').trim().toLowerCase();
    return courses.filter((c) => {
      const matchesCategory =
        activeCategory === 'All' ||
        String(c.category || '').toLowerCase() === activeCategory.toLowerCase();
      const matchesQuery =
        !q ||
        String(c.title || '').toLowerCase().includes(q) ||
        String(c.description || '').toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [courses, activeCategory, searchQuery]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <LoadingState label="Loading courses..." />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="My Courses"
        subtitle="Courses available in the Amaanitvam learning catalog"
        image="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1600&q=70"
      />

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeCategory === category
              ? 'bg-[#5d0f2d] text-white shadow-md'
              : 'bg-white text-[#8a7468] border border-gray-200 hover:border-[#5d0f2d] hover:text-[#5d0f2d]'
              }`}
          >
            {category}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No courses found" message="Try a different search term or category." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <Link
              key={course._id}
              to={`/student/courses/${course._id}`}
              className="card-premium group flex flex-col"
            >
              <div className="flex h-28 items-center justify-center rounded-xl bg-linear-to-tr from-[#5d0f2d] to-[#8a164b] text-white">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-full w-full object-cover rounded-xl"
                  />
                ) : (
                  <BookOpen className="h-10 w-10 opacity-80" />
                )}
              </div>
              <div className="mt-4 flex flex-col flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[#5d0f2d]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#8a164b]">
                    {course.category || 'Course'}
                  </span>
                  {course.price ? (
                    <span className="text-xs font-bold text-emerald-700">
                      ₹{course.price}
                    </span>
                  ) : (
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                      Free
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-(family-name:--font-heading) text-lg font-bold text-[#5d0f2d] leading-tight">
                  {course.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500 font-medium">
                  {course.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                  <span className="inline-flex items-center gap-1">
                    <ListTree className="w-3.5 h-3.5" /> {course.moduleCount || course.modules || 0} modules
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {course.duration || 'Self-paced'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Languages className="w-3.5 h-3.5" /> {course.language || 'English'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}