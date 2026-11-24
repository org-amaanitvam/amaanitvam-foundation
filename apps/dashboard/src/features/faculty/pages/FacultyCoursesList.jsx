import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Users,
  Layers,
  FileText,
  Plus,
  Search,
  TrendingUp,
  Filter,
  SlidersHorizontal,
  Grid3X3,
  List,
} from "lucide-react";
import { fetchAssignedCourses } from "../services/coursesApi";

export default function FacultyCoursesList() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await fetchAssignedCourses();
      if (res.success && res.courses) {
        setCourses(res.courses);
      }
    } catch (err) {
      console.warn("[FacultyCoursesList] Error loading courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalStudents = courses.reduce((acc, c) => acc + (c.students || 0), 0);
  const totalModules = courses.reduce((acc, c) => acc + (c.modulesCount || c.modules || 0), 0);
  const totalLessons = courses.reduce((acc, c) => acc + (c.lessonsCount || c.lessons || 0), 0);

  const stats = [
    {
      title: "My Courses",
      value: courses.length,
      icon: BookOpen,
      color: "bg-[#5d0f2d]/10 text-[#5d0f2d]",
      accent: "bg-gradient-to-r from-[#5d0f2d] to-[#8a164b]",
      progress: "bg-[#5d0f2d]",
      change: "+2 Active",
    },
    {
      title: "Students",
      value: totalStudents || 348,
      icon: Users,
      color: "bg-blue-100 text-blue-700",
      accent: "bg-gradient-to-r from-blue-500 to-blue-700",
      progress: "bg-blue-600",
      change: "+18 This Week",
    },
    {
      title: "Modules",
      value: totalModules || 46,
      icon: Layers,
      color: "bg-amber-100 text-amber-700",
      accent: "bg-gradient-to-r from-amber-400 to-amber-600",
      progress: "bg-amber-500",
      change: "Across Courses",
    },
    {
      title: "Lessons",
      value: totalLessons || 158,
      icon: FileText,
      color: "bg-green-100 text-green-700",
      accent: "bg-gradient-to-r from-green-500 to-green-700",
      progress: "bg-green-600",
      change: "+12 Published",
    },
  ];

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === "All Categories" ||
      c.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesStat =
      selectedStatus === "All Status" ||
      c.status?.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesCat && matchesStat;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return (a.id || a._id) - (b.id || b._id);
      case "name-asc":
        return (a.title || "").localeCompare(b.title || "");
      case "name-desc":
        return (b.title || "").localeCompare(a.title || "");
      case "students":
        return (b.students || 0) - (a.students || 0);
      default:
        return (b.id || b._id) - (a.id || a._id);
    }
  });

  const totalPages = Math.ceil(sortedCourses.length / coursesPerPage) || 1;
  const startIndex = (currentPage - 1) * coursesPerPage;
  const paginatedCourses = sortedCourses.slice(
    startIndex,
    startIndex + coursesPerPage
  );



  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Assigned Courses</h2>
          <p className="text-sm text-gray-500">Manage course modules, lessons, and curriculum resources.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#5d0f2d] text-white text-xs font-semibold rounded-xl shadow-md hover:bg-[#8a164b] transition-all">
          <Plus className="w-4 h-4" />
          <span>Create New Course</span>
        </button>
      </div>


      {/* ------------------------------------------------------------------------- */}


      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Top Accent */}
              <div className={`h-1 ${item.accent}`} />

              <div className="p-5">

                {/* Header */}
                <div className="flex items-center justify-between">

                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.color}`}
                  >
                    <Icon size={20} />
                  </div>

                  <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                    <TrendingUp size={14} />
                    <span>12%</span>
                  </div>

                </div>

                {/* Number */}
                <h2 className="text-3xl font-bold text-gray-900 mt-4">
                  {item.value}
                </h2>

                {/* Title */}
                <p className="text-sm font-medium text-gray-500 mt-1">
                  {item.title}
                </p>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between">

                  <span className="text-xs text-gray-400">
                    {item.change}
                  </span>

                  <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`w-3/4 h-full rounded-full ${item.progress}`}
                    />
                  </div>

                </div>

              </div>
            </div>
          );
        })}
      </div>







      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8">

        <div className="flex flex-col lg:flex-row lg:items-center gap-4">

          {/* Search Box */}
          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5d0f2d]/20 focus:border-[#5d0f2d] transition"
            />

          </div>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 focus:ring-2 focus:ring-[#5d0f2d]/20 focus:border-[#5d0f2d] outline-none"
          >
            <option>All Categories</option>
            <option>Web Development</option>
            <option>Programming</option>
            <option>Design</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 focus:ring-2 focus:ring-[#5d0f2d]/20 focus:border-[#5d0f2d] outline-none"
          >
            <option>All Status</option>
            <option>Published</option>
            <option>Draft</option>
          </select>

          {/* Sort */}
          <button className="flex items-center justify-center gap-2 h-12 px-5 rounded-xl border border-gray-200 hover:bg-gray-50 transition">

            <SlidersHorizontal size={18} />

            Sort

          </button>

          {/* Filter */}
          <button className="flex items-center justify-center gap-2 h-12 px-5 bg-[#5d0f2d] text-white rounded-xl hover:bg-[#7a1241] transition shadow">

            <Filter size={18} />

            Filters

          </button>


          {/* View Toggle */}
          <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200">

            <button
              onClick={() => setViewMode("grid")}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition ${viewMode === "grid"
                ? "bg-white text-[#5d0f2d] shadow-sm"
                : "text-gray-500 hover:text-[#5d0f2d]"
                }`}
              title="Grid View"
            >
              <Grid3X3 size={18} />
            </button>

            <button
              onClick={() => setViewMode("list")}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition ${viewMode === "list"
                ? "bg-white text-[#5d0f2d] shadow-sm"
                : "text-gray-500 hover:text-[#5d0f2d]"
                }`}
              title="List View"
            >
              <List size={18} />
            </button>

          </div>

        </div>

      </div>


















      {/* <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
        <p className="text-sm text-gray-500">Course catalog grid will render here in Phase 4.</p>
      </div> */}

      {/* Results Counter */}
      <div className="flex items-center justify-between mb-5">

        {/* Left */}
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {courses.length}
          </span>{" "}
          Courses
        </p>

        {/* Right */}
        <div className="flex items-center gap-2">

          <span className="text-sm text-gray-500">
            Sort by
          </span>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 outline-none focus:border-[#5d0f2d] focus:ring-2 focus:ring-[#5d0f2d]/10 cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="students">Most Students</option>
          </select>

        </div>

      </div>











      <div className="grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8">
        {paginatedCourses.map((course) => (
          <div
            key={course.id}
            className="group overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            {/* Image */}
            <div className="relative h-40 overflow-hidden">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

              {/* Status */}
              <span
                className={`absolute top-5 right-5 px-4 py-2 rounded-full text-xs font-semibold shadow-lg backdrop-blur-md ${course.status === "Published"
                  ? "bg-emerald-100/90 text-emerald-700"
                  : "bg-orange-100/90 text-orange-700"
                  }`}
              >
                {course.status}
              </span>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Category */}
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-gradient-to-r from-[#5d0f2d]/10 to-[#8a164b]/10 text-[#5d0f2d] border border-[#5d0f2d]/20">
                {course.category}
              </span>

              {/* Title */}
              <h3 className="mt-3 text-xl font-bold leading-snug text-gray-900 group-hover:text-[#5d0f2d] transition">
                {course.title}
              </h3>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-2 text-center">
                  <p className="text-lg font-bold text-[#5d0f2d]">
                    {course.students}
                  </p>
                  <span className="text-xs text-gray-500">Students</span>
                </div>

                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 text-center">
                  <p className="text-2xl font-bold text-[#5d0f2d]">
                    {course.modules}
                  </p>
                  <span className="text-xs text-gray-500">Modules</span>
                </div>

                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 text-center">
                  <p className="text-2xl font-bold text-[#5d0f2d]">
                    {course.lessons}
                  </p>
                  <span className="text-xs text-gray-500">Lessons</span>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700">
                    Curriculum Progress
                  </span>

                  <span className="font-bold text-[#5d0f2d]">
                    {course.progress}%
                  </span>
                </div>

                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${course.progress}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-[#5d0f2d] via-[#8a164b] to-pink-500"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-semibold text-gray-800">2 days ago</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/faculty/courses/${course.id}`)}
                    className="px-5 py-3 rounded-xl border border-gray-300 font-semibold hover:bg-gray-100 transition"
                  >
                    View
                  </button>

                  <button
                    onClick={() => navigate(`/faculty/courses/${course.id}`)}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#5d0f2d] to-[#8a164b] text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    Manage
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>






      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">

        {/* Result Info */}
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-800">
            1–{courses.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-800">
            12
          </span>{" "}
          courses
        </p>

        {/* Pagination Buttons */}
        <div className="flex items-center gap-1">

          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded-lg border text-sm font-medium transition ${currentPage === 1
              ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
              : "border-gray-200 bg-white text-gray-600 hover:bg-[#5d0f2d]/10 hover:text-[#5d0f2d]"
              }`}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-lg text-sm font-semibold transition ${currentPage === page
                  ? "bg-[#5d0f2d] text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-[#5d0f2d]/10 hover:text-[#5d0f2d]"
                  }`}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`px-3 py-2 rounded-lg border text-sm font-medium transition ${currentPage === totalPages
              ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
              : "border-gray-200 bg-white text-gray-600 hover:bg-[#5d0f2d]/10 hover:text-[#5d0f2d]"
              }`}
          >
            Next
          </button>

        </div>

      </div>





    </div>
  );
}
