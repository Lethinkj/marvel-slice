import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
  FiBookOpen, FiUsers, FiFileText, FiMenu, FiTag, FiLayout,
  FiExternalLink, FiPlusCircle, FiSettings, FiChevronRight,
  FiStar, FiList, FiImage,
} from 'react-icons/fi';

function StatCard({ icon: Icon, label, value, color, bg, link }) {
  return (
    <Link
      to={link}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md hover:border-gray-200 transition-all group"
    >
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-text-gray uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${color}`}>{value}</p>
      </div>
      <FiChevronRight className="w-4 h-4 text-gray-200 group-hover:text-brand-accent transition-colors shrink-0" />
    </Link>
  );
}

function SectionCard({ title, items }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <h2 className="font-semibold text-dark-navy">{title}</h2>
      </div>
      <div className="divide-y divide-gray-50">
        {items.map((item, i) => (
          <Link
            key={i}
            to={item.to}
            className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
          >
            <div className={`w-9 h-9 ${item.bg || 'bg-gray-100'} rounded-lg flex items-center justify-center shrink-0`}>
              <item.icon className={`w-4 h-4 ${item.color || 'text-text-gray'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-navy">{item.label}</p>
              {item.desc && (
                <p className="text-xs text-text-gray mt-0.5">{item.desc}</p>
              )}
            </div>
            <FiChevronRight className="w-4 h-4 text-gray-200 group-hover:text-brand-accent transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

const contentSections = [
  { to: '/admin/courses', label: 'Courses', icon: FiBookOpen, desc: 'Manage course content, pricing, and sections', color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
  { to: '/admin/nav-menu', label: 'Navigation Menu', icon: FiMenu, desc: 'Add, edit, reorder menu items', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { to: '/admin/promo-banner', label: 'Promo Banner', icon: FiStar, desc: 'Edit the callout banner on home page', color: 'text-amber-600', bg: 'bg-amber-50' },
  { to: '/admin/alumni', label: 'Alumni Partners', icon: FiUsers, desc: 'Companies that hire your graduates', color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
  { to: '/admin/tags', label: 'Tags', icon: FiTag, desc: 'Categorize courses by topic', color: 'text-sky-600', bg: 'bg-sky-50' },
  { to: '/admin/footer', label: 'Footer', icon: FiLayout, desc: 'Footer columns and links', color: 'text-cyan-600', bg: 'bg-cyan-50' },
];

const siteConfigSections = [
  { to: '/admin/site-settings', label: 'Site Settings', icon: FiSettings, desc: 'Contact info, social links, logo', color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
  { to: '/admin/media', label: 'Media Library', icon: FiImage, desc: 'Upload and manage images', color: 'text-rose-600', bg: 'bg-rose-50' },
  { to: '/admin/admin-users', label: 'Admin Users', icon: FiUsers, desc: 'Manage who can access this panel', color: 'text-indigo-600', bg: 'bg-indigo-50' },
];

const quickCreate = [
  { to: '/admin/courses/new', label: 'New Course', icon: FiPlusCircle, desc: 'Add a course to the catalog', color: 'text-white', bg: 'bg-brand-accent' },
  { to: '/admin/nav-menu', label: 'Add Nav Item', icon: FiList, desc: 'Create a new menu entry', color: 'text-white', bg: 'bg-brand-purple' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const results = await Promise.allSettled([
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('nav_items').select('*', { count: 'exact', head: true }),
        supabase.from('faqs').select('*', { count: 'exact', head: true }),
        supabase.from('alumni_companies').select('*', { count: 'exact', head: true }),
        supabase.from('tags').select('*', { count: 'exact', head: true }),
        supabase.from('promo_banners').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('id, title, slug, is_published, created_at').order('created_at', { ascending: false }).limit(5),
      ]);

      const getCount = (res) => (res.status === 'fulfilled' ? res.value.count ?? 0 : 0);
      const getData = (res) => (res.status === 'fulfilled' ? res.value.data ?? [] : []);

      setStats({
        courses: getCount(results[0]),
        navItems: getCount(results[1]),
        faqs: getCount(results[2]),
        companies: getCount(results[3]),
        tags: getCount(results[4]),
        banners: getCount(results[5]),
      });
      setRecentCourses(getData(results[6]));
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Courses', value: stats.courses, icon: FiBookOpen, color: 'text-brand-accent', bg: 'bg-brand-accent/10', link: '/admin/courses' },
    { label: 'Nav Items', value: stats.navItems, icon: FiMenu, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/admin/nav-menu' },
    { label: 'FAQs', value: stats.faqs, icon: FiFileText, color: 'text-brand-orange', bg: 'bg-brand-orange/10', link: '/admin/courses' },
    { label: 'Alumni Partners', value: stats.companies, icon: FiUsers, color: 'text-brand-purple', bg: 'bg-brand-purple/10', link: '/admin/alumni' },
    { label: 'Tags', value: stats.tags, icon: FiTag, color: 'text-sky-600', bg: 'bg-sky-50', link: '/admin/tags' },
    { label: 'Promo Banners', value: stats.banners, icon: FiStar, color: 'text-amber-600', bg: 'bg-amber-50', link: '/admin/promo-banner' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-navy">Dashboard</h1>
          <p className="text-sm text-text-gray mt-1">
            Manage your website content from one place.
          </p>
        </div>
        <Link
          to="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 text-sm text-brand-accent hover:text-brand-accent/80 transition-colors"
        >
          <FiExternalLink className="w-4 h-4" />
          View Site
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <SectionCard title="Content Management" items={contentSections} />

        <div className="space-y-6">
          <SectionCard title="Quick Create" items={quickCreate} />
          <SectionCard title="Site Configuration" items={siteConfigSections} />
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold text-dark-navy flex items-center gap-2">
            <FiBookOpen className="w-4 h-4 text-brand-accent" />
            Recent Courses
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {recentCourses.length === 0 ? (
              <div className="p-6 text-center text-sm text-text-gray">
                No courses yet.{' '}
                <Link to="/admin/courses/new" className="text-brand-accent hover:underline font-medium">
                  Create your first course
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentCourses.map((course) => (
                  <Link
                    key={course.id}
                    to={`/admin/courses/${course.id}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-dark-navy truncate group-hover:text-brand-accent transition-colors">
                        {course.title}
                      </p>
                      <p className="text-xs text-text-gray mt-0.5">{course.slug}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          course.is_published
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${course.is_published ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {course.is_published ? 'Published' : 'Draft'}
                      </span>
                      <FiChevronRight className="w-4 h-4 text-gray-200 group-hover:text-brand-accent transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/admin/courses"
            className="flex items-center justify-center gap-1.5 text-sm text-brand-accent hover:text-brand-accent/80 transition-colors py-2"
          >
            View All Courses
            <FiChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
