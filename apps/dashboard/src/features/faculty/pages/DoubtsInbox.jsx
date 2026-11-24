import React from "react";
import {
  HelpCircle,
  Filter,
  Search,
  X,
  ChevronDown,
  Clock3,
  MessageCircle,
  Eye,
  MoreVertical,
  CheckCircle2,
} from "lucide-react";
export default function DoubtsInbox() {
  const [search, setSearch] = React.useState("");
const [statusFilter, setStatusFilter] = React.useState("All");
const [courseFilter, setCourseFilter] = React.useState("All");
const [activeDoubtMenu, setActiveDoubtMenu] = React.useState(null);
const [selectedDoubt, setSelectedDoubt] = React.useState(null);
const [showDoubtModal, setShowDoubtModal] = React.useState(false);

const doubts = [
  {
    id: 1,
    student: "Rahul Sharma",
    question: "How does useEffect work in React?",
    course: "React.js Development",
    status: "Pending",
  },
  {
    id: 2,
    student: "Priya Singh",
    question: "What is the difference between let and const?",
    course: "JavaScript Fundamentals",
    status: "In Progress",
  },
  {
    id: 3,
    student: "Aman Verma",
    question: "How can I connect MongoDB with Node.js?",
    course: "Full Stack Web Development",
    status: "Resolved",
  },
  {
    id: 4,
    student: "Neha Gupta",
    question: "What are semantic HTML elements?",
    course: "HTML & CSS Fundamentals",
    status: "Pending",
  },
  {
    id: 5,
    student: "Rohan Kumar",
    question: "Why is my React component not rendering?",
    course: "React.js Development",
    status: "Resolved",
  },
];

const filteredDoubts = doubts.filter((doubt) => {
  const searchText = search.toLowerCase().trim();

  const matchesSearch =
    doubt.student.toLowerCase().includes(searchText) ||
    doubt.question.toLowerCase().includes(searchText) ||
    doubt.course.toLowerCase().includes(searchText);

  const matchesStatus =
    statusFilter === "All" || doubt.status === statusFilter;

  const matchesCourse =
    courseFilter === "All" || doubt.course === courseFilter;

  return matchesSearch && matchesStatus && matchesCourse;
});

const clearFilters = () => {
  setSearch("");
  setStatusFilter("All");
  setCourseFilter("All");
};

const hasActiveFilters =
  search.trim() !== "" ||
  statusFilter !== "All" ||
  courseFilter !== "All";


  return (
    <div className="space-y-6">

      {/* ============================= */}
      {/* PAGE HEADER */}
      {/* ============================= */}

      <div>
        <h1 className="text-2xl px-3 py-3 md:text-3xl font-bold text-gray-900">
          Student Doubts Resolution
        </h1>

        <p className="text-sm md:text-base text-gray-500 mt-1 px-3 py-1">
          Review and resolve questions submitted by enrolled students.
        </p>
      </div>


      {/* ============================= */}
      {/* STATS CARDS */}
      {/* ============================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">


        {/* ============================= */}
        {/* TOTAL DOUBTS */}
        {/* ============================= */}

        <div
          className="relative overflow-hidden
                     bg-white rounded-2xl
                     border border-gray-100
                     shadow-sm
                     hover:shadow-md
                     hover:-translate-y-0.5
                     transition-all duration-200"
        >

          {/* Top Color Line */}
          <div
            className="absolute top-0 left-0 right-0 h-1
                       bg-gradient-to-r
                       from-[#5d0f2d]
                       to-[#8a164b]"
          />

          <div className="p-5 flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Doubts
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                24
              </h3>

              <p className="text-xs text-gray-400 mt-1">
                All student questions
              </p>
            </div>

            <div
              className="w-11 h-11 shrink-0
                         rounded-xl
                         bg-[#5d0f2d]/10
                         text-[#5d0f2d]
                         flex items-center justify-center"
            >
              <HelpCircle size={21} />
            </div>

          </div>
        </div>


        {/* ============================= */}
        {/* PENDING */}
        {/* ============================= */}

        <div
          className="relative overflow-hidden
                     bg-white rounded-2xl
                     border border-gray-100
                     shadow-sm
                     hover:shadow-md
                     hover:-translate-y-0.5
                     transition-all duration-200"
        >

          {/* Top Color Line */}
          <div
            className="absolute top-0 left-0 right-0 h-1
                       bg-gradient-to-r
                       from-orange-400
                       to-amber-400"
          />

          <div className="p-5 flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Pending
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                8
              </h3>

              <p className="text-xs text-gray-400 mt-1">
                Awaiting response
              </p>
            </div>

            <div
              className="w-11 h-11 shrink-0
                         rounded-xl
                         bg-orange-100
                         text-orange-600
                         flex items-center justify-center"
            >
              <Clock3 size={21} />
            </div>

          </div>
        </div>


        {/* ============================= */}
        {/* IN PROGRESS */}
        {/* ============================= */}

        <div
          className="relative overflow-hidden
                     bg-white rounded-2xl
                     border border-gray-100
                     shadow-sm
                     hover:shadow-md
                     hover:-translate-y-0.5
                     transition-all duration-200"
        >

          {/* Top Color Line */}
          <div
            className="absolute top-0 left-0 right-0 h-1
                       bg-gradient-to-r
                       from-blue-400
                       to-indigo-400"
          />

          <div className="p-5 flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                In Progress
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                5
              </h3>

              <p className="text-xs text-gray-400 mt-1">
                Being resolved
              </p>
            </div>

            <div
              className="w-11 h-11 shrink-0
                         rounded-xl
                         bg-blue-100
                         text-blue-600
                         flex items-center justify-center"
            >
              <MessageCircle size={21} />
            </div>

          </div>
        </div>


        {/* ============================= */}
        {/* RESOLVED */}
        {/* ============================= */}

        <div
          className="relative overflow-hidden
                     bg-white rounded-2xl
                     border border-gray-100
                     shadow-sm
                     hover:shadow-md
                     hover:-translate-y-0.5
                     transition-all duration-200"
        >

          {/* Top Color Line */}
          <div
            className="absolute top-0 left-0 right-0 h-1
                       bg-gradient-to-r
                       from-emerald-400
                       to-green-400"
          />

          <div className="p-5 flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Resolved
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                11
              </h3>

              <p className="text-xs text-gray-400 mt-1">
                Successfully resolved
              </p>
            </div>

            <div
              className="w-11 h-11 shrink-0
                         rounded-xl
                         bg-emerald-100
                         text-emerald-600
                         flex items-center justify-center"
            >
              <CheckCircle2 size={21} />
            </div>

          </div>
        </div>

      </div>

      {/* ============================= */}
{/* PREMIUM SEARCH & FILTERS */}
{/* ============================= */}

<div
  className="relative overflow-hidden
             bg-white
             rounded-2xl
             border border-gray-100
             shadow-sm"
>
  {/* Subtle top accent */}
  <div
    className="absolute top-0 left-0 right-0 h-[2px]
               bg-gradient-to-r
               from-[#5d0f2d]
               via-[#8a164b]
               to-transparent"
  />

  <div className="p-5">

    {/* Header */}
    <div className="flex flex-col sm:flex-row
                    sm:items-center
                    sm:justify-between
                    gap-3 mb-5">

      <div className="flex items-center gap-3">

        <div
          className="w-10 h-10
                     rounded-xl
                     bg-[#5d0f2d]/10
                     text-[#5d0f2d]
                     flex items-center justify-center"
        >
          <Filter size={18} />
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-900">
            Find Student Doubts
          </h3>

          <p className="text-xs text-gray-400 mt-0.5">
            Search and filter questions quickly
          </p>
        </div>

      </div>

      {/* Result count */}
      <div
        className="self-start sm:self-auto
                   px-3 py-1.5
                   rounded-full
                   bg-gray-50
                   border border-gray-100"
      >
        <span className="text-xs font-semibold text-gray-600">
          {filteredDoubts.length} Results
        </span>
      </div>

    </div>


    {/* Controls */}
    <div className="flex flex-col lg:flex-row gap-3">

      {/* ============================= */}
      {/* SEARCH */}
      {/* ============================= */}

      <div className="relative flex-1 group">

        <div
          className="absolute left-3.5 top-1/2
                     -translate-y-1/2
                     w-7 h-7
                     rounded-lg
                     bg-gray-100
                     group-focus-within:bg-[#5d0f2d]/10
                     flex items-center justify-center
                     transition-all"
        >
          <Search
            size={15}
            className="text-gray-400
                       group-focus-within:text-[#5d0f2d]"
          />
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by student, question or course..."
          className="w-full h-12
                     pl-12 pr-11
                     rounded-xl
                     bg-gray-50
                     border border-gray-200
                     text-sm text-gray-800
                     placeholder:text-gray-400
                     outline-none

                     hover:bg-white
                     hover:border-gray-300

                     focus:bg-white
                     focus:border-[#5d0f2d]
                     focus:ring-4
                     focus:ring-[#5d0f2d]/10

                     transition-all duration-200"
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3
                       top-1/2
                       -translate-y-1/2
                       w-7 h-7
                       rounded-lg
                       flex items-center justify-center
                       text-gray-400
                       hover:bg-gray-200
                       hover:text-gray-700
                       transition"
          >
            <X size={14} />
          </button>
        )}

      </div>


      {/* ============================= */}
      {/* STATUS */}
      {/* ============================= */}

      <div className="relative w-full lg:w-48 group">

        <div
          className="absolute left-3.5 top-1/2
                     -translate-y-1/2
                     w-7 h-7
                     rounded-lg
                     bg-gray-100
                     group-focus-within:bg-[#5d0f2d]/10
                     flex items-center justify-center
                     pointer-events-none
                     transition-all"
        >
          <span className="w-2 h-2 rounded-full bg-[#5d0f2d]" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="appearance-none
                     w-full h-12
                     pl-12 pr-10
                     rounded-xl
                     bg-gray-50
                     border border-gray-200
                     text-sm text-gray-700
                     font-medium
                     outline-none
                     cursor-pointer

                     hover:bg-white
                     hover:border-gray-300

                     focus:bg-white
                     focus:border-[#5d0f2d]
                     focus:ring-4
                     focus:ring-[#5d0f2d]/10

                     transition-all duration-200"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>

        <ChevronDown
          size={16}
          className="absolute right-3.5
                     top-1/2
                     -translate-y-1/2
                     text-gray-400
                     pointer-events-none"
        />

      </div>


      {/* ============================= */}
      {/* COURSE */}
      {/* ============================= */}

      <div className="relative w-full lg:w-56 group">

        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="appearance-none
                     w-full h-12
                     pl-4 pr-10
                     rounded-xl
                     bg-gray-50
                     border border-gray-200
                     text-sm text-gray-700
                     font-medium
                     outline-none
                     cursor-pointer

                     hover:bg-white
                     hover:border-gray-300

                     focus:bg-white
                     focus:border-[#5d0f2d]
                     focus:ring-4
                     focus:ring-[#5d0f2d]/10

                     transition-all duration-200"
        >
          <option value="All">All Courses</option>

          <option value="React.js Development">
            React.js Development
          </option>

          <option value="JavaScript Fundamentals">
            JavaScript Fundamentals
          </option>

          <option value="Full Stack Web Development">
            Full Stack Web Development
          </option>

          <option value="HTML & CSS Fundamentals">
            HTML & CSS Fundamentals
          </option>
        </select>

        <ChevronDown
          size={16}
          className="absolute right-3.5
                     top-1/2
                     -translate-y-1/2
                     text-gray-400
                     pointer-events-none"
        />

      </div>


      {/* ============================= */}
      {/* CLEAR */}
      {/* ============================= */}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="h-12
                     px-4
                     rounded-xl
                     bg-[#5d0f2d]
                     text-white
                     text-sm
                     font-semibold
                     flex items-center
                     justify-center
                     gap-2

                     hover:bg-[#4b0c24]
                     hover:shadow-md
                     hover:-translate-y-0.5

                     active:translate-y-0

                     transition-all duration-200"
        >
          <X size={15} />
          Clear
        </button>
      )}

    </div>


    {/* ============================= */}
    {/* BOTTOM INFO */}
    {/* ============================= */}

    <div
      className="flex flex-col sm:flex-row
                 sm:items-center
                 sm:justify-between
                 gap-2
                 mt-4
                 pt-4
                 border-t border-gray-100"
    >

      <p className="text-xs text-gray-500">

        Showing{" "}

        <span className="font-bold text-gray-800">
          {filteredDoubts.length}
        </span>

        {" "}of{" "}

        <span className="font-bold text-gray-800">
          {doubts.length}
        </span>

        {" "}student doubts

      </p>


      {hasActiveFilters && (
        <div
          className="inline-flex items-center gap-1.5
                     text-xs
                     font-semibold
                     text-[#5d0f2d]"
        >
          <span
            className="w-1.5 h-1.5
                       rounded-full
                       bg-[#5d0f2d]"
          />

          Filters active
        </div>
      )}

    </div>

  </div>

</div>
      {/* ============================= */}
      {/* TEMPORARY CONTENT */}
      {/* ============================= */}

      {/* ============================= */}
{/* DOUBT INBOX */}
{/* ============================= */}

{/* Doubt Inbox */}
<div className="space-y-4">

  {/* Doubt Card */}
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
                  hover:shadow-md transition-all duration-200 overflow-hidden">

    {/* Top Accent Line */}
    <div className="h-1 bg-gradient-to-r from-[#5d0f2d] to-[#8a164b]" />

    <div className="p-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">

        <div className="flex items-start gap-3 min-w-0">

          {/* Icon */}
          <div className="w-11 h-11 shrink-0 rounded-xl
                          bg-[#5d0f2d]/10
                          text-[#5d0f2d]
                          flex items-center justify-center">
            <HelpCircle size={21} />
          </div>

          {/* Student Info */}
          <div className="min-w-0">

            <h3 className="font-bold text-gray-900 truncate">
              How does useEffect work in React?
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Rahul Sharma • Full Stack Web Development
            </p>

          </div>

        </div>

        {/* Status */}
        <span className="shrink-0 inline-flex items-center gap-1.5
                         px-3 py-1.5 rounded-full
                         bg-orange-100 text-orange-700
                         text-xs font-semibold">
          <Clock3 size={13} />
          Pending
        </span>

      </div>


      {/* Doubt Description */}
      <div className="mt-4 rounded-xl bg-gray-50 border border-gray-100 p-4">

        <p className="text-sm text-gray-600 leading-relaxed">
          I understand the basic concept of useEffect, but I am confused
          about when the dependency array should be used and how it
          affects component rendering.
        </p>

      </div>


      {/* Bottom Details */}
      <div className="flex flex-wrap items-center justify-between
                      gap-3 mt-4">

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4">

          <div className="flex items-center gap-1.5
                          text-xs text-gray-500">
            <MessageCircle size={15} />
            2 replies
          </div>

          <div className="flex items-center gap-1.5
                          text-xs text-gray-500">
            <Clock3 size={15} />
            2 hours ago
          </div>

        </div>


        {/* Actions */}
        <div className="flex items-center gap-2">

          <button
            type="button"
            className="inline-flex items-center gap-2
                       px-3.5 py-2 rounded-lg
                       border border-gray-200
                       text-sm font-semibold text-gray-600
                       hover:bg-gray-50
                       transition"
          >
            <Eye size={16} />
            View
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2
                       px-3.5 py-2 rounded-lg
                       bg-[#5d0f2d]
                       text-white
                       text-sm font-semibold
                       hover:bg-[#4b0c24]
                       transition"
          >
            <CheckCircle2 size={16} />
            Resolve
          </button>

        </div>

      </div>

    </div>

  </div>


  {/* Second Doubt Card */}
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
                  hover:shadow-md transition-all duration-200 overflow-hidden">

    {/* Top Accent Line */}
    <div className="h-1 bg-gradient-to-r from-orange-400 to-amber-500" />

    <div className="p-5">

      <div className="flex items-start justify-between gap-4">

        <div className="flex items-start gap-3 min-w-0">

          <div className="w-11 h-11 shrink-0 rounded-xl
                          bg-orange-100
                          text-orange-600
                          flex items-center justify-center">
            <HelpCircle size={21} />
          </div>

          <div className="min-w-0">

            <h3 className="font-bold text-gray-900 truncate">
              Difference between let and const?
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Priya Verma • JavaScript Fundamentals
            </p>

          </div>

        </div>

        <span className="shrink-0 inline-flex items-center gap-1.5
                         px-3 py-1.5 rounded-full
                         bg-orange-100 text-orange-700
                         text-xs font-semibold">
          <Clock3 size={13} />
          Pending
        </span>

      </div>


      <div className="mt-4 rounded-xl bg-gray-50 border border-gray-100 p-4">

        <p className="text-sm text-gray-600 leading-relaxed">
          Can you explain the main difference between let and const?
          Also, when should I prefer one over the other?
        </p>

      </div>


      <div className="flex flex-wrap items-center justify-between
                      gap-3 mt-4">

        <div className="flex flex-wrap items-center gap-4">

          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MessageCircle size={15} />
            0 replies
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock3 size={15} />
            5 hours ago
          </div>

        </div>

        <div className="flex items-center gap-2">

          <button
            type="button"
            className="inline-flex items-center gap-2
                       px-3.5 py-2 rounded-lg
                       border border-gray-200
                       text-sm font-semibold text-gray-600
                       hover:bg-gray-50
                       transition"
          >
            <Eye size={16} />
            View
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2
                       px-3.5 py-2 rounded-lg
                       bg-[#5d0f2d]
                       text-white
                       text-sm font-semibold
                       hover:bg-[#4b0c24]
                       transition"
          >
            <CheckCircle2 size={16} />
            Resolve
          </button>

        </div>

      </div>

    </div>

  </div>

</div>

    </div>
  );
}