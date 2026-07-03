import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiHome, FiSettings, FiBookOpen, FiStar, FiGrid, FiX, FiChevronDown, FiFileText, FiFile, FiLayers, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
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
      { to: '/admin/home-page', label: 'Home' },
      { to: '/admin/about-page', label: 'About' },
      { to: '/admin/career-page', label: 'Career' },
      { to: '/admin/contact-page', label: 'Contact' },
      { to: '/admin/blog', label: 'Blog' },
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
    icon: FiLayers,
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

export default function Sidebar({ mobileOpen, onMobileClose, collapsed, onToggleCollapse }) {
  const { pathname } = useLocation();
  const [openSection, setOpenSection] = useState(null);
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    supabase.from('site_settings').select('logo_url').maybeSingle().then(({ data }) => {
      if (data?.logo_url) setLogoUrl(data.logo_url);
    });
  }, []);

  function toggleSection(idx) {
    setOpenSection(openSection === idx ? null : idx);
  }

  const content = (
    <div className="flex flex-col h-full relative">

      {/* Toggle collapse button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-1/2 z-10 w-6 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md hover:bg-gray-50 transition-all text-gray-400 hover:text-brand-accent"
      >
        {collapsed ? <FiChevronRight className="w-3.5 h-3.5" /> : <FiChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Logo */}
      <div className={`flex items-center shrink-0 border-b border-white/5 ${collapsed ? 'justify-center h-16 px-0' : 'justify-between h-16 px-4'}`}>
        <NavLink to="/admin" className={`flex items-center gap-2.5 min-w-0 group ${collapsed ? 'justify-center' : ''}`} onClick={() => { if (!collapsed) onToggleCollapse(); }}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-accent to-brand-blue flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
            <FiGrid className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="text-sm font-bold text-white block leading-tight">Marvel Slice</span>
              <span className="text-[10px] text-white/40 font-medium">Admin Panel</span>
            </div>
          )}
        </NavLink>
        {mobileOpen && (
          <button onClick={onMobileClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto py-4 space-y-1 scrollbar-thin scrollbar-thumb-white/10 ${collapsed ? 'px-2' : 'px-3'}`}>
        {sections.map((section, idx) => {
          const isOpen = openSection === idx;
          const isActive = section.items.some((item) =>
            item.to === '/admin' ? pathname === '/admin' : pathname.startsWith(item.to)
          );

          return (
            <div key={section.label}>
              <button
                onClick={() => { if (collapsed) { onToggleCollapse(); } else { toggleSection(idx); } }}
                className={`w-full flex items-center gap-2.5 rounded-xl text-sm transition-all duration-200 group ${
                  collapsed ? 'justify-center py-2.5' : 'px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-accent/15 to-transparent text-white font-medium'
                    : 'text-gray-400 hover:bg-white/[0.06] hover:text-white'
                }`}
                title={collapsed ? section.label : undefined}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-accent/20 text-brand-accent'
                    : 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white'
                }`}>
                  <section.icon className="w-4 h-4" />
                </div>
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left text-sm">{section.label}</span>
                    <FiChevronDown
                      className={`w-3.5 h-3.5 transition-all duration-300 ${
                        isOpen ? 'rotate-0 text-white/60' : '-rotate-90 text-white/20'
                      }`}
                    />
                  </>
                )}
              </button>

              {!collapsed && (
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="ml-2 pl-4 mt-0.5 space-y-0.5 pb-1 border-l border-white/5">
                    {section.items.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.to === '/admin'}
                        onClick={() => { if (onMobileClose) onMobileClose(); if (!collapsed) onToggleCollapse(); }}
                        className={({ isActive }) =>
                          `relative block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            isActive
                              ? 'text-white font-medium'
                              : 'text-gray-400 hover:bg-white/[0.06] hover:text-white'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-brand-accent to-brand-blue rounded-full shadow-sm" />
                            )}
                            <span className="pl-2">{link.label}</span>
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom branding */}
      {!collapsed && (
        <div className="px-4 py-3 shrink-0 border-t border-white/5">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-white/[0.03]">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-accent to-brand-orange flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              M
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white/60 font-medium">Marvel Slice v2.0</p>
              <p className="text-[10px] text-white/30">Management Portal</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <aside className={`hidden lg:flex lg:flex-col bg-gradient-to-b from-brand-blue via-brand-blue to-[#071738] text-white shrink-0 h-screen border-r border-white/10 transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-60'
      }`}>
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-brand-blue via-brand-blue to-[#071738] text-white z-50 shadow-2xl border-r border-white/10">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
