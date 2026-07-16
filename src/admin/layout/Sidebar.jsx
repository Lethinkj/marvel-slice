import { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiHome, FiSettings, FiBookOpen, FiGrid, FiX, FiChevronDown, FiFileText, FiFile, FiLayers, FiInbox, FiMenu } from 'react-icons/fi';
import { supabase } from '../../lib/supabaseClient';

const navGroups = [
  {
    label: 'Dashboard',
    icon: FiHome,
    items: [
      { to: '/admin', label: 'Overview' },
    ],
  },
  {
    label: 'Edit Pages',
    icon: FiFile,
    items: [
      {
        label: 'Home', children: [
          { to: '/admin/home/hero', label: 'Hero Banner' },
          { to: '/admin/home/intro_form', label: 'Intro + Form' },
          { to: '/admin/home/empowering', label: 'Empowering Careers' },
          { to: '/admin/home/featured_courses', label: 'Feature Cards' },
          { to: '/admin/home/services', label: 'Featured Services' },
          { to: '/admin/home/cta_banner', label: 'CTA Banner' },
          { to: '/admin/home/faqs', label: 'FAQs' },
          { to: '/admin/home/promo_banner', label: 'Promo Banner' },
          { to: '/admin/home/alumni', label: 'Alumni Partners' },
        ],
      },
      { to: '/admin/about-page', label: 'About' },
      { to: '/admin/career-page', label: 'Career' },
      { to: '/admin/contact-page', label: 'Contact' },
      { to: '/admin/services-page', label: 'Services' },
      { to: '/admin/training-page', label: 'Training' },
      { to: '/admin/blog', label: 'Blog' },
    ],
  },
  {
    label: 'Submissions',
    icon: FiInbox,
    items: [
      { to: '/admin/career-submissions', label: 'Career Submissions' },
    ],
  },
  {
    label: 'Courses',
    icon: FiBookOpen,
    items: [
      { to: '/admin/courses', label: 'All Courses' },
      { to: '/admin/courses/wizard', label: 'Add Courses' },
      { to: '/admin/tags', label: 'Tags' },
      { to: '/admin/courses/reports', label: 'Reports' },
    ],
  },
  {
    label: 'Blog',
    icon: FiFileText,
    items: [
      { to: '/admin/blog', label: 'All Posts' },
      { to: '/admin/blog/categories', label: 'Categories' },
    ],
  },
  {
    label: 'Navigation Menu',
    icon: FiMenu,
    items: [
      { to: '/admin/nav-menu?section=Software%20Learning', label: 'Software Learning' },
      { to: '/admin/nav-menu?section=Competitive%20Exam', label: 'Competitive Exam' },
      { to: '/admin/nav-menu?section=Services', label: 'Services' },
      { to: '/admin/nav-menu?section=Training', label: 'Training' },
    ],
  },
  {
    label: 'Appearance',
    icon: FiLayers,
    items: [
      { to: '/admin/footer', label: 'Footer' },
      { to: '/admin/media', label: 'Media Library' },
    ],
  },
  {
    label: 'Settings',
    icon: FiSettings,
    items: [
      { to: '/admin/site-settings', label: 'Site Settings' },
      { to: '/admin/admin-users', label: 'Admin Users' },
    ],
  },
];

function isActive(pathname, item) {
  if (item.to === '/admin') return pathname === '/admin';
  return pathname.startsWith(item.to);
}

function NestedNavGroup({ item, pathname, onNavigate }) {
  const [childOpen, setChildOpen] = useState(
    () => item.children.some((c) => isActive(pathname, c))
  );
  const childActive = item.children.some((c) => isActive(pathname, c));

  useEffect(() => {
    if (item.children.some((c) => isActive(pathname, c))) setChildOpen(true);
  }, [pathname, item.children]);

  return (
    <div>
      <button
        onClick={() => setChildOpen((prev) => !prev)}
        className={`w-full flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          childActive ? 'text-brand-accent font-bold' : 'text-gray-500 hover:text-gray-700'
        }`}
        aria-expanded={childOpen}
      >
        <FiChevronDown className={`w-3 h-3 transition-transform duration-200 ${childOpen ? 'rotate-0' : '-rotate-90'}`} />
        {item.label}
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${childOpen ? 'max-h-[30rem] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="ml-3 pl-2 space-y-0.5 border-l border-gray-200 mb-1">
          {item.children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              onClick={onNavigate}
              className={({ isActive: act }) =>
                `relative block px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                  act ? 'text-brand-accent font-bold bg-brand-accent/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              {({ isActive: act }) => (
                <span className="pl-2">{child.label}</span>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

function NavGroup({ group, pathname, onNavigate, isOpen, onToggle }) {
  const groupActive = group.items.some((item) => {
    if (item.to) return isActive(pathname, item);
    if (item.children) return item.children.some((c) => isActive(pathname, c));
    return false;
  });

  const Icon = group.icon;

  return (
    <div>
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
          groupActive
            ? 'text-brand-accent font-bold bg-brand-accent/5'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
        aria-expanded={isOpen}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
          groupActive ? 'bg-brand-accent/10 text-brand-accent' : 'bg-gray-100 text-gray-400'
        }`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="flex-1 text-left">{group.label}</span>
        <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-200 ease-in-out ${
        isOpen ? 'max-h-[50rem] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="ml-4 pl-3 mt-0.5 space-y-0.5 pb-1 border-l border-gray-200">
          {group.items.map((item) => {
            if (item.children) {
              return <NestedNavGroup key={item.label} item={item} pathname={pathname} onNavigate={onNavigate} />;
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                onClick={onNavigate}
                className={({ isActive: act }) =>
                  `relative block px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                    act
                      ? 'text-brand-accent font-bold bg-brand-accent/5'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                {({ isActive: act }) => (
                  <span className="pl-2">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const { pathname } = useLocation();
  const [logoUrl, setLogoUrl] = useState('');

  const [openGroup, setOpenGroup] = useState(() => {
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
    if (idx >= 0) setOpenGroup(idx);
  }, [pathname]);

  useEffect(() => {
    supabase.from('site_settings').select('logo_url').maybeSingle().then(({ data }) => {
      if (data?.logo_url) setLogoUrl(data.logo_url);
    });
  }, []);

  const onNavigate = useCallback(() => {
    if (onMobileClose) onMobileClose();
  }, [onMobileClose]);

  const content = (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 shrink-0 px-4 border-b border-gray-200">
        <NavLink to="/admin" className="flex items-center gap-3 min-w-0 group" onClick={onNavigate}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-accent to-brand-blue flex items-center justify-center shrink-0 shadow-sm">
            <FiGrid className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-base font-bold text-gray-900 block leading-tight">Marvel Slice</span>
            <span className="text-xs text-gray-400 font-medium">Admin Panel</span>
          </div>
        </NavLink>
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close sidebar"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1" role="navigation" aria-label="Sidebar navigation">
        {navGroups.map((group, idx) => (
          <NavGroup
            key={group.label}
            group={group}
            pathname={pathname}
            onNavigate={onNavigate}
            isOpen={openGroup === idx}
            onToggle={() => setOpenGroup(openGroup === idx ? null : idx)}
          />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-3 shrink-0 border-t border-gray-200">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-gray-50">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-accent to-brand-orange flex items-center justify-center text-[10px] font-bold text-white shrink-0">
            M
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-600 font-medium">Marvel Slice v2.0</p>
            <p className="text-[10px] text-gray-400">Management Portal</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 h-screen border-r border-gray-200 overflow-hidden">
        {content}
      </aside>

      {/* Mobile off-canvas drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <aside
            className="fixed left-0 top-0 h-full w-72 bg-white shadow-2xl z-50 border-r border-gray-200 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Sidebar navigation"
          >
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
