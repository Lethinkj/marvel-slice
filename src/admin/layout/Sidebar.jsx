import { useState, useEffect, useCallback } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { FiHome, FiFile, FiBookOpen, FiGrid, FiChevronDown, FiFileText, FiLayers, FiInbox, FiMenu, FiGlobe, FiSettings, FiMessageCircle, FiServer, FiZap } from "react-icons/fi";

const navGroups = [
  { label: "Dashboard", icon: FiHome, items: [{ to: "/admin", label: "Dashboard" }] },
  {
    label: "Edit Pages", icon: FiFile,
    items: [
      {
        label: "Home", children: [
          { to: "/admin/home/hero", label: "Hero Banner" },
          { to: "/admin/home/intro_form", label: "Intro + Form" },
          { to: "/admin/home/empowering", label: "Empowering Careers" },
          { to: "/admin/home/featured_courses", label: "Feature Cards" },
          { to: "/admin/home/services", label: "Featured Services" },
          { to: "/admin/home/cta_banner", label: "CTA Banner" },
          { to: "/admin/home/faqs", label: "FAQs" },
          { to: "/admin/home/alumni", label: "Alumni Partners" },
        ],
      },
      { to: "/admin/about-page", label: "About" },
      { to: "/admin/career-page", label: "Career" },
      { to: "/admin/contact-page", label: "Contact" },
    ],
  },
  { label: "Chat", icon: FiMessageCircle, items: [
    { to: "/admin/chats?tab=live", label: "Live Chat" },
    { to: "/admin/chats?tab=history", label: "Chat History" },
  ]},
  {
    label: "Services", icon: FiServer, parentTo: "/admin/services", items: [
      { to: "/admin/services", label: "All Services", catchSubRoutes: true, siblingRoutes: ["/admin/services/new"] },
      { to: "/admin/services/new", label: "Add Service" },
      { to: "/admin/service-categories", label: "Categories" },
      { to: "/admin/services-page", label: "Services Page" },
    ],
  },
  {
    label: "Training", icon: FiZap, parentTo: "/admin/training", items: [
      { to: "/admin/training", label: "All Programs", catchSubRoutes: true, siblingRoutes: ["/admin/training/new"] },
      { to: "/admin/training/new", label: "Add Program" },
      { to: "/admin/training-categories", label: "Categories" },
      { to: "/admin/training-page", label: "Training Page" },
    ],
  },
  { label: "Submissions", icon: FiInbox, items: [
    { to: "/admin/career-submissions", label: "Career Submissions" },
    { to: "/admin/brochure-downloads", label: "Brochure Downloads" },
    { to: "/admin/form-submissions", label: "Form Submissions" },
    { to: "/admin/contact-submissions", label: "Contact Submissions" },
    { to: "/admin/chat-submissions", label: "Chat Submissions" },
  ]},
  {
    label: "Courses", icon: FiBookOpen, items: [
      { to: "/admin/courses", label: "All Courses", catchSubRoutes: true, siblingRoutes: ["/admin/courses/wizard", "/admin/courses/reports"] },
      { to: "/admin/courses/wizard", label: "Add Course" },
      { to: "/admin/tags", label: "Tags" },
      { to: "/admin/courses/reports", label: "Reports" },
    ],
  },
  {
    label: "Blog", icon: FiFileText, items: [
      { to: "/admin/blog", label: "All Posts", catchSubRoutes: true, siblingRoutes: ["/admin/blog/categories"] },
      { to: "/admin/blog/categories", label: "Categories" },
    ],
  },
  { label: "Navigation", icon: FiMenu, items: [
    { to: "/admin/nav-menu?section=Software%20Learning", label: "Software Learning" },
    { to: "/admin/nav-menu?section=Competitive%20Exam", label: "Competitive Exam" },
    { to: "/admin/nav-menu?section=Services", label: "Services" },
    { to: "/admin/nav-menu?section=Training", label: "Training" },
    { to: "/admin/nav-menu/manage", label: "Manage Sub-items" },
  ]},
  { label: "Appearance", icon: FiLayers, items: [
    { to: "/admin/footer", label: "Footer" },
    { to: "/admin/media", label: "Media Library" },
  ]},
  { label: "Social", icon: FiGlobe, items: [
    { to: "/admin/site-settings", label: "Social Links" },
  ]},
  { label: "Settings", icon: FiSettings, items: [
    { to: "/admin/site-settings", label: "Site Settings" },
    { to: "/admin/admin-users", label: "Admin Users" },
  ]},
];

function isActive(pathname, item) {
  const fullPath = pathname.split("?")[0] || "/";
  const fullSearch = pathname.includes("?") ? "?" + pathname.split("?").slice(1).join("?") : "";
  const itemPath = (item.to.split("?")[0].replace(/\/$/, "") || "/");
  const itemSearch = item.to.includes("?") ? "?" + item.to.split("?").slice(1).join("?") : "";
  if (fullPath.replace(/\/$/, "") === itemPath && fullSearch === itemSearch) return true;

  if (item.catchSubRoutes && fullPath.replace(/\/$/, "").startsWith(itemPath + "/")) {
    const nextSeg = fullPath.replace(/\/$/, "").slice(itemPath.length + 1).split("/")[0];
    if (item.siblingRoutes) {
      for (const sib of item.siblingRoutes) {
        if (sib.split("/").filter(Boolean).pop() === nextSeg) return false;
      }
    }
    return true;
  }

  return false;
}

const STORAGE_KEY = 'admin_sidebar_groups';

function loadGroupState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

function saveGroupState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function useGroupOpen(pathname) {
  const [groupState, setGroupState] = useState(() => {
    const saved = loadGroupState();
    const idx = navGroups.findIndex((g) =>
      g.items.some((item) => {
        if (item.to) return isActive(pathname, item);
        if (item.children) return item.children.some((c) => isActive(pathname, c));
        return false;
      })
    );
    const next = {};
    navGroups.forEach((_, i) => { next[String(i)] = false; });
    if (idx >= 0) next[String(idx)] = true;
    else if (saved) {
      const firstOpen = Object.keys(saved).find((k) => saved[k]);
      if (firstOpen) next[firstOpen] = true;
    }
    saveGroupState(next);
    return next;
  });

  useEffect(() => {
    const idx = navGroups.findIndex((g) =>
      g.items.some((item) => {
        if (item.to) return isActive(pathname, item);
        if (item.children) return item.children.some((c) => isActive(pathname, c));
        return false;
      })
    );
    setGroupState((prev) => {
      if (idx >= 0 && prev[String(idx)]) return prev;
      const next = {};
      navGroups.forEach((_, i) => { next[String(i)] = false; });
      if (idx >= 0) next[String(idx)] = true;
      saveGroupState(next);
      return next;
    });
  }, [pathname]);

  const toggleGroup = useCallback((idx) => {
    setGroupState((prev) => {
      const key = String(idx);
      const currentlyOpen = prev[key];
      const next = {};
      navGroups.forEach((_, i) => { next[String(i)] = false; });
      if (!currentlyOpen) next[key] = true;
      saveGroupState(next);
      return next;
    });
  }, []);

  const isOpen = useCallback((idx) => !!groupState[String(idx)], [groupState]);

  return [isOpen, toggleGroup];
}

function NestedNavGroup({ item, pathname, onNavigate }) {
  const [open, setOpen] = useState(() => item.children.some((c) => isActive(pathname, c)));
  useEffect(() => {
    if (item.children.some((c) => isActive(pathname, c))) setOpen(true);
  }, [pathname, item.children]);

  return (
    <div>
      <button onClick={() => setOpen((p) => !p)} className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${item.children.some((c) => isActive(pathname, c)) ? "text-indigo-400 font-semibold" : "text-slate-400 hover:text-slate-200"}`}>
        <FiChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "" : "-rotate-90"}`} />
        {item.label}
      </button>
      {open && (
        <div className="ml-3 pl-2 border-l border-slate-700/50 mt-0.5 mb-1 space-y-0.5 transition-all duration-200">
          {item.children.map((child) => (
            <NavLink key={child.to} to={child.to} onClick={onNavigate} end className={({ isActive: act }) =>
              `block px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${act ? "text-indigo-400 font-semibold bg-indigo-500/10" : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/30"}`
            }>
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarNav({ group, idx, pathname, isOpen, onToggle, onNavigate }) {
  const Icon = group.icon;
  const groupActive = group.items.some((item) => {
    if (item.to) return isActive(pathname, item);
    if (item.children) return item.children.some((c) => isActive(pathname, c));
    return false;
  });
  const opened = isOpen(idx);

  if (group.items.length === 1 && group.items[0].to) {
    return (
      <NavLink to={group.items[0].to} end onClick={onNavigate}
        className={({ isActive: act }) =>
          `w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${act ? 'text-indigo-400 font-semibold bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'}`
        }
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span>{group.label}</span>
      </NavLink>
    );
  }

  if (group.parentTo) {
    return (
      <>
        <div className="flex items-center">
          <NavLink to={group.parentTo} end onClick={onNavigate}
            className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${groupActive ? 'text-indigo-400 font-semibold bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'}`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{group.label}</span>
          </NavLink>
          <button onClick={() => onToggle(idx)}
            className="p-2 mr-1 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-700/30 transition-all duration-200"
          >
            <FiChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${opened ? '' : '-rotate-90'}`} />
          </button>
        </div>
        {opened && (
          <div className="ml-2 pl-2 mt-0.5 space-y-0.5 transition-all duration-200">
            {group.items.map((item) => {
              if (item.children) return <NestedNavGroup key={item.label} item={item} pathname={pathname} onNavigate={onNavigate} />;
              const act = isActive(pathname, item);
              return (
                <Link key={item.to} to={item.to} onClick={onNavigate}
                  className={`block px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${act ? 'text-indigo-400 font-semibold bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <button onClick={() => onToggle(idx)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${groupActive ? 'text-indigo-400 font-semibold bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'}`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left">{group.label}</span>
        <FiChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${opened ? '' : '-rotate-90'}`} />
      </button>
      {opened && (
        <div className="ml-2 pl-2 mt-0.5 space-y-0.5 transition-all duration-200">
          {group.items.map((item) => {
            if (item.children) return <NestedNavGroup key={item.label} item={item} pathname={pathname} onNavigate={onNavigate} />;
            const act = isActive(pathname, item);
            return (
              <Link key={item.to} to={item.to} onClick={onNavigate}
                className={`block px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${act ? 'text-indigo-400 font-semibold bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const { pathname } = useLocation();
  const [isOpen, toggleGroup] = useGroupOpen(pathname);

  const content = (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="flex items-center justify-between h-14 shrink-0 px-4 border-b border-slate-800">
        <NavLink to="/admin" className="flex items-center gap-2.5 min-w-0 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            <FiGrid className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-semibold text-slate-100 block leading-tight">Marvel Slice</span>
            <span className="text-[11px] text-slate-500 font-medium">Management Portal</span>
          </div>
        </NavLink>
        <button onClick={onMobileClose} className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all duration-200">
          <FiChevronDown className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 admin-scrollbar">
        {navGroups.map((group, idx) => (
          <SidebarNav key={group.label} group={group} idx={idx} pathname={pathname} isOpen={isOpen} onToggle={toggleGroup} onNavigate={onMobileClose} />
        ))}
      </nav>

      <div className="px-4 py-3 shrink-0 border-t border-slate-800">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-slate-800/50">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[9px] font-bold text-white shrink-0 shadow-sm">M</div>
          <div className="min-w-0">
            <p className="text-xs text-slate-300 font-medium">Marvel Slice v2.0</p>
            <p className="text-[10px] text-slate-500">Admin Panel</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col w-60 shrink-0 h-screen overflow-hidden bg-slate-900 transition-all duration-300">{content}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="fixed left-0 top-0 h-full w-72 shadow-2xl z-50 overflow-hidden bg-slate-900" role="dialog" aria-modal="true" aria-label="Sidebar navigation">{content}</aside>
        </div>
      )}
    </>
  );
}
