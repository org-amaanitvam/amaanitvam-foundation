import React, { createPortal } from "react";
import {
  FileCheck,
  Plus,
  Search,
  MoreVertical,
  CalendarDays,
  Users,
  Clock3,
  Pencil,
  Trash2,
  Eye,
  X,
  Clock,
} from "lucide-react";

export default function AssignmentsManager() {
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [activeMenu, setActiveMenu] = React.useState(null);

const [menuPosition, setMenuPosition] = React.useState({
  top: 0,
  left: 0,
});

  const [assignments, setAssignments] = React.useState([
    {
      id: 1,
      title: "Build a Responsive Portfolio",
      course: "Full Stack Web Development",
      dueDate: "18 Aug 2026",
      submissions: 32,
      totalStudents: 40,
      status: "Published",
      marks: 100,
    },
    {
      id: 2,
      title: "JavaScript DOM Project",
      course: "JavaScript Fundamentals",
      dueDate: "22 Aug 2026",
      submissions: 24,
      totalStudents: 38,
      status: "Published",
      marks: 50,
    },
    {
      id: 3,
      title: "React Component Challenge",
      course: "React.js Development",
      dueDate: "28 Aug 2026",
      submissions: 0,
      totalStudents: 35,
      status: "Draft",
      marks: 100,
    },
  ]);

  const [newAssignment, setNewAssignment] = React.useState({
    title: "",
    course: "",
    dueDate: "",
    marks: "",
    description: "",
  });

  const handleCreateAssignment = () => {
    if (
      !newAssignment.title.trim() ||
      !newAssignment.course.trim() ||
      !newAssignment.dueDate
    ) {
      return;
    }

    const assignment = {
      id: Date.now(),
      title: newAssignment.title.trim(),
      course: newAssignment.course.trim(),
      dueDate: newAssignment.dueDate,
      submissions: 0,
      totalStudents: 0,
      status: "Draft",
      marks: newAssignment.marks || 100,
    };

    setAssignments((prev) => [assignment, ...prev]);

    setNewAssignment({
      title: "",
      course: "",
      dueDate: "",
      marks: "",
      description: "",
    });

    setShowCreateModal(false);
  };

  const handleDeleteAssignment = (id) => {
    setAssignments((prev) =>
      prev.filter((assignment) => assignment.id !== id)
    );

    setActiveMenu(null);
  };

  const filteredAssignments = assignments.filter((assignment) =>
    `${assignment.title} ${assignment.course}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalAssignments = assignments.length;

  const publishedAssignments = assignments.filter(
    (assignment) => assignment.status === "Published"
  ).length;

  const draftAssignments = assignments.filter(
    (assignment) => assignment.status === "Draft"
  ).length;

  const pendingSubmissions = assignments.reduce(
    (total, assignment) =>
      total +
      Math.max(
        assignment.totalStudents - assignment.submissions,
        0
      ),
    0
  );

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl md:text-3xl px-3 py-3 font-bold text-gray-900">
            Assignments & Projects
          </h1>

          <p className="text-sm px-3 py-1 text-gray-500 mt-1">
            Publish coursework deadlines and review student submissions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2
                     px-5 py-3 rounded-xl
                     bg-gradient-to-r from-[#5d0f2d] to-[#8a164b]
                     text-white text-sm font-semibold
                     shadow-md hover:shadow-lg
                     hover:-translate-y-0.5
                     transition-all"
        >
          <Plus size={18} />
          Create Assignment
        </button>

      </div>


      {/* ================= STATS ================= */}

      {/* ============================= */}
      {/* STATS CARDS */}
      {/* ============================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        {/* Total Assignments */}
        <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-200/80 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(93,15,45,0.10)]">

          {/* Top Color Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#5d0f2d] to-[#8a164b]" />

          {/* Glow */}
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#5d0f2d]/5 blur-2xl group-hover:bg-[#5d0f2d]/10 transition" />

          <div className="relative flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Assignments
              </p>

              <h3 className="mt-3 text-3xl font-bold text-gray-900">
                3
              </h3>

              <p className="text-xs text-gray-400 mt-1">
                All coursework
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-[#5d0f2d]/10 text-[#5d0f2d] flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileCheck size={22} />
            </div>

          </div>
        </div>


        {/* Published */}
        <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-200/80 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(16,185,129,0.10)]">

          {/* Top Color Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-300" />

          {/* Glow */}
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl group-hover:bg-emerald-500/10 transition" />

          <div className="relative flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Published
              </p>

              <h3 className="mt-3 text-3xl font-bold text-gray-900">
                2
              </h3>

              <p className="text-xs text-gray-400 mt-1">
                Live assignments
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileCheck size={22} />
            </div>

          </div>
        </div>


        {/* Drafts */}
        <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-200/80 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(245,158,11,0.10)]">

          {/* Top Color Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-300" />

          {/* Glow */}
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/5 blur-2xl group-hover:bg-amber-500/10 transition" />

          <div className="relative flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Drafts
              </p>

              <h3 className="mt-3 text-3xl font-bold text-gray-900">
                1
              </h3>

              <p className="text-xs text-gray-400 mt-1">
                Not published yet
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock3 size={22} />
            </div>

          </div>
        </div>


        {/* Pending Submissions */}
        <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-200/80 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(59,130,246,0.10)]">

          {/* Top Color Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-300" />

          {/* Glow */}
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl group-hover:bg-blue-500/10 transition" />

          <div className="relative flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Pending Submissions
              </p>

              <h3 className="mt-3 text-3xl font-bold text-gray-900">
                57
              </h3>

              <p className="text-xs text-gray-400 mt-1">
                Awaiting review
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users size={22} />
            </div>

          </div>
        </div>

      </div>


      {/* ================= SEARCH ================= */}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">

        <div className="relative w-full max-w-md">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2
               text-gray-400 pointer-events-none"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assignments..."
            className="
      w-full h-11
      pl-11 pr-4
      rounded-xl

      bg-gray-50
      border border-gray-200

      text-sm text-gray-800
      placeholder:text-gray-400

      outline-none

      transition-all duration-200

      hover:bg-white
      hover:border-gray-300

      focus:bg-white
      focus:border-[#5d0f2d]
      focus:ring-4
      focus:ring-[#5d0f2d]/10

      shadow-sm
      focus:shadow-md
    "
          />

        </div>

      </div>


      {/* ================= ASSIGNMENT LIST ================= */}

      <div className="space-y-4">

        {filteredAssignments.length > 0 ? (

          filteredAssignments.map((assignment) => (

            <div
              key={assignment.id}
              className="group relative overflow-hidden
           bg-white rounded-2xl
           border border-gray-200
           shadow-[0_4px_20px_rgba(0,0,0,0.04)]
           hover:shadow-[0_12px_35px_rgba(93,15,45,0.10)]
           hover:-translate-y-1
           transition-all duration-300"
            >
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1
                bg-gradient-to-r
                from-[#5d0f2d]
                via-[#8a164b]
                to-[#d4a5b5]" />
              <div className="p-5">

                <div className="flex items-start gap-4">

                  {/* Icon */}

                  {/* Assignment Icon */}
                  {/* Assignment Icon */}
                  <div
                    className="w-12 h-12 shrink-0
             rounded-xl
             bg-gradient-to-br
             from-[#5d0f2d]/10
             to-[#8a164b]/10
             border border-[#5d0f2d]/15
             text-[#5d0f2d]
             flex items-center justify-center"
                  >
                    <FileCheck
                      size={22}
                      strokeWidth={2.2}
                      className="text-[#5d0f2d]"
                    />
                  </div>


                  {/* Main Info */}

                  <div className="flex-1 min-w-0">

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <h3 className="font-bold text-gray-900 text-[15px]
               group-hover:text-[#5d0f2d]
               transition-colors">
                          {assignment.title}
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          {assignment.course}
                        </p>

                      </div>


                      {/* Status */}

                      <span
                        className={`shrink-0 px-3 py-1.5 rounded-full
                                   text-xs font-semibold ${assignment.status === "Published"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-orange-100 text-orange-700"
                          }`}
                      >
                        {assignment.status}
                      </span>

                    </div>


                    {/* Details */}

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CalendarDays size={16} />
                        Due {assignment.dueDate}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users size={16} />
                        {assignment.submissions}/
                        {assignment.totalStudents} submitted
                      </div>

                      <div className="text-sm text-gray-500">
                        {assignment.marks} marks
                      </div>

                    </div>

                  </div>


                  {/* 3 DOT MENU */}

                  {/* 3 DOT MENU */}
{/* 3 DOT MENU */}
<div className="relative shrink-0">

  {/* Menu Button */}
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();

      const rect = e.currentTarget.getBoundingClientRect();

      const menuWidth = 176;
      const menuHeight = 150;

      let left = rect.right - menuWidth;
      let top = rect.bottom + 8;

      // Right side se bahar na nikle
      if (left < 8) {
        left = 8;
      }

      if (left + menuWidth > window.innerWidth - 8) {
        left = window.innerWidth - menuWidth - 8;
      }

      // Agar neeche space nahi hai to upar open hoga
      if (top + menuHeight > window.innerHeight - 8) {
        top = rect.top - menuHeight - 8;
      }

      setMenuPosition({
        top,
        left,
      });

      setActiveMenu((current) =>
        current === assignment.id ? null : assignment.id
      );
    }}
    className={`w-9 h-9 rounded-lg
               flex items-center justify-center
               transition-all duration-200
               ${
                 activeMenu === assignment.id
                   ? "bg-[#5d0f2d]/10 text-[#5d0f2d]"
                   : "text-gray-500 hover:text-[#5d0f2d] hover:bg-[#5d0f2d]/10"
               }`}
  >
    <MoreVertical size={18} />
  </button>

</div>

                </div>

              </div>

            </div>

          ))

        ) : (

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">

            <div className="w-14 h-14 mx-auto rounded-2xl
                            bg-gray-100
                            text-gray-400
                            flex items-center justify-center">
              <FileCheck size={25} />
            </div>

            <h3 className="font-semibold text-gray-900 mt-4">
              No assignments found
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Try changing your search or create a new assignment.
            </p>

          </div>

        )}

      </div>


      {/* ================= CREATE MODAL ================= */}

      {showCreateModal && (

        <div className="fixed inset-0 z-50
                        flex items-center justify-center
                        bg-black/40 backdrop-blur-sm
                        px-4">

          <div className="w-full max-w-lg
                          bg-white rounded-2xl
                          shadow-2xl p-6">

            {/* Header */}

            <div className="flex items-center justify-between mb-6">

              <div>

                <h3 className="text-xl font-bold text-gray-900">
                  Create Assignment
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Add a new assignment for your students.
                </p>

              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-9 h-9 rounded-lg
                           hover:bg-gray-100
                           text-gray-500
                           flex items-center justify-center"
              >
                <X size={18} />
              </button>

            </div>


            {/* Title */}

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Assignment Title
            </label>

            <input
              type="text"
              value={newAssignment.title}
              onChange={(e) =>
                setNewAssignment({
                  ...newAssignment,
                  title: e.target.value,
                })
              }
              placeholder="e.g. Build a React Dashboard"
              className="w-full h-11 px-4 rounded-xl
                         border border-gray-200
                         outline-none
                         focus:border-[#5d0f2d]
                         focus:ring-2
                         focus:ring-[#5d0f2d]/10"
            />


            {/* Course */}

            <label className="block text-sm font-semibold text-gray-700 mt-5 mb-2">
              Course
            </label>

            <input
              type="text"
              value={newAssignment.course}
              onChange={(e) =>
                setNewAssignment({
                  ...newAssignment,
                  course: e.target.value,
                })
              }
              placeholder="e.g. Full Stack Web Development"
              className="w-full h-11 px-4 rounded-xl
                         border border-gray-200
                         outline-none
                         focus:border-[#5d0f2d]
                         focus:ring-2
                         focus:ring-[#5d0f2d]/10"
            />


            {/* Date + Marks */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Due Date
                </label>

                <input
                  type="date"
                  value={newAssignment.dueDate}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      dueDate: e.target.value,
                    })
                  }
                  className="w-full h-11 px-4 rounded-xl
                             border border-gray-200
                             outline-none
                             focus:border-[#5d0f2d]"
                />

              </div>


              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Marks
                </label>

                <input
                  type="number"
                  value={newAssignment.marks}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      marks: e.target.value,
                    })
                  }
                  placeholder="100"
                  className="w-full h-11 px-4 rounded-xl
                             border border-gray-200
                             outline-none
                             focus:border-[#5d0f2d]"
                />

              </div>

            </div>


            {/* Description */}

            <label className="block text-sm font-semibold text-gray-700 mt-5 mb-2">
              Description
            </label>

            <textarea
              rows="3"
              value={newAssignment.description}
              onChange={(e) =>
                setNewAssignment({
                  ...newAssignment,
                  description: e.target.value,
                })
              }
              placeholder="Describe the assignment..."
              className="w-full px-4 py-3 rounded-xl
                         border border-gray-200
                         outline-none resize-none
                         focus:border-[#5d0f2d]
                         focus:ring-2
                         focus:ring-[#5d0f2d]/10"
            />


            {/* Actions */}

            <div className="flex justify-end gap-3 mt-6">

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 rounded-xl
                           border border-gray-200
                           text-sm font-semibold
                           text-gray-600
                           hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreateAssignment}
                disabled={
                  !newAssignment.title.trim() ||
                  !newAssignment.course.trim() ||
                  !newAssignment.dueDate
                }
                className={`px-5 py-2.5 rounded-xl
                            text-sm font-semibold transition ${newAssignment.title.trim() &&
                    newAssignment.course.trim() &&
                    newAssignment.dueDate
                    ? "bg-[#5d0f2d] text-white hover:bg-[#4b0c24]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
              >
                Create Assignment
              </button>

            </div>

          </div>

        </div>

      )}


      {activeMenu && (
  <div
    className="fixed z-[9999] w-44
               rounded-xl
               border border-gray-200
               bg-white
               shadow-2xl
               p-1.5"
    style={{
      top: menuPosition.top,
      left: menuPosition.left,
    }}
    onClick={(e) => e.stopPropagation()}
  >

    {/* View */}
    <button
      type="button"
      onClick={() => {
        setActiveMenu(null);
      }}
      className="w-full flex items-center gap-3
                 px-3 py-2.5
                 rounded-lg
                 text-sm font-medium
                 text-gray-700
                 hover:bg-gray-50
                 transition
                 text-left"
    >
      <Eye size={16} className="text-gray-500" />
      <span>View</span>
    </button>

    {/* Edit */}
    <button
      type="button"
      onClick={() => {
        setActiveMenu(null);
      }}
      className="w-full flex items-center gap-3
                 px-3 py-2.5
                 rounded-lg
                 text-sm font-medium
                 text-gray-700
                 hover:bg-gray-50
                 transition
                 text-left"
    >
      <Pencil size={16} className="text-gray-500" />
      <span>Edit</span>
    </button>

    <div className="my-1.5 h-px bg-gray-100" />

    {/* Delete */}
    <button
      type="button"
      onClick={() => {
        handleDeleteAssignment(activeMenu);
        setActiveMenu(null);
      }}
      className="w-full flex items-center gap-3
                 px-3 py-2.5
                 rounded-lg
                 text-sm font-medium
                 text-red-600
                 hover:bg-red-50
                 transition
                 text-left"
    >
      <Trash2 size={16} />
      <span>Delete</span>
    </button>

  </div>
)}

    </div>
  );
}