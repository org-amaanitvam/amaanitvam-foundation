import {
  NavLink,
  useNavigate,
} from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Megaphone,
  FolderKanban,
  CalendarCheck,
  UserCircle,
  LogOut,
  BarChart3,
  Building2,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
import {
  useAuth,
} from "../../contexts/AuthContext";
import {
  canAccessPath,
} from "../../utils/accessControl";
import logo from "../../assets/images/logo.jpg";

const SECTIONS = [
  {
    title: "Overview",
    links: [
      {
        to: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
      {
        to: "/member-reports",
        label: "Team Reports",
        icon: BarChart3,
      },
      {
        to: "/attendance",
        label: "Attendance",
        icon: CalendarCheck,
      },
      {
        to: "/reports",
        label: "Reports",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Team",
    links: [
      {
        to: "/meetings",
        label: "Meetings",
        icon: CalendarDays,
      },
      {
        to: "/tasks",
        label: "Tasks",
        icon: ClipboardList,
      },
      {
        to: "/announcements",
        label: "Announcements",
        icon: Megaphone,
      },
      {
        to: "/projects",
        label: "Projects",
        icon: FolderKanban,
      },
      {
        to: "/departments",
        label: "Departments",
        icon: Building2,
      },
    ],
  },
  {
    title: "Account",
    links: [
      {
        to: "/profile",
        label: "My Profile",
        icon: UserCircle,
      },
    ],
  },
];

export default function Sidebar() {
  const {
    userProfile,
    logout,
  } = useAuth();

  const navigate = useNavigate();
  const [logoError, setLogoError] =
    useState(false);

  const role = String(
    userProfile?.role || "dashboard",
  ).toLowerCase();

  const displayName =
    userProfile?.name ||
    userProfile?.displayName ||
    userProfile?.email?.split("@")[0] ||
    "Dashboard User";

  const displayEmail =
    userProfile?.email || "";

  const displayRole = role
    .replaceAll("_", " ")
    .toUpperCase();

  const initials = useMemo(
    () =>
      displayName
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "DU",
    [displayName],
  );

  const navLinkClass = ({
    isActive,
  }) =>
    `sidebar-nav-link ${
      isActive ? "active" : ""
    }`;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Logout failed:",
        error,
      );
    }
  };

  return (
    <aside className="dashboard-sidebar fixed top-0 left-0 h-screen w-64 flex flex-col z-50 bg-[#56051a] border-r border-[#d8a15f]/20 shadow-xl">
      <div className="dashboard-sidebar__brand px-6 py-6 border-b border-[#d8a15f]/10 bg-black/20">
        <div className="flex items-center gap-2">
          {!logoError ? (
            <img
              src={logo}
              alt="Amaanitvam Foundation"
              className="brand-logo h-12 w-12 rounded bg-white object-contain p-1"
              onError={() =>
                setLogoError(true)
              }
            />
          ) : (
            <div className="dashboard-sidebar__logo-fallback flex h-12 w-12 shrink-0 items-center justify-center rounded bg-white text-sm font-extrabold text-[#56051a]">
              AF
            </div>
          )}

          <div className="flex flex-col justify-center min-w-0">
            <h1 className="brand-title text-[22px] font-bold text-[#d8a15f] tracking-tight leading-none uppercase">
              Amaanitvam
            </h1>
            <p className="brand-subtitle text-[11px] text-white/70 uppercase tracking-[0.25em] font-semibold mt-1 leading-none">
              Foundation
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-5 px-4 space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
        <p className="text-[10px] text-white/50 uppercase tracking-[0.22em] font-bold px-1 pb-2">
          Dashboard Panel
        </p>

        {SECTIONS.map((section) => {
          const links =
            section.links.filter((link) =>
              canAccessPath(
                userProfile,
                link.to,
              ),
            );

          if (!links.length) return null;

          return (
            <div key={section.title}>
              <p className="sidebar-section-title px-4 pt-4 pb-1 text-xs font-bold text-[#d8a15f]/70 uppercase tracking-[0.18em]">
                {section.title}
              </p>

              {links.map((link) => {
                const Icon = link.icon;

                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={
                      link.to ===
                      "/dashboard"
                    }
                    className={
                      navLinkClass
                    }
                  >
                    <Icon className="w-4.5 h-4.5" />
                    <span>
                      {link.label}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d8a15f] text-sm font-bold text-[#56051a]">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="truncate text-sm font-bold text-white"
              title={displayName}
            >
              {displayName}
            </p>

            {displayEmail && (
              <p
                className="truncate text-[11px] text-white/55"
                title={displayEmail}
              >
                {displayEmail}
              </p>
            )}

            <span className="mt-1 inline-block whitespace-nowrap rounded bg-[#d8a15f] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#56051a]">
              {displayRole}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
            className="rounded-lg p-2 text-[#d8a15f]/70 transition-colors duration-300 hover:bg-[#d8a15f]/10 hover:text-[#d8a15f]"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
