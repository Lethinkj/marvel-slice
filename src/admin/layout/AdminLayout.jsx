import { useState, useRef, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import { ToastContainer } from "../components/Toast";
import { FiMenu, FiExternalLink, FiLogOut, FiChevronRight, FiGrid } from "react-icons/fi";

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
    "promo-banner": "Promo Banner",
    "form-submissions": "Form Submissions",
    "career-submissions": "Career Submissions",
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-3">
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
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0" onClick={() => { if (sidebarOpen) setSidebarOpen(false); }}>
        {/* Header */}
        <header className="bg-white border-b border-neutral-200 px-4 lg:px-6 flex items-center justify-between h-14 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors">
              <FiMenu className="w-5 h-5" />
            </button>
            <Link to="/admin" className="flex items-center gap-2 text-sm font-semibold text-neutral-900 lg:hidden">
              <div className="w-6 h-6 rounded bg-accent-600 flex items-center justify-center">
                <FiGrid className="w-3 h-3 text-white" />
              </div>
              Marvel Slice
            </Link>
          </div>

          <div className="flex items-center gap-1.5">
            <Link to="/" target="_blank" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
              <FiExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">View Site</span>
            </Link>

            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 ml-1 pl-3 pr-2 py-1.5 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
                <span className="w-6 h-6 rounded-full bg-accent-600 text-white flex items-center justify-center text-xs font-bold">{user?.name?.charAt(0)?.toUpperCase() || "A"}</span>
                <span className="hidden sm:inline max-w-[120px] truncate">{user?.name || user?.email}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-neutral-200 py-1 z-50">
                  <div className="px-3 py-2 text-xs text-neutral-500 border-b border-neutral-100">
                    <div className="font-medium text-neutral-900">{user?.name}</div>
                    <div>{user?.email}</div>
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
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
