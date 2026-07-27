import { useState, useRef, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import CommandPalette from "../components/ui/CommandPalette";
import { ToastContainer } from "../components/Toast";
import { FiMenu, FiExternalLink, FiLogOut, FiChevronRight, FiGrid, FiSearch, FiBell, FiMessageCircle, FiClock } from "react-icons/fi";
import { trackLogout } from "../../lib/analytics";

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
    <nav className="flex items-center gap-1.5 text-xs text-neutral-500">
      <Link to="/admin" className="hover:text-neutral-700 transition-colors font-medium">Dashboard</Link>
      {parts.map((part, i) => {
        const path = "/" + parts.slice(0, i + 1).join("/");
        const label = labels[part] || part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
        const isLast = i === parts.length - 1;
        return (
          <span key={path} className="flex items-center gap-1.5">
            <FiChevronRight className="w-3 h-3 text-neutral-300" />
            {isLast ? (
              <span className="text-neutral-700 font-medium truncate max-w-[200px]">{label}</span>
            ) : (
              <Link to={path} className="hover:text-neutral-700 transition-colors truncate max-w-[150px] font-medium">{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

function relativeTime(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadChats, setUnreadChats] = useState([]);
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    async function fetchUnread() {
      const { data } = await supabase
        .from('conversations')
        .select('id, user_name, last_message, last_message_sender, last_message_at, status')
        .eq('notified', true)
        .order('last_message_at', { ascending: false });
      setUnreadChats(data || []);
    }
    fetchUnread();

    const channel = supabase
      .channel('admin-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
        fetchUnread();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    function handleKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="flex h-screen bg-[#EEEEEE] overflow-hidden">
      <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 backdrop-blur-md bg-white/80 border-b border-admin-200/80 px-4 lg:px-6 flex items-center justify-between h-14 shrink-0 gap-4 transition-all">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-neutral-600 hover:bg-admin-100 rounded-lg transition-all duration-200">
              <FiMenu className="w-5 h-5" />
            </button>
            <div className="hidden lg:flex min-w-0"><Breadcrumbs /></div>
            <Link to="/admin" className="flex items-center gap-2 text-sm font-semibold text-neutral-900 lg:hidden">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-admin-500 to-admin-800 flex items-center justify-center">
                <FiGrid className="w-3 h-3 text-white" />
              </div>
              Marvel Slice
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-admin-200 text-xs text-neutral-400 hover:text-neutral-600 hover:border-admin-300 transition-all duration-200 bg-white/50 min-w-[180px]"
            >
              <FiSearch className="w-3.5 h-3.5" />
              <span className="flex-1 text-left">Search pages...</span>
              <kbd className="text-[10px] text-neutral-400 bg-white border border-admin-200 rounded px-1.5 py-0.5 font-mono shadow-sm">⌘K</kbd>
            </button>
            <button className="lg:hidden p-2 text-neutral-400 hover:text-neutral-600 hover:bg-admin-100 rounded-lg transition-all duration-200" onClick={() => setSearchOpen(true)}>
              <FiSearch className="w-4 h-4" />
            </button>

            <div className="relative" ref={notifRef}>
              <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 text-neutral-400 hover:text-neutral-600 hover:bg-admin-100 rounded-lg transition-all duration-200">
                <FiBell className="w-5 h-5" />
                {unreadChats.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[11px] font-bold text-white bg-destructive-500 rounded-full ring-2 ring-white leading-none">
                    {unreadChats.length > 9 ? '9+' : unreadChats.length}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-admin-200 z-50 max-h-96 flex flex-col">
                  <div className="px-4 py-3 border-b border-admin-100">
                    <h3 className="text-sm font-semibold text-neutral-900">Notifications</h3>
                    <p className="text-xs text-neutral-500">{unreadChats.length} unread chat{unreadChats.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {unreadChats.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-neutral-400">No new notifications</div>
                    ) : (
                      unreadChats.map(chat => (
                        <Link
                          key={chat.id}
                          to="/admin/chats?tab=live"
                          onClick={() => setNotifOpen(false)}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-admin-50 transition-colors border-b border-admin-100 last:border-0"
                        >
                          <div className="w-8 h-8 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0 mt-0.5">
                            <FiMessageCircle className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-neutral-900 truncate">{chat.user_name || 'Anonymous'}</p>
                            <p className="text-xs text-neutral-500 truncate mt-0.5">{chat.last_message || 'New conversation'}</p>
                            <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
                              <FiClock className="w-3 h-3" />
                              {chat.last_message_at ? relativeTime(chat.last_message_at) : 'Just now'}
                            </p>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                  <Link
                    to="/admin/chats?tab=live"
                    onClick={() => setNotifOpen(false)}
                    className="block px-4 py-2.5 text-center text-xs font-medium text-admin-600 hover:text-admin-700 hover:bg-admin-50 rounded-b-xl border-t border-admin-100 transition-colors"
                  >
                    View all chats
                  </Link>
                </div>
              )}
            </div>

            <Link to="/" target="_blank" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-neutral-500 hover:text-neutral-700 hover:bg-admin-100 transition-all duration-200">
              <FiExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">View Site</span>
            </Link>

            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 ml-1 pl-3 pr-2 py-1.5 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-admin-100 rounded-lg transition-all duration-200">
                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-admin-500 to-admin-800 text-white flex items-center justify-center text-xs font-bold shadow-sm">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
                <span className="hidden sm:inline max-w-[100px] truncate">{user?.name || user?.email}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-2xl border border-admin-200 py-1 z-50">
                  <div className="px-3 py-2 text-xs text-neutral-500 border-b border-admin-100">
                    <div className="font-medium text-neutral-900">{user?.name}</div>
                    <div className="truncate">{user?.email}</div>
                    <div className="capitalize mt-0.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white text-neutral-700">{user?.role}</span>
                    </div>
                  </div>
                  <button onClick={() => { trackLogout(); logout(); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive-500 hover:bg-destructive-50 transition-all duration-200">
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
