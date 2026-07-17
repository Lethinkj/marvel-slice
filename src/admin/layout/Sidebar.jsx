import { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { FiHome, FiFile, FiBookOpen, FiGrid, FiChevronDown, FiFileText, FiLayers, FiInbox, FiMenu, FiGlobe, FiSettings, FiSearch, FiMessageCircle } from "react-icons/fi";

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
          { to: "/admin/home/promo_banner", label: "Promo Banner" },
          { to: "/admin/home/alumni", label: "Alumni Partners" },
        ],
      },
      { to: "/admin/about-page", label: "About" },
      { to: "/admin/career-page", label: "Career" },
      { to: "/admin/contact-page", label: "Contact" },
      { to: "/admin/services-page", label: "Services" },
      { to: "/admin/training-page", label: "Training" },
    ],
  },
  { label: "Live Chat", icon: FiMessageCircle, items: [{ to: "/admin/chats", label: "Chat" }] },
  { label: "Submissions", icon: FiInbox, items: [
    { to: "/admin/career-submissions", label: "Career Submissions" },
    { to: "/admin/brochure-downloads", label: "Brochure Downloads" },
    { to: "/admin/form-submissions", label: "Form Submissions" },
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
  const p = pathname.split("?")[0].replace(/\/$/, "") || "/";
  const to = item.to.replace(/\/$/, "") || "/";
  if (p === to) return true;

  // Parent items that catch sub-routes (e.g. /admin/courses catches /admin/courses/xxx)
  if (item.catchSubRoutes && p.startsWith(to + "/")) {
    const nextSeg = p.slice(to.length + 1).split("/")[0];
    if (item.siblingRoutes) {
      for (const sib of item.siblingRoutes) {
        if (sib.split("/").filter(Boolean).pop() === nextSeg) return false;
      }
    }
    return true;
  }

  return false;
}

function useGroupOpen(pathname) {
  const [openIndex, setOpenIndex] = useState(() => {
    const idx = navGroups.findIndex((g) =>
      g.items.some((item) => {
        if (item.to) return isActive(pathname, item);
        if (item.children) return item.children.some((c) => isActive(pathname, c));
        return false;
      })
    );
    return idx >= 0 ? idx : null;
  });

  useEffect(() => {
    const idx = navGroups.findIndex((g) =>
      g.items.some((item) => {
        if (item.to) return isActive(pathname, item);
        if (item.children) return item.children.some((c) => isActive(pathname, c));
        return false;
      })
    );
    if (idx >= 0) setOpenIndex(idx);
  }, [pathname]);

  return [openIndex, setOpenIndex];
}

function NestedNavGroup({ item, pathname, onNavigate }) {
  const [open, setOpen] = useState(() => item.children.some((c) => isActive(pathname, c)));
  useEffect(() => {
    if (item.children.some((c) => isActive(pathname, c))) setOpen(true);
  }, [pathname, item.children]);

  return (
    <div>
      <button onClick={() => setOpen((p) => !p)} className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${item.children.some((c) => isActive(pathname, c)) ? "text-accent-600 font-semibold" : "text-neutral-500 hover:text-neutral-700"}`}>
        <FiChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "" : "-rotate-90"}`} />
        {item.label}
      </button>
      {open && (
        <div className="ml-3 pl-2 border-l border-neutral-200 mt-0.5 mb-1 space-y-0.5">
          {item.children.map((child) => (
            <NavLink key={child.to} to={child.to} onClick={onNavigate} end className={({ isActive: act }) =>
              `relative block px-3 py-1.5 rounded-md text-sm transition-colors ${act ? "text-accent-600 font-semibold bg-accent-50 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-accent-500 before:rounded-full" : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"}`
            }>
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const { pathname } = useLocation();
  const [openIndex, setOpenIndex] = useGroupOpen(pathname);

  // Dashboard is always expanded if active (it has no items to collapse)
  // For single-item groups like Dashboard, don't show the expand button

  const content = (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between h-14 shrink-0 px-4 border-b border-neutral-200">
        <NavLink to="/admin" className="flex items-center gap-2.5 min-w-0 group">
          <div className="w-7 h-7 rounded-lg bg-accent-600 flex items-center justify-center shrink-0 shadow-sm">
            <FiGrid className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-semibold text-neutral-900 block leading-tight">Marvel Slice</span>
            <span className="text-[11px] text-neutral-400 font-medium">Admin</span>
          </div>
        </NavLink>
        <button onClick={onMobileClose} className="lg:hidden p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors">
          <FiChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Command palette trigger */}
      <div className="px-3 pt-3 pb-1">
        <button className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md border border-neutral-200 text-sm text-neutral-400 hover:text-neutral-600 hover:border-neutral-300 transition-colors bg-neutral-50">
          <FiSearch className="w-3.5 h-3.5" />
          <span className="flex-1 text-left">Search pages...</span>
          <kbd className="text-[10px] text-neutral-400 bg-white border border-neutral-200 rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 admin-scrollbar">
        {navGroups.map((group, idx) => {
          const Icon = group.icon;
          const groupActive = group.items.some((item) => {
            if (item.to) return isActive(pathname, item);
            if (item.children) return item.children.some((c) => isActive(pathname, c));
            return false;
          });
          const isOpen = openIndex === idx;

          return (
            <div key={group.label}>
              {/* Dashboard and other single-page groups render as direct links */}
              {group.items.length === 1 && group.items[0].to ? (
                <NavLink
                  to={group.items[0].to}
                  end
                  onClick={onMobileClose}
                  className={({ isActive: act }) =>
                    `w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${act ? "text-accent-600 font-semibold bg-accent-50" : "text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50"}`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{group.label}</span>
                </NavLink>
              ) : (
                <>
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${groupActive ? "text-accent-600 font-semibold bg-accent-50" : "text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50"}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1 text-left">{group.label}</span>
                    <FiChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                  </button>
                  {isOpen && (
                    <div className="ml-2 pl-2 mt-0.5 space-y-0.5">
                      {group.items.map((item) => {
                        if (item.children) return <NestedNavGroup key={item.label} item={item} pathname={pathname} onNavigate={onMobileClose} />;
                        const act = isActive(pathname, item);
                        return (
                          <Link key={item.to} to={item.to} onClick={onMobileClose}
                            className={`relative block px-3 py-1.5 rounded-md text-sm transition-colors ${act ? "text-accent-600 font-semibold bg-accent-50 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-accent-500 before:rounded-full" : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"}`}
                          >
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-3 shrink-0 border-t border-neutral-200">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-neutral-50">
          <div className="w-6 h-6 rounded-full bg-accent-600 flex items-center justify-center text-[9px] font-bold text-white shrink-0">M</div>
          <div className="min-w-0">
            <p className="text-xs text-neutral-600 font-medium">Marvel Slice v2.0</p>
            <p className="text-[10px] text-neutral-400">Management Portal</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col w-60 shrink-0 h-screen border-r border-neutral-200 overflow-hidden bg-white">{content}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="fixed left-0 top-0 h-full w-72 bg-white shadow-xl z-50 border-r border-neutral-200 overflow-hidden" role="dialog" aria-modal="true" aria-label="Sidebar navigation">{content}</aside>
        </div>
      )}
    </>
  );
}
