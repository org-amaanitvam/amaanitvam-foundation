import { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { BookOpen, Home, ExternalLink, LogOut, Menu, X, GraduationCap } from 'lucide-react';
import logo from '../assets/images/logo.jpg';
import './Layout.css';

export default function Layout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    navigate('/login', { replace: true });
  };

  const close = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-[#3d2b2b]">
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
      />

      <aside
        className={`lms-sidebar fixed top-0 left-0 h-screen w-64 flex flex-col z-50 bg-[#56051a] border-r border-[#d8a15f]/20 shadow-xl transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-6 py-6 border-b border-[#d8a15f]/10 bg-black/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Amaanitvam Foundation" className="brand-logo h-12 w-12 rounded bg-white object-contain p-1" />
            <div className="flex flex-col justify-center min-w-0">
              <h1 className="brand-title text-[22px] font-bold text-[#d8a15f] tracking-tight leading-none uppercase">
                Amaanitvam
              </h1>
              <p className="brand-subtitle text-[11px] text-white/70 uppercase tracking-[0.25em] font-semibold mt-1 leading-none">
                Learning Portal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="lg:hidden p-2 rounded-lg text-rose-200 hover:bg-[#8a164b]/40 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-5 px-4 space-y-2 [&::-webkit-scrollbar]:hidden scrollbar-none">
          <p className="text-[10px] text-white/50 uppercase tracking-[0.22em] font-bold px-1 pb-2">
            LMS Workspace
          </p>

          <p className="sidebar-section-title px-4 pt-2 pb-1 text-xs font-bold text-[#d8a15f]/70 uppercase tracking-[0.18em]">
            Learning
          </p>
          <NavLink to="/" end onClick={close} className="sidebar-nav-link">
            <Home className="w-4.5 h-4.5" />
            <span>Course Catalog</span>
          </NavLink>

          <p className="sidebar-section-title px-4 pt-4 pb-1 text-xs font-bold text-[#d8a15f]/70 uppercase tracking-[0.18em]">
            External
          </p>
          <a className="sidebar-nav-link" href="https://www.amaanitvam.org/src/pages/programs.html" target="_blank" rel="noreferrer">
            <BookOpen className="w-4.5 h-4.5" />
            <span>Programs</span>
            <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-60" />
          </a>
          <a className="sidebar-nav-link" href="https://www.amaanitvam.org/src/pages/login.html" target="_blank" rel="noreferrer">
            <LogOut className="w-4.5 h-4.5" />
            <span>Portal Login</span>
            <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-60" />
          </a>
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d8a15f] text-sm font-bold text-[#56051a]">
              AF
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">Guest Learner</p>
              <p className="truncate text-[11px] text-white/55">learning portal</p>
              <span className="mt-1 inline-block whitespace-nowrap rounded bg-[#d8a15f] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#56051a]">
                Public
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

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 flex h-16 items-center gap-3 bg-[#56051a] border-b border-[#d8a15f]/20 px-4 shadow-lg">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          className="p-2 rounded-lg text-rose-200 hover:bg-[#8a164b]/40 hover:text-white transition-colors cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>
        <Link to="/" className="flex items-center gap-2 text-white" onClick={close}>
          <GraduationCap className="w-6 h-6 text-[#d8a15f]" />
          <span className="brand-title text-[18px] font-bold text-[#d8a15f] tracking-tight leading-none uppercase">
            Amaanitvam
          </span>
        </Link>
      </header>

      <main className="lms-main flex-1 min-h-screen p-4 pt-20 lg:pt-6 lg:p-8 lg:ml-64">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            background: '#ffffff',
            color: '#3d2b2b',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#ffffff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
          },
        }}
      />
    </div>
  );
}
