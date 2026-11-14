import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  FileText,
  Download,
  ExternalLink,
  Clock,
  Tag,
  GraduationCap,
} from 'lucide-react';

import { fetchPublishedResources } from '../../../config/api';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

const CATEGORIES = ['All', 'Academic', 'Skill', 'Career', 'Hobby'];

const getResourceType = (resource) => {
  const type =
    resource.resourceType ||
    resource.type ||
    resource.fileType ||
    resource.mimeType ||
    '';

  if (String(type).includes('pdf')) return 'PDF';
  if (String(type).includes('video')) return 'Video';
  if (String(type).includes('audio')) return 'Audio';
  if (String(type).includes('image')) return 'Image';
  if (String(type).includes('document')) return 'Document';

  return type
    ? String(type).split('/').pop()?.toUpperCase()
    : 'Resource';
};

const StudentResources = ({ searchQuery = '' }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    let cancelled = false;

    fetchPublishedResources()
      .then((data) => {
        if (!cancelled) {
          setResources(Array.isArray(data) ? data : data?.resources || []);
        }
      })
      .catch((error) => {
        console.error(
          '[student] Resources load error:',
          error?.message || error
        );
        if (!cancelled) setResources([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = String(searchQuery || '').trim().toLowerCase();

    return resources.filter((resource) => {
      const category = String(
        resource.category?.name ||
          resource.category ||
          ''
      ).toLowerCase();

      const title = String(resource.title || '').toLowerCase();
      const description = String(resource.description || '').toLowerCase();

      const subject = String(
        resource.subject?.name ||
          resource.subject ||
          ''
      ).toLowerCase();

      const domain = String(
        resource.domain?.name ||
          resource.domain ||
          ''
      ).toLowerCase();

      const matchesCategory =
        activeCategory === 'All' ||
        category === activeCategory.toLowerCase();

      const matchesQuery =
        !q ||
        title.includes(q) ||
        description.includes(q) ||
        subject.includes(q) ||
        domain.includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [resources, activeCategory, searchQuery]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <LoadingState label="Loading resources..." />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Learning Resources"
        subtitle="Explore study materials and resources from the Amaanitvam learning catalog"
        image="https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1600&q=70"
      />

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeCategory === category
                ? 'bg-[#5d0f2d] text-white shadow-md'
                : 'bg-white text-[#8a7468] border border-gray-200 hover:border-[#5d0f2d] hover:text-[#5d0f2d]'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Resources */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No resources found"
          message="Try a different search term or category."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((resource) => {
            const resourceType = getResourceType(resource);

            const subject =
              resource.subject?.name ||
              resource.subject ||
              'General';

            const domain =
              resource.domain?.name ||
              resource.domain ||
              '';

            const category =
              resource.category?.name ||
              resource.category ||
              'Resource';

            return (
              <Link
                key={resource._id}
                to={`/student/resources/${resource._id}`}
                className="card-premium group flex flex-col"
              >
                {/* Resource Header */}
                <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-xl bg-linear-to-tr from-[#5d0f2d] to-[#8a164b] text-white">
                  {resource.thumbnail ? (
                    <img
                      src={resource.thumbnail}
                      alt={resource.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <FileText className="h-10 w-10 opacity-80" />
                  )}

                  {/* Resource Type */}
                  <span className="absolute top-3 right-3 rounded-md bg-white/95 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#5d0f2d] shadow-sm">
                    {resourceType}
                  </span>
                </div>

                {/* Content */}
                <div className="mt-4 flex flex-col flex-1">
                  {/* Category + Access */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded bg-[#5d0f2d]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#8a164b]">
                      {category}
                    </span>

                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                      Free
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mt-2 font-(family-name:--font-heading) text-lg font-bold text-[#5d0f2d] leading-tight line-clamp-2">
                    {resource.title || 'Untitled Resource'}
                  </h3>

                  {/* Description */}
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500 font-medium">
                    {resource.description ||
                      'Learning material available for students.'}
                  </p>

                  {/* Metadata */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {subject}
                    </span>

                    {domain && (
                      <span className="inline-flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        {domain}
                      </span>
                    )}

                    {resource.duration && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {resource.duration}
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5d0f2d]">
                      <BookOpen className="w-4 h-4" />
                      View Resource
                    </span>

                    <ExternalLink className="w-4 h-4 text-gray-400 transition-all group-hover:text-[#5d0f2d] group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentResources;