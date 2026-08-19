import { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { BookOpen, Home, ExternalLink, LogOut, Menu, X, GraduationCap, LogIn } from 'lucide-react';
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
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={close}
      />

      <aside
        className={`lms-sidebar fixed top-0 left-0 h-screen w-64 flex flex-col z-50 bg-[#56051a] border-r border-[#d8a15f]/20 shadow-xl transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="relative px-6 py-6 border-b border-[#d8a15f]/10 bg-black/20 flex items-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="h-11 w-11 rounded-sm overflow-hidden flex items-center justify-center">
              <img src={logo} alt="Amaanitvam Foundation" className="h-full w-full p-0.5 object-contain transition-transform duration-300 hover:scale-105" />
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
            onClick={close}
            aria-label="Close menu"
            className="lg:hidden absolute right-2 top-5 -translate-y-1/2 p-2 rounded-lg text-rose-200 hover:bg-[#8a164b]/40 hover:text-white transition-colors cursor-pointer"
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
          <NavLink to="/resources" end onClick={close} className="sidebar-nav-link">
            <BookOpen className="w-4.5 h-4.5" />
            <span>Resources Catalog</span>
          </NavLink>

          <p className="sidebar-section-title px-4 pt-4 pb-1 text-xs font-bold text-[#d8a15f]/70 uppercase tracking-[0.18em]">
            External
          </p>
          <a className="sidebar-nav-link" href="https://www.amaanitvam.org/src/pages/programs.html" target="_blank" rel="noreferrer">
            <BookOpen className="w-4.5 h-4.5" />
            <span>Programs</span>
            <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-60" />
          </a>
          <a className="sidebar-nav-link" href="https://amaanitvam-common-login.onrender.com" target="_blank" rel="noreferrer">
            <LogOut className="w-4.5 h-4.5" />
            <span>Portal Login</span>
            <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-60" />
          </a>
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="rounded-xl border border-[#d8a15f]/15 bg-white/3 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#8a164b] to-[#d8a15f] text-white shadow-md">
                <GraduationCap className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  Guest User
                </p>
                <p className="truncate text-[10px] text-white/50">
                  Sign in to access your account
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[#8a164b] to-[#a51f55] px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-300 hover:from-[#a51f55] hover:to-[#8a164b] hover:shadow-[0_4px_15px_rgba(138,22,75,0.3)]"
            >
              <LogIn className="h-4 w-4" />
              Sign In
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
