import React from "react";
import {
  ArrowLeft,
  BookOpen,
  Users,
  Layers,
  FileText,
  Plus,
  MoreVertical,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function CourseDetailBuilder() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [expandedModules, setExpandedModules] = React.useState([1]);
  const [showModuleModal, setShowModuleModal] = React.useState(false);
  const [newModuleTitle, setNewModuleTitle] = React.useState("");
  const [showLessonModal, setShowLessonModal] = React.useState(false);
  const [selectedModuleId, setSelectedModuleId] = React.useState(null);
  const [newLessonTitle, setNewLessonTitle] = React.useState("");
  const [showEditLessonModal, setShowEditLessonModal] = React.useState(false);
  const [editingLesson, setEditingLesson] = React.useState(null);
  const [editLessonTitle, setEditLessonTitle] = React.useState("");
  

   const [activeModuleMenu, setActiveModuleMenu] = React.useState(null);
  const [showEditModuleModal, setShowEditModuleModal] = React.useState(false);
  const [editingModule, setEditingModule] = React.useState(null);
  const [editModuleTitle, setEditModuleTitle] = React.useState("");

  const [showDeleteModuleModal, setShowDeleteModuleModal] =
    React.useState(false);
  const [deletingModule, setDeletingModule] = React.useState(null);

  // Temporary UI data
  // API integration baad me karenge
  const course = {
    title: "Full Stack Web Development",
    category: "Web Development",
    description:
      "Learn frontend, backend and database development with modern web technologies.",
    students: 128,
    modules: 12,
    lessons: 56,
    progress: 85,
    status: "Published",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200",
  };

  const [modules, setModules] = React.useState([
    {
      id: 1,
      title: "HTML & CSS Fundamentals",
      lessons: 6,
      duration: "4h 20m",
      items: [
        "Introduction to HTML",
        "HTML Semantic Elements",
        "CSS Fundamentals",
      ],
    },
    {
      id: 2,
      title: "JavaScript Fundamentals",
      lessons: 8,
      duration: "6h 15m",
      items: [],
    },
    {
      id: 3,
      title: "React.js Development",
      lessons: 10,
      duration: "8h 40m",
      items: [],
    },
  ]);


  const toggleModule = (moduleId) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleAddModule = () => {
    const title = newModuleTitle.trim();

    if (!title) return;

    const newModule = {
      id: Date.now(),
      title,
      lessons: 0,
      duration: "0h",
      items: [],
    };

    setModules((prev) => [...prev, newModule]);

    setExpandedModules((prev) => [...prev, newModule.id]);

    setNewModuleTitle("");
    setShowModuleModal(false);
  };


  const handleAddLesson = () => {
    const title = newLessonTitle.trim();

    if (!title || !selectedModuleId) return;

    setModules((prev) =>
      prev.map((module) => {
        if (module.id !== selectedModuleId) {
          return module;
        }

        return {
          ...module,
          items: [...module.items, title],
          lessons: module.items.length + 1,
        };
      })
    );

    setNewLessonTitle("");
    setSelectedModuleId(null);
    setShowLessonModal(false);
  };


  const handleEditLesson = () => {
    const title = editLessonTitle.trim();

    if (!title || !editingLesson) return;

    setModules((prev) =>
      prev.map((module) => {
        if (module.id !== editingLesson.moduleId) {
          return module;
        }

        return {
          ...module,
          items: module.items.map((lesson, index) =>
            index === editingLesson.lessonIndex ? title : lesson
          ),
        };
      })
    );

    setShowEditLessonModal(false);
    setEditingLesson(null);
    setEditLessonTitle("");
  };


  const handleEditModule = () => {
    const title = editModuleTitle.trim();

    if (!title || !editingModule) return;

    setModules((prev) =>
      prev.map((module) =>
        module.id === editingModule.id
          ? { ...module, title }
          : module
      )
    );

    setShowEditModuleModal(false);
    setEditingModule(null);
    setEditModuleTitle("");
  };

  const handleDeleteModule = () => {
    if (!deletingModule) return;

    setModules((prev) =>
      prev.filter((module) => module.id !== deletingModule.id)
    );

    setExpandedModules((prev) =>
      prev.filter((id) => id !== deletingModule.id)
    );

    setShowDeleteModuleModal(false);
    setDeletingModule(null);
    setActiveModuleMenu(null);
  };

  return (
    <div className="space-y-6">

      {/* Back */}
      <button
        onClick={() => navigate("/faculty/courses")}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#5d0f2d] transition"
      >
        <ArrowLeft size={17} />
        Back to My Courses
      </button>

      {/* Course Header */}
      <div className="overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm">

        {/* Banner */}
        <div className="relative h-52 overflow-hidden">

          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Status */}
          <span className="absolute top-5 right-5 px-3 py-1.5 rounded-full bg-emerald-100/90 text-emerald-700 text-xs font-semibold backdrop-blur-md">
            {course.status}
          </span>

          {/* Title */}
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <span className="inline-flex px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium border border-white/20">
              {course.category}
            </span>

            <h1 className="mt-3 text-2xl md:text-3xl font-bold">
              {course.title}
            </h1>
          </div>
        </div>

        {/* Course Information */}
        <div className="p-5">

          <p className="text-sm text-gray-500 max-w-3xl leading-relaxed">
            {course.description}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">

            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-9 h-9 rounded-lg bg-[#5d0f2d]/10 text-[#5d0f2d] flex items-center justify-center">
                <Users size={17} />
              </div>

              <div>
                <p className="text-lg font-bold text-gray-900">
                  {course.students}
                </p>
                <p className="text-xs text-gray-500">
                  Students
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Layers size={17} />
              </div>

              <div>
                <p className="text-lg font-bold text-gray-900">
                  {course.modules}
                </p>
                <p className="text-xs text-gray-500">
                  Modules
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <FileText size={17} />
              </div>

              <div>
                <p className="text-lg font-bold text-gray-900">
                  {course.lessons}
                </p>
                <p className="text-xs text-gray-500">
                  Lessons
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Curriculum
                </p>

                <span className="text-sm font-bold text-[#5d0f2d]">
                  {course.progress}%
                </span>
              </div>

              <div className="h-2 mt-3 rounded-full bg-gray-200 overflow-hidden">
                <div
                  style={{ width: `${course.progress}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-[#5d0f2d] to-[#8a164b]"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Curriculum Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Course Curriculum
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Manage modules, lessons and learning resources.
          </p>
        </div>

        <button
          onClick={() => setShowModuleModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#5d0f2d] to-[#8a164b] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <Plus size={17} />
          Add Module
        </button>
      </div>

      {/* Modules */}

      {/* Modules */}
<div className="space-y-3">
  {modules.map((module) => (
    <div
      key={module.id}
      className="relative bg-white rounded-2xl border border-gray-200 shadow-sm overflow-visible"
    >

      {/* Module Header */}
      <div className="flex items-center gap-3 p-4">

        {/* Expand / Collapse */}
        <button
          type="button"
          onClick={() => toggleModule(module.id)}
          className="w-9 h-9 shrink-0 rounded-lg bg-gray-50
                     hover:bg-[#5d0f2d]/10
                     text-gray-500 hover:text-[#5d0f2d]
                     flex items-center justify-center transition"
        >
          {expandedModules.includes(module.id) ? (
            <ChevronDown size={18} />
          ) : (
            <ChevronRight size={18} />
          )}
        </button>

        {/* Module Icon */}
        <div
          className="w-10 h-10 shrink-0 rounded-xl
                     bg-[#5d0f2d]/10 text-[#5d0f2d]
                     flex items-center justify-center"
        >
          <BookOpen size={18} />
        </div>

        {/* Module Information */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {module.title}
          </h3>

          <p className="text-xs text-gray-500 mt-1">
            {module.items.length} Lessons • {module.duration}
          </p>
        </div>

        {/* 3 DOT MENU */}
        <div className="relative shrink-0">

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();

              setActiveModuleMenu((current) =>
                current === module.id ? null : module.id
              );
            }}
            className="w-9 h-9 rounded-lg flex items-center justify-center
                       text-gray-500 hover:text-[#5d0f2d]
                       hover:bg-[#5d0f2d]/10 transition"
          >
            <MoreVertical size={18} />
          </button>

          {/* Dropdown */}
          {activeModuleMenu === module.id && (
            <div
              className="absolute right-0 top-11 z-[100]
                         w-44 rounded-xl border border-gray-200
                         bg-white shadow-xl p-1.5"
              onClick={(e) => e.stopPropagation()}
            >

              {/* Edit Module */}
              <button
                type="button"
                onClick={() => {
                  setEditingModule(module);
                  setEditModuleTitle(module.title);
                  setShowEditModuleModal(true);
                  setActiveModuleMenu(null);
                }}
                className="w-full flex items-center gap-3
                           px-3 py-2.5 rounded-lg
                           text-sm font-medium text-gray-700
                           hover:bg-gray-50 transition text-left"
              >
                <span>✏️</span>
                <span>Edit Module</span>
              </button>

              {/* Delete Module */}
              <button
                type="button"
                onClick={() => {
                  setDeletingModule(module);
                  setShowDeleteModuleModal(true);
                  setActiveModuleMenu(null);
                }}
                className="w-full flex items-center gap-3
                           px-3 py-2.5 rounded-lg
                           text-sm font-medium text-red-600
                           hover:bg-red-50 transition text-left"
              >
                <span>🗑️</span>
                <span>Delete Module</span>
              </button>

            </div>
          )}

        </div>
      </div>

      {/* LESSONS */}
      {expandedModules.includes(module.id) && (
        <div className="border-t border-gray-100 bg-gray-50/50">

          {/* Existing Lessons */}
          {module.items.length > 0 ? (
            module.items.map((lesson, index) => (
              <div
                key={`${module.id}-${index}`}
                className="flex items-center gap-3 px-5 py-3
                           border-b border-gray-100 last:border-0"
              >

                {/* Number */}
                <div
                  className="w-7 h-7 shrink-0 rounded-lg
                             bg-white border border-gray-200
                             flex items-center justify-center
                             text-xs font-semibold text-gray-500"
                >
                  {index + 1}
                </div>

                {/* Icon */}
                <FileText
                  size={16}
                  className="text-gray-400 shrink-0"
                />

                {/* Lesson */}
                <span className="text-sm text-gray-700 flex-1">
                  {lesson}
                </span>

                {/* Edit Lesson */}
                <button
                  type="button"
                  onClick={() => {
                    setEditingLesson({
                      moduleId: module.id,
                      lessonIndex: index,
                    });

                    setEditLessonTitle(lesson);
                    setShowEditLessonModal(true);
                  }}
                  className="text-xs font-semibold
                             text-[#5d0f2d] hover:underline"
                >
                  Edit
                </button>

              </div>
            ))
          ) : (
            <div className="px-5 py-5 text-center">
              <p className="text-sm text-gray-400">
                No lessons added yet.
              </p>
            </div>
          )}

          {/* Add Lesson */}
          <button
            type="button"
            onClick={() => {
              setSelectedModuleId(module.id);
              setNewLessonTitle("");
              setShowLessonModal(true);
            }}
            className="flex items-center gap-2 px-5 py-3
                       text-sm font-semibold text-[#5d0f2d]
                       hover:bg-[#5d0f2d]/5
                       w-full transition"
          >
            <Plus size={16} />
            Add Lesson
          </button>

        </div>
      )}

    </div>
  ))}
</div>
      



      {showModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">

          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">

            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Add New Module
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Create a new module for this course.
                </p>
              </div>

              <button
                onClick={() => setShowModuleModal(false)}
                className="w-9 h-9 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                ✕
              </button>
            </div>

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Module Title
            </label>

            <input
              type="text"
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              placeholder="e.g. React Fundamentals"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 outline-none focus:border-[#5d0f2d] focus:ring-2 focus:ring-[#5d0f2d]/10"
            />

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => setShowModuleModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleAddModule}
                className="px-5 py-2.5 rounded-xl bg-[#5d0f2d] text-white text-sm font-semibold hover:bg-[#4b0c24]"
              >
                Add Module
              </button>

            </div>

          </div>

        </div>
      )}


      {showLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">

          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-5">

              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Add New Lesson
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Add a lesson to this module.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowLessonModal(false);
                  setNewLessonTitle("");
                  setSelectedModuleId(null);
                }}
                className="w-9 h-9 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                ✕
              </button>

            </div>

            {/* Input */}
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Lesson Title
            </label>

            <input
              type="text"
              value={newLessonTitle}
              onChange={(e) => setNewLessonTitle(e.target.value)}
              placeholder="e.g. Introduction to React Hooks"
              autoFocus
              className="w-full h-11 px-4 rounded-xl border border-gray-200 outline-none focus:border-[#5d0f2d] focus:ring-2 focus:ring-[#5d0f2d]/10"
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => {
                  setShowLessonModal(false);
                  setNewLessonTitle("");
                  setSelectedModuleId(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleAddLesson}
                disabled={!newLessonTitle.trim()}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${newLessonTitle.trim()
                  ? "bg-[#5d0f2d] text-white hover:bg-[#4b0c24]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
              >
                Add Lesson
              </button>

            </div>

          </div>

        </div>
      )}



      {showEditLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">

          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">

            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Edit Lesson
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Update the lesson title.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowEditLessonModal(false);
                  setEditingLesson(null);
                  setEditLessonTitle("");
                }}
                className="w-9 h-9 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                ✕
              </button>
            </div>

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Lesson Title
            </label>

            <input
              type="text"
              value={editLessonTitle}
              onChange={(e) => setEditLessonTitle(e.target.value)}
              autoFocus
              className="w-full h-11 px-4 rounded-xl border border-gray-200 outline-none focus:border-[#5d0f2d] focus:ring-2 focus:ring-[#5d0f2d]/10"
            />

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => {
                  setShowEditLessonModal(false);
                  setEditingLesson(null);
                  setEditLessonTitle("");
                }}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleEditLesson}
                disabled={!editLessonTitle.trim()}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold ${editLessonTitle.trim()
                  ? "bg-[#5d0f2d] text-white hover:bg-[#4b0c24]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
              >
                Save Changes
              </button>

            </div>

          </div>
        </div>
      )}


      {showEditModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">

          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">

            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Edit Module
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Update the module title.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowEditModuleModal(false);
                  setEditingModule(null);
                  setEditModuleTitle("");
                }}
                className="w-9 h-9 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                ✕
              </button>
            </div>

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Module Title
            </label>

            <input
              type="text"
              value={editModuleTitle}
              onChange={(e) => setEditModuleTitle(e.target.value)}
              autoFocus
              className="w-full h-11 px-4 rounded-xl border border-gray-200 outline-none focus:border-[#5d0f2d] focus:ring-2 focus:ring-[#5d0f2d]/10"
            />

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => {
                  setShowEditModuleModal(false);
                  setEditingModule(null);
                  setEditModuleTitle("");
                }}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleEditModule}
                disabled={!editModuleTitle.trim()}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold ${editModuleTitle.trim()
                    ? "bg-[#5d0f2d] text-white hover:bg-[#4b0c24]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
              >
                Save Changes
              </button>

            </div>

          </div>
        </div>
      )}

      {showDeleteModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">

          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">

            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              🗑️
            </div>

            <h3 className="text-lg font-bold text-gray-900">
              Delete Module?
            </h3>

            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">
                {deletingModule?.title}
              </span>
              ? All lessons inside this module will also be removed.
            </p>

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => {
                  setShowDeleteModuleModal(false);
                  setDeletingModule(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteModule}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
              >
                Delete Module
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}