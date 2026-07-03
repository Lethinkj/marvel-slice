import { useState, useRef, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import { FiMenu, FiExternalLink, FiLogOut } from 'react-icons/fi';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0" onClick={() => { if (!sidebarCollapsed) setSidebarCollapsed(true); }}>
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 flex items-center justify-between h-14 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-dark-navy hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Open sidebar"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <Link to="/admin" className="text-base font-bold text-brand-blue">
              Marvel Slice
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-1.5 text-sm text-text-gray hover:text-brand-accent transition-colors px-3 py-1.5 rounded-md hover:bg-gray-50"
            >
              <FiExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">View Site</span>
            </Link>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 ml-2 pl-3 pr-2 py-1.5 text-sm text-text-gray hover:text-dark-navy hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-accent to-brand-blue text-white flex items-center justify-center text-xs font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
                <span className="hidden sm:inline max-w-[120px] truncate">{user?.name || user?.email}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
                    <div className="font-medium text-dark-navy">{user?.name}</div>
                    <div>{user?.email}</div>
                    <div className="capitalize mt-0.5">{user?.role}</div>
                  </div>
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
