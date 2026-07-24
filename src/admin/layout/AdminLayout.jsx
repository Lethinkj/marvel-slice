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
    "career-submissions": "Career Submissions",
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs text-neutral-400">
      <Link to="/admin" className="hover:text-accent-600 transition-colors">Dashboard</Link>
      {parts.map((part, i) => {
        const path = "/" + parts.slice(0, i + 1).join("/");
        const label = labels[part] || part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
        const isLast = i === parts.length - 1;
        return (
          <span key={path} className="flex items-center gap-1.5">
            <FiChevronRight className="w-3 h-3" />
            {isLast ? (
              <span className="text-neutral-600 font-medium truncate max-w-[200px]">{label}</span>
            ) : (
              <Link to={path} className="hover:text-accent-600 transition-colors truncate max-w-[150px]">{label}</Link>
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
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} onSearchOpen={() => setSearchOpen(true)} />
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-neutral-200 px-4 lg:px-6 flex items-center justify-between h-14 shrink-0 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors">
              <FiMenu className="w-5 h-5" />
            </button>
            <div className="hidden lg:flex min-w-0"><Breadcrumbs /></div>
            <Link to="/admin" className="flex items-center gap-2 text-sm font-semibold text-neutral-900 lg:hidden">
              <div className="w-6 h-6 rounded bg-accent-600 flex items-center justify-center">
                <FiGrid className="w-3 h-3 text-white" />
              </div>
              Marvel Slice
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs text-neutral-400 hover:text-neutral-600 hover:border-neutral-300 transition-colors bg-neutral-50 min-w-[180px]"
            >
              <FiSearch className="w-3.5 h-3.5" />
              <span className="flex-1 text-left">Search pages...</span>
              <kbd className="text-[10px] text-neutral-400 bg-white border border-neutral-200 rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
            </button>
            <button className="lg:hidden p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors" onClick={() => setSearchOpen(true)}>
              <FiSearch className="w-4 h-4" />
            </button>

            <button className="relative p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors">
              <FiBell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive-500 rounded-full" />
            </button>

            <Link to="/" target="_blank" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
              <FiExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">View Site</span>
            </Link>

            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 ml-1 pl-3 pr-2 py-1.5 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
                <span className="w-6 h-6 rounded-full bg-accent-600 text-white flex items-center justify-center text-xs font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
                <span className="hidden sm:inline max-w-[100px] truncate">{user?.name || user?.email}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-elevated border border-neutral-200 py-1 z-50">
                  <div className="px-3 py-2 text-xs text-neutral-500 border-b border-neutral-100">
                    <div className="font-medium text-neutral-900">{user?.name}</div>
                    <div className="truncate">{user?.email}</div>
                    <div className="capitalize mt-0.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent-50 text-accent-700">{user?.role}</span>
                    </div>
                  </div>
                  <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive-500 hover:bg-destructive-50 transition-colors">
                    <FiLogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 admin-scrollbar">
          <div className="lg:hidden mb-3"><Breadcrumbs /></div>
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
