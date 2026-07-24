import { useState, useRef, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import CommandPalette from "../components/ui/CommandPalette";
import { ToastContainer } from "../components/Toast";
import { FiMenu, FiExternalLink, FiLogOut, FiChevronRight, FiGrid, FiSearch, FiBell } from "react-icons/fi";

function Breadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length <= 1) return null;

  const labels = {
    courses: "Courses",
    wizard: "Add Course",
    reports: "Reports",
    tags: "Tags",
    home: "Home",
    blog: "Blog",
    categories: "Categories",
    footer: "Footer",
    media: "Media Library",
    "nav-menu": "Navigation",
    "site-settings": "Site Settings",
    "admin-users": "Admin Users",
    "about-page": "About",
    "contact-page": "Contact",
    "career-page": "Career",
    "services-page": "Services",
    "training-page": "Training",
    "form-submissions": "Form Submissions",
    "contact-submissions": "Contact Submissions",
    "chat-submissions": "Chat Submissions",
    "career-submissions": "Career Submissions",
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500">
      <Link to="/admin" className="hover:text-indigo-600 transition-colors font-medium">Dashboard</Link>
      {parts.map((part, i) => {
        const path = "/" + parts.slice(0, i + 1).join("/");
        const label = labels[part] || part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
        const isLast = i === parts.length - 1;
        return (
          <span key={path} className="flex items-center gap-1.5">
            <FiChevronRight className="w-3 h-3 text-slate-300" />
            {isLast ? (
              <span className="text-slate-700 font-medium truncate max-w-[200px]">{label}</span>
            ) : (
              <Link to={path} className="hover:text-indigo-600 transition-colors truncate max-w-[150px] font-medium">{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    function handleKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 backdrop-blur-md bg-white/80 border-b border-slate-200/80 px-4 lg:px-6 flex items-center justify-between h-14 shrink-0 gap-4 transition-all">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200">
              <FiMenu className="w-5 h-5" />
            </button>
            <div className="hidden lg:flex min-w-0"><Breadcrumbs /></div>
            <Link to="/admin" className="flex items-center gap-2 text-sm font-semibold text-slate-900 lg:hidden">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <FiGrid className="w-3 h-3 text-white" />
              </div>
              Marvel Slice
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all duration-200 bg-slate-50/50 min-w-[180px]"
            >
              <FiSearch className="w-3.5 h-3.5" />
              <span className="flex-1 text-left">Search pages...</span>
              <kbd className="text-[10px] text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.5 font-mono shadow-sm">⌘K</kbd>
            </button>
            <button className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200" onClick={() => setSearchOpen(true)}>
              <FiSearch className="w-4 h-4" />
            </button>

            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200">
              <FiBell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>

            <Link to="/" target="_blank" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200">
              <FiExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">View Site</span>
            </Link>

            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 ml-1 pl-3 pr-2 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200">
                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
                <span className="hidden sm:inline max-w-[100px] truncate">{user?.name || user?.email}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 py-1 z-50">
                  <div className="px-3 py-2 text-xs text-slate-500 border-b border-slate-100">
                    <div className="font-medium text-slate-900">{user?.name}</div>
                    <div className="truncate">{user?.email}</div>
                    <div className="capitalize mt-0.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">{user?.role}</span>
                    </div>
                  </div>
                  <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-all duration-200">
                    <FiLogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 admin-scrollbar">
          <div className="lg:hidden mb-3"><Breadcrumbs /></div>
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
