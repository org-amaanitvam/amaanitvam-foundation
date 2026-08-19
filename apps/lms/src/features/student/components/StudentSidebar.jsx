import logo from "../../../assets/images/logo.jpg";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, Calendar, HelpCircle, FileCheck, ClipboardCheck, Megaphone, BarChart3, Bell, Settings, LifeBuoy, LogOut, UserCheck, Library, X, Home } from "lucide-react";
import Layout from "../../../layouts/Layout";

const studentNavSections = [
  {
    title: "Learner Workspace",
    items: [
      {
        name: "Dashboard",
        path: "/student/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },

  {
    title: "Learning",
    items: [
      {
        name: "My Courses",
        path: "/student/courses",
        icon: BookOpen,
      },
      {
        name: "My Sessions",
        path: "/student/sessions",
        icon: Calendar,
      },
    ],
  },

  {
    title: "Digital Library",
    items: [
      {
        name: "Resource Library",
        path: "/student/library",
        icon: Library,
      },
    ],
  },

  {
    title: "Support",
    items: [
      {
        name: "Ask Doubts",
        path: "/student/doubts",
        icon: HelpCircle,
      },
    ],
  },

  {
    title: "Assessments",
    items: [
      {
        name: "Assignments",
        path: "/student/assignments",
        icon: FileCheck,
      },
      {
        name: "Attendance",
        path: "/student/attendance",
        icon: ClipboardCheck,
      },
    ],
  },

  {
    title: "Engagement",
    items: [
      {
        name: "My Applications",
        path: "/student/applications",
        icon: UserCheck,
      },
      {
        name: "Announcements",
        path: "/student/announcements",
        icon: Megaphone,
      },
      {
        name: "Analytics",
        path: "/student/analytics",
        icon: BarChart3,
      },
      {
        name: "Notifications",
        path: "/student/notifications",
        icon: Bell,
      },
    ],
  },

  {
    title: "Account",
    items: [
      {
        name: "Settings",
        path: "/student/settings",
        icon: Settings,
      },
      {
        name: "Help & Support",
        path: "/student/help",
        icon: LifeBuoy,
      },
    ],
  },
];

export default function StudentSidebar({
  onLogout,
  userProfile,
  open,
  onClose,
}) {
  const navigate = useNavigate();

  const displayName =
    userProfile?.displayName ||
    userProfile?.name ||
    "Student Learner";

  const initials =
    String(displayName).trim().charAt(0).toUpperCase() || "S";

  return (
    <aside
      className={`w-64 bg-[#56051a] text-white flex flex-col min-h-screen shadow-xl border-r border-[#d8a15f]/20 shrink-0 fixed lg:static inset-y-0 left-0 z-50 transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"
        }`}
    >
      {/* Logo / Portal Header */}
      <div className="relative px-6 py-6 border-b border-[#d8a15f]/10 bg-black/20 flex items-center">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="h-11 w-11 rounded-sm overflow-hidden flex items-center justify-center">
            <img
              src={logo}
              alt="Amaanitvam Foundation"
              className="h-full w-full p-0.5 object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>

          <div className="flex flex-col justify-center min-w-0 text-left">
            <h1 className="brand-title text-[20px] font-bold text-[#d8a15f] tracking-tight leading-none uppercase">
              Amaanitvam
            </h1>

            <p className="text-[11px] text-white/70 uppercase tracking-[0.25em] font-semibold mt-1 leading-none">
              Student Portal
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="lg:hidden absolute right-2 top-5 -translate-y-1/2 p-2 rounded-lg text-rose-200 hover:bg-[#8a164b]/40 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-5 px-4 space-y-5 [&::-webkit-scrollbar]:hidden scrollbar-none">
        {studentNavSections.map((section) => (
          <div key={section.title}>
            <p className="text-[10px] text-white/50 uppercase tracking-[0.22em] font-bold px-1 pb-2">
              {section.title}
            </p>

            <div className="space-y-1.5">
              {section.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                        ? "bg-[#8a164b] text-white shadow-md shadow-[#8a164b]/40 font-semibold"
                        : "text-rose-100/80 hover:bg-[#8a164b]/30 hover:text-white"
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 text-rose-200 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-[#d8a15f]/10">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d8a15f] text-sm font-bold text-[#56051a]">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">
              {displayName}
            </p>

            <p className="truncate text-[11px] text-white/55">
              {userProfile?.email || "student@amaanitvam.org"}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-200 hover:bg-rose-900/50 hover:text-white transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-5 h-5 text-rose-300" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}