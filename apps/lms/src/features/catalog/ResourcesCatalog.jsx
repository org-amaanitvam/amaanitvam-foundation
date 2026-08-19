import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, Video, Image as ImageIcon, Presentation, Archive, Eye, Download, Languages, Tags, LibraryBig, CloudOff, RefreshCw, BookMarked, ArrowRight, File } from 'lucide-react';
import { fetchPublishedResources } from '../../config/api';


// RESOURCE FILTERS
const RESOURCE_FILTERS = [
  ['all', 'All'],
  ['pdf', 'PDF'],
  ['document', 'Document'],
  ['presentation', 'Presentation'],
  ['video', 'Video'],
  ['image', 'Image'],
  ['zip', 'Archive'],
];

// RESOURCE LABELS
const RESOURCE_LABELS = {
  pdf: 'PDF',
  doc: 'Document',
  docx: 'Document',
  document: 'Document',
  ppt: 'Presentation',
  pptx: 'Presentation',
  presentation: 'Presentation',
  video: 'Video',
  image: 'Image',
  zip: 'Archive',
};

// NORMALIZE RESOURCE TYPE
function getResourceType(type) {
  const value = String(type || '').toLowerCase();

  if (value === 'pdf') {
    return 'pdf';
  }

  if (['doc', 'docx', 'document'].includes(value)) {
    return 'document';
  }

  if (['ppt', 'pptx', 'presentation'].includes(value)) {
    return 'presentation';
  }

  if (value === 'video') {
    return 'video';
  }

  if (value === 'image') {
    return 'image';
  }

  if (value === 'zip') {
    return 'zip';
  }
  return 'other';
}


// RESOURCE LABEL
function getResourceLabel(type) {
  const normalized = getResourceType(type);
  return RESOURCE_LABELS[normalized] || 'Resource';
}


// RESOURCE ICON
function getResourceIcon(type) {
  const normalized = getResourceType(type);
  switch (normalized) {
    case 'pdf':
    case 'document':
      return FileText;

    case 'presentation':
      return Presentation;

    case 'video':
      return Video;

    case 'image':
      return ImageIcon;

    case 'zip':
      return Archive;

    default:
      return File;
  }
}

// FILE SIZE
function formatFileSize(bytes) {
  if (!bytes || Number(bytes) <= 0) {
    return '';
  }

  const size = Number(bytes);

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

// EXTRACT RESOURCES FROM API RESPONSE
function extractResources(response) {
  if (Array.isArray(response)) {
    return response;
  }
  if (Array.isArray(response?.data?.resources)) {
    return response.data.resources;
  }
  if (Array.isArray(response?.resources)) {
    return response.resources;
  }
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  return [];
}

// EXTRACT PAGINATION
function extractPagination(response) {
  return (
    response?.data?.pagination ||
    response?.pagination ||
    {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    }
  );
}

// MAIN COMPONENT
export default function ResourcesCatalog() {
  const [resources, setResources] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [resourceType, setResourceType] = useState('all');
  const [query, setQuery] = useState('');

  // LOAD RESOURCES
  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetchPublishedResources();
      const resourceList = extractResources(response);
      const paginationData = extractPagination(response);
      setResources(resourceList);
      setPagination(paginationData);
    } catch (err) {
      console.error('LMS resources load error:', err);
      setResources([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    load();
  }, []);

  // FILTER + SEARCH
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    return resources.filter((resource) => {
      const type = getResourceType(resource?.resource_type);

      const typeOk =
        resourceType === 'all' ||
        type === resourceType;

      const searchOk =
        !q ||
        String(resource?.title || '')
          .toLowerCase()
          .includes(q) ||

        String(resource?.description || '')
          .toLowerCase()
          .includes(q) ||

        String(resource?.language || '')
          .toLowerCase()
          .includes(q) ||

        String(resource?.category_name || '')
          .toLowerCase()
          .includes(q) ||

        String(resource?.subject_name || '')
          .toLowerCase()
          .includes(q) ||

        String(resource?.domain_name || '')
          .toLowerCase()
          .includes(q) ||

        (Array.isArray(resource?.tags)
          ? resource.tags.some((tag) =>
            String(tag)
              .toLowerCase()
              .includes(q)
          )
          : false) ||
        (Array.isArray(resource?.keywords)
          ? resource.keywords.some((keyword) =>
            String(keyword)
              .toLowerCase()
              .includes(q)
          )
          : false);
      return typeOk && searchOk;
    });
  }, [resources, resourceType, query]);

  // STATISTICS 
  const totalDownloads = resources.reduce(
    (sum, resource) =>
      sum + Number(resource?.download_count || 0),
    0
  );

  const totalViews = resources.reduce(
    (sum, resource) =>
      sum + Number(resource?.view_count || 0),
    0
  );

  const freeResources = resources.filter(
    (resource) => resource?.is_free !== false
  ).length;

  // RENDER
  return (
    <div className="space-y-7 animate-fade-in">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl text-white p-8 lg:p-10 shadow-xl">
        <img
          src="https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1800&q=70"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#56051a] via-[#6f0b24]/90 to-[#8b1730]/70" />

        <div className="relative flex flex-col lg:flex-row justify-between lg:items-center gap-8">
          {/* HERO CONTENT */}
          <div>
            <p className="uppercase tracking-[0.3em] text-[#d8a15f] text-xs font-bold">
              Digital Learning Library
            </p>
            <h1 className="mt-3 text-4xl lg:text-5xl font-extrabold text-white drop-shadow-lg">
              Learn Beyond The Classroom
            </h1>
            <p className="mt-4 text-lg text-pink-100 max-w-xl leading-relaxed">
              Explore curated notes, documents, videos and study materials
              created to support your learning journey.
            </p>


            {/* SEARCH */}
            <form
              className="mt-7"
              onSubmit={(e) => e.preventDefault()}
              role="search"
              aria-label="Search resources"
            >
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d8a15f]" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search resources…"
                  autoComplete="off"
                  className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/15 focus:bg-white/15 focus:border-[#d8a15f] focus:ring-1 focus:ring-[#d8a15f] backdrop-blur-md rounded-xl text-white placeholder-white/60 text-sm outline-none transition-all"
                />
              </div>
            </form>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 gap-5 shrink-0">
            {/* RESOURCES */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/15 hover:shadow-2xl">
              <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-[#d8a15f]/10 blur-2xl" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/70">
                    Resources
                  </p>
                  <h2 className="mt-3 text-5xl font-bold text-white">
                    {pagination?.total || resources.length}
                  </h2>
                  <div className="mt-4 flex items-center gap-2 text-sm text-[#d8a15f]">
                    <BookMarked className="h-4 w-4" />
                    <span>Available</span>
                  </div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15">
                  <LibraryBig className="h-7 w-7 text-[#d8a15f]" />
                </div>
              </div>
            </div>
            {/* FREE RESOURCES */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/15 hover:shadow-2xl">
              <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-[#d8a15f]/10 blur-2xl" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/70">
                    Free Resources
                  </p>
                  <h2 className="mt-3 text-5xl font-bold text-white">
                    {freeResources}
                  </h2>
                  <div className="mt-4 flex items-center gap-2 text-sm text-[#d8a15f]">
                    <FileText className="h-4 w-4" />
                    <span>For learners</span>
                  </div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15">
                  <FileText className="h-7 w-7 text-[#d8a15f]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LIBRARY HEADER + FILTERS */}
      <div className="card-premium overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-border-custom flex items-center gap-2 bg-slate-50/60">
          <LibraryBig className="w-4 h-4 text-[#d8a15f]" />
          <h2 className="font-heading text-xl font-bold text-primary">
            Resource Library
          </h2>
          <p className="ml-auto hidden sm:block text-sm text-text-muted">
            Study materials for enrolled learners.
          </p>
        </div>
        <div className="p-5">
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter resources by type"
          >
            {RESOURCE_FILTERS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setResourceType(key)}
                className={`px-4 py-2 text-xs font-ui font-bold uppercase tracking-wide rounded-full transition-all cursor-pointer ${resourceType === key
                    ? 'bg-[#56051a] text-white shadow-md'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
       {/* LOADING */}
      {loading && (
        <div className="card-premium flex flex-col items-center justify-center gap-3 py-16">
          <LibraryBig
            className="w-10 h-10 text-[#d8a15f]"
            aria-hidden="true"
          />
          <span className="text-sm text-text-muted font-ui font-semibold">
            Loading resources…
          </span>
        </div>
      )}

    {/* ERROR */}
      {error && !loading && (
        <div className="card-premium flex flex-col items-center justify-center gap-3 py-16 text-center">
          <CloudOff
            className="w-10 h-10 text-[#c46b87]"
            aria-hidden="true"
          />
          <h3 className="text-xl font-heading font-bold text-primary">
            Couldn't load resources
          </h3>
          <p className="text-sm text-text-muted">
            The digital library is unavailable right now.
          </p>
          <button
            type="button"
            className="btn-maroon"
            onClick={load}
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      {/* EMPTY */}
      {!loading &&
        !error &&
        visible.length === 0 && (
          <div className="card-premium flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Search
              className="w-10 h-10 text-[#d8a15f]"
            />
            <h3 className="text-xl font-heading font-bold text-primary">
              No resources found
            </h3>
            <p className="text-sm text-text-muted">
              Try a different resource type or search term.
            </p>
          </div>
        )}

      {/* RESOURCE GRID */}
      {!loading &&
        !error &&
        visible.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {visible.map((resource) => (
              <ResourceCard
                key={resource._id}
                resource={resource}
              />
            ))}
          </div>
        )}
    </div>
  );
}


// RESOURCE CARD
function ResourceCard({ resource }) {
  const type = getResourceType(resource?.resource_type);
  const label = getResourceLabel(resource?.resource_type);
  const Icon = getResourceIcon(resource?.resource_type);

  return (
    <article className="card-premium overflow-hidden p-0 group flex flex-col">
      {/* PREVIEW */}
      <div className="relative h-44 overflow-hidden bg-[#56051a]">
        {resource?.thumbnail_url ||
          resource?.thumbnail ? (
          <img
            src={resource.thumbnail_url || resource.thumbnail}
            alt={resource?.title || 'Resource'}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#7a1d44] to-[#4a0b23] text-[#d8a15f]">
            <Icon className="w-16 h-16 opacity-90 transition-transform duration-300 group-hover:scale-110" />
          </div>
        )}

        {/* TYPE */}
        <span className="absolute top-3 left-3 px-3 py-1 text-[10px] font-ui font-bold uppercase tracking-wider rounded-full shadow-lg bg-[#d8a15f] text-[#4a0b23]">
          {label}
        </span>
        {/* FREE */}
        {resource?.is_free !== false && (
          <span className="absolute top-3 right-3 px-3 py-1 text-[10px] font-ui font-bold uppercase tracking-wider rounded-full shadow-lg bg-white text-[#56051a]">
            Free
          </span>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-5 flex flex-col flex-1">
        {/* CATEGORY / GRADE */}
        <div className="flex flex-wrap items-center gap-2">
          {resource?.category_name && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#d8a15f]/15 text-[#8a164b] text-[10px] font-ui font-bold uppercase tracking-wider rounded-full">
              <Tags className="w-3 h-3" />
              {resource.category_name}
            </span>
          )}


          {resource?.grade_level && (
            <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-ui font-bold uppercase tracking-wider rounded-full">
              Grade {resource.grade_level}
            </span>
          )}
        </div>


        {/* TITLE */}
        <h3 className="mt-3 font-heading text-2xl font-bold text-primary leading-snug line-clamp-2">
          {resource?.title || 'Untitled Resource'}
        </h3>


        {/* DESCRIPTION */}
        <p className="mt-2 text-sm text-text-muted leading-relaxed line-clamp-2">
          {resource?.description || 'No description provided.'}
        </p>


        {/* METADATA */}
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-text-muted font-ui font-medium">
          {resource?.subject_name && (
            <span className="flex items-center gap-1.5">
              <BookMarked className="w-3.5 h-3.5 text-[#8a164b]" />
              {resource.subject_name}
            </span>
          )}

          {resource?.language && (
            <span className="flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-[#8a164b]" />
              {resource.language}
            </span>
          )}

          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#8a164b]" />
            {Number(resource?.view_count || 0)} views
          </span>

          <span className="flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-[#8a164b]" />
            {Number(resource?.download_count || 0)} downloads
          </span>
        </div>


        {/* FILE SIZE */}
        {resource?.file_size && (
          <p className="mt-3 text-xs text-text-muted">
            {formatFileSize(resource.file_size)}
          </p>
        )}

        {/* TAGS */}
        {Array.isArray(resource?.tags) &&
          resource.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {resource.tags
                .slice(0, 3)
                .map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-ui font-semibold rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
            </div>
          )}

        {/* VIEW RESOURCE */}
        <div className="pt-4 border-t border-border-custom mt-auto">
          <Link
            to={`/student/library/${resource?._id}`}
            className="btn-maroon w-full"
          >
            View Resource
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}