import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, CalendarDays, Clock, Download, FileText, FolderOpen, Languages, Loader2, Tag, User, CloudOff, ExternalLink } from "lucide-react";
import { fetchResourceById, incrementViewCountOfResource } from "../../config/api";
import { InfoItem } from "./InfoItem";
import { QuickInfo } from "./QuickInfo";

const ResourceDetails = () => {
  const { slug } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState("Academic");
  const [subject, setSubject] = useState("General");
  const [domain, setDomain] = useState("Programming");
  const [language, setLanguage] = useState("English");

  useEffect(() => {
    let cancelled = false;
    const getResource = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await fetchResourceById(slug);
        if (cancelled) return;
        const data = response?.data;
        if (!data) {
          setError(true);
          return;
        }
        setResource(data.resource);
        setDomain(data.domain.name);
        setCategory(data.category.name);
        setSubject(data.subject.name);
        setLanguage(resource?.language || "English");
      } catch (err) {
        console.error("Failed to fetch resource:", err);
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (slug) {
      getResource();
    }

    return () => {
      cancelled = true;
    };
  }, [slug]);

  //  Loading
  if (loading) {
    return (
      <div className="card-premium flex flex-col items-center justify-center gap-3 py-20">
        <Loader2
          className="h-10 w-10 animate-spin text-[#d8a15f]"
          aria-hidden="true"
        />
        <span className="font-ui text-sm font-semibold text-text-muted">
          Loading resource…
        </span>
      </div>
    );
  }

  //  Error
  if (error || !resource) {
    return (
      <div className="card-premium flex flex-col items-center justify-center gap-4 py-20 text-center">
        <CloudOff
          className="h-10 w-10 text-[#c46b87]"
          aria-hidden="true"
        />
        <h2 className="font-heading text-2xl font-bold text-primary">
          Resource not found
        </h2>
        <p className="max-w-md text-sm text-text-muted">
          This resource is unavailable or may have been removed.
        </p>
        <Link
          to="/resources"
          className="btn-maroon inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Resources
        </Link>
      </div>
    );
  }

  //  Helpers
  const formatDate = (date) => {
    if (!date) return "Not available";
    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Not available";
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes || minutes <= 0) return "Self-paced";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours && mins) return `${hours}h ${mins}m`;
    if (hours) return `${hours}h`;

    return `${mins}m`;
  };

  const getFileType = () => {
    if (resource.mime_type) {
      return resource.mime_type
        .split("/")
        .pop()
        .toUpperCase();
    }

    if (resource.file_type) {
      return resource.file_type.toUpperCase();
    }

    return "RESOURCE";
  };

  const handleView = async () => {
    await incrementViewCountOfResource(slug);
  }

  const fileUrl = resource.content_url || resource.file?.url;

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Back Navigation */}
      <Link
        to="/resources"
        className=" inline-flex items-center gap-1.5 text-sm font-ui font-bold text-[#8a164b] transition-colors hover:text-[#56051a]"
      >
        <ArrowLeft className="h-4 w-4" />
        Resource Catalog
      </Link>

      {/* Hero */}
      <div className=" overflow-hidden rounded-3xl bg-linear-to-r from-[#56051a] via-[#6f0b24] to-[#8b1730] p-8 text-white shadow-xl lg:p-10"
      >
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
          {/* Resource Information */}
          <div className="max-w-3xl">
            {/* Resource Type */}
            <span className=" inline-flex items-center gap-1.5 rounded-full border border-[#d8a15f]/30 bg-[#d8a15f]/15 px-3 py-1 text-[11px] font-ui font-bold uppercase tracking-widest text-[#ffd9a0]"
            >
              <FileText className="h-3 w-3" />
              {getFileType()}
            </span>

            {/* Title */}
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-white drop-shadow-lg lg:text-5xl"
            >
              {resource.title}
            </h1>

            {/* Description */}
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-pink-100">
              {resource.description || "No description provided."}
            </p>

            {/* Tags */}
            <div className="mt-6 flex flex-wrap gap-2">
              <span className=" inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/85"
              >
                <FolderOpen className="h-3.5 w-3.5 text-[#d8a15f]" />
                {category}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/85"
              >
                <BookOpen className="h-3.5 w-3.5 text-[#d8a15f]" />
                {subject}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/85"
              >
                <Tag className="h-3.5 w-3.5 text-[#d8a15f]" />
                {domain}
              </span>
            </div>
          </div>

          {/* Resource Icon */}
          <div className="hidden h-32 w-32 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-white/10 backdrop-blur-md lg:flex"
          >
            <FileText className="h-16 w-16 text-[#d8a15f]" />
          </div>
        </div>
      </div>

      {/* Resource Details */}
      <div className="grid grid-cols-1 gap-7 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-7 lg:col-span-2">
          {/* About Resource */}
          <div className="card-premium overflow-hidden p-0">
            <div className="flex items-center gap-2 border-b border-border-custom bg-slate-50/60 px-6 py-4"
            >
              <BookOpen className="h-4 w-4 text-[#d8a15f]" />
              <h2 className="font-heading text-xl font-bold text-primary">
                About this Resource
              </h2>
            </div>

            <div className="p-6">
              <p className="text-sm leading-7 text-text-muted">
                {resource.description ||
                  "This learning resource provides additional study material for students."}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="card-premium overflow-hidden p-0">
            <div className="flex items-center gap-2 border-b border-border-custom bg-slate-50/60 px-6 py-4"
            >
              <Tag className="h-4 w-4 text-[#d8a15f]" />
              <h2 className="font-heading text-xl font-bold text-primary">
                Resource Information
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-px bg-border-custom sm:grid-cols-2">
              <InfoItem
                icon={FolderOpen}
                label="Category"
                value={category}
              />
              <InfoItem
                icon={BookOpen}
                label="Subject"
                value={subject}
              />
              <InfoItem
                icon={Tag}
                label="Domain"
                value={domain}
              />
              <InfoItem
                icon={Languages}
                label="Language"
                value={language}
              />
              <InfoItem
                icon={CalendarDays}
                label="Created"
                value={formatDate(resource.createdAt || resource.created_at)}
              />
              <InfoItem
                icon={Clock}
                label="Updated"
                value={formatDate(resource.updatedAt || resource.updated_at)}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Access Card */}
          <div className="overflow-hidden rounded-2xl border border-border-custom bg-white shadow-sm"
          >
            <div className="bg-linear-to-br from-[#56051a] to-[#8a164b] p-6 text-white">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <FileText className="h-7 w-7 text-[#d8a15f]" />
              </div>
              <h3 className="mt-4 text-white font-heading text-xl font-bold">
                Study Resource
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Access this material and use it for your learning.
              </p>
            </div>

            <div className="p-5">
              {fileUrl ? (
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" onClick={handleView} className=" flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#8a164b] to-[#a51f55] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:from-[#a51f55] hover:to-[#8a164b] hover:shadow-[0_6px_20px_rgba(138,22,75,0.25)] active:scale-[0.98]"
                >
                  <Download className="h-4 w-4" />
                  Open Resource
                  <ExternalLink className="ml-auto h-4 w-4" />
                </a>
              ) : (
                <div className="rounded-xl bg-slate-50 p-4 text-center">
                  <FileText className="mx-auto h-6 w-6 text-slate-400" />
                  <p className="mt-2 text-xs text-text-muted">
                    Resource file is currently unavailable.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Information */}
          <div className="card-premium p-5">
            <h3 className="font-heading text-lg font-bold text-primary">
              Quick Information
            </h3>
            <div className="mt-4 space-y-4">
              <QuickInfo
                icon={FileText}
                label="File Type"
                value={getFileType()}
              />
              <QuickInfo
                icon={Languages}
                label="Language"
                value={language}
              />
              <QuickInfo
                icon={CalendarDays}
                label="Last Updated"
                value={formatDate(resource.updatedAt || resource.updated_at)}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ResourceDetails;