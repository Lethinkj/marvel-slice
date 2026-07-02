import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiHome, FiSettings, FiMenu, FiBookOpen, FiStar, FiGrid, FiX, FiChevronDown, FiFileText, FiFile } from 'react-icons/fi';
import { supabase } from '../../lib/supabaseClient';

const sections = [
  {
    label: 'Dashboard',
    icon: FiHome,
    items: [
      { to: '/admin', label: 'Overview' },
    ],
  },
  {
    label: 'Home Page',
    icon: FiStar,
    items: [
      { to: '/admin/home-page', label: 'Page Editor' },
      { to: '/admin/promo-banner', label: 'Promo Banner' },
      { to: '/admin/alumni', label: 'Alumni Partners' },
    ],
  },
  {
    label: 'Pages',
    icon: FiFile,
    items: [
      { to: '/admin/pages/home', label: 'Home' },
      { to: '/admin/pages/about', label: 'About' },
      { to: '/admin/pages/career', label: 'Career' },
      { to: '/admin/pages/contact', label: 'Contact' },
      { to: '/admin/pages/blog', label: 'Blog' },
    ],
  },
  {
    label: 'Courses',
    icon: FiBookOpen,
    items: [
      { to: '/admin/courses', label: 'All Courses' },
      { to: '/admin/tags', label: 'Tags' },
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
    label: 'Appearance',
    icon: FiMenu,
    items: [
      { to: '/admin/nav-menu', label: 'Navigation Menu' },
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

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const { pathname } = useLocation();
  const [openSection, setOpenSection] = useState(null);
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    supabase.from('site_settings').select('logo_url').maybeSingle().then(({ data }) => {
      if (data?.logo_url) setLogoUrl(data.logo_url);
    });
  }, []);

  useEffect(() => {
    const idx = sections.findIndex((s) =>
      s.items.some((item) =>
        item.to === '/admin' ? pathname === '/admin' : pathname.startsWith(item.to)
      )
    );
    if (idx >= 0) setOpenSection(idx);
  }, [pathname]);

  function toggleSection(idx) {
    setOpenSection(openSection === idx ? null : idx);
  }

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 h-14 shrink-0 border-b border-white/10">
        <NavLink to="/admin" className="flex items-center gap-2 min-w-0" onClick={onMobileClose}>
          {logoUrl ? (
            <img src={logoUrl} alt="Marvel Slice" className="h-7 w-auto object-contain" />
          ) : (
            <div className="w-7 h-7 rounded-md bg-brand-orange flex items-center justify-center shrink-0">
              <FiGrid className="w-3.5 h-3.5 text-white" />
            </div>
          )}
          <span className="text-sm font-bold text-white truncate">Marvel Slice</span>
        </NavLink>
        {mobileOpen && (
          <button onClick={onMobileClose} className="p-1 text-gray-400 hover:text-white">
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {sections.map((section, idx) => {
          const isOpen = openSection === idx;
          const isActive = section.items.some((item) =>
            item.to === '/admin' ? pathname === '/admin' : pathname.startsWith(item.to)
          );

          return (
            <div key={section.label}>
              <button
                onClick={() => toggleSection(idx)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-brand-accent/15 text-white font-medium'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <section.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{section.label}</span>
                <FiChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isOpen ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-200 ${
                  isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="ml-3 pl-3 border-l border-white/10 mt-0.5 space-y-0.5 pb-0.5">
                  {section.items.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.to === '/admin'}
                      onClick={onMobileClose}
                      className={({ isActive }) =>
                        `block px-3 py-1.5 rounded-md text-sm transition-colors ${
                          isActive
                            ? 'bg-brand-accent text-white font-medium shadow-sm'
                            : 'text-gray-400 hover:bg-white/10 hover:text-white'
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col w-56 bg-dark-navy text-white shrink-0 h-screen">
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={onMobileClose} />
          <aside className="fixed left-0 top-0 h-full w-64 bg-dark-navy text-white z-50 shadow-2xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
