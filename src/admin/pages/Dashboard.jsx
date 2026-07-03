import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
  FiBookOpen, FiUsers, FiFileText, FiMenu, FiTag, FiLayout,
  FiExternalLink, FiPlusCircle, FiSettings, FiChevronRight,
  FiStar, FiList, FiImage, FiTrendingUp, FiClock, FiArrowRight,
  FiLayers, FiGlobe, FiMessageCircle,
} from 'react-icons/fi';

function StatCard({ icon: Icon, label, value, color, bg, link, gradient, subtitle }) {
  return (
    <Link
      to={link}
      className="group relative bg-white rounded-2xl border border-gray-100 p-5 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.04]">
        <Icon className="w-full h-full" />
      </div>
      <div className="flex items-start justify-between mb-2.5">
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className={`text-2xl font-bold tracking-tight ${color}`}>{value}</div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </Link>
  );
}

function QuickActionCard({ icon: Icon, label, desc, to, gradient }) {
  return (
    <Link
      to={to}
      className="group relative bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`} />
      <div className="relative z-10">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br ${gradient} shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <p className="text-sm font-semibold text-dark-navy group-hover:text-white transition-colors duration-300">{label}</p>
        <p className="text-xs text-gray-500 group-hover:text-white/80 transition-colors duration-300 mt-0.5">{desc}</p>
      </div>
    </Link>
  );
}

const quickActions = [
  { to: '/admin/courses/new', label: 'New Course', icon: FiPlusCircle, desc: 'Add to catalog', gradient: 'from-brand-accent to-brand-blue' },
  { to: '/admin/nav-menu', label: 'Nav Item', icon: FiMenu, desc: 'Add menu entry', gradient: 'from-brand-purple to-indigo-500' },
  { to: '/admin/blog/new', label: 'Blog Post', icon: FiFileText, desc: 'Write new post', gradient: 'from-amber-500 to-orange-500' },
  { to: '/admin/media', label: 'Upload Media', icon: FiImage, desc: 'Images & files', gradient: 'from-rose-500 to-pink-500' },
];

const contentLinks = [
  { to: '/admin/courses', label: 'Courses', icon: FiBookOpen, desc: 'Content, pricing, sections', color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
  { to: '/admin/blog', label: 'Blog Posts', icon: FiFileText, desc: 'Write & manage articles', color: 'text-amber-600', bg: 'bg-amber-50' },
  { to: '/admin/nav-menu', label: 'Navigation', icon: FiMenu, desc: 'Menu structure & order', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { to: '/admin/promo-banner', label: 'Promo Banner', icon: FiStar, desc: 'Home page callout', color: 'text-amber-600', bg: 'bg-amber-50' },
  { to: '/admin/footer', label: 'Footer', icon: FiLayout, desc: 'Columns and links', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { to: '/admin/tags', label: 'Tags', icon: FiTag, desc: 'Course categories', color: 'text-sky-600', bg: 'bg-sky-50' },
  { to: '/admin/alumni', label: 'Alumni', icon: FiUsers, desc: 'Partner companies', color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
];

const configLinks = [
  { to: '/admin/site-settings', label: 'Site Settings', icon: FiGlobe, desc: 'Logo, contact, social', color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
  { to: '/admin/media', label: 'Media Library', icon: FiImage, desc: 'Manage uploads', color: 'text-rose-600', bg: 'bg-rose-50' },
  { to: '/admin/admin-users', label: 'Admin Users', icon: FiUsers, desc: 'Access control', color: 'text-indigo-600', bg: 'bg-indigo-50' },
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
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
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
        blogPosts: getCount(results[6]),
      });
      setRecentCourses(getData(results[7]));
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
    { label: 'Courses', value: stats.courses, icon: FiBookOpen, color: 'text-brand-accent', bg: 'bg-brand-accent/10', link: '/admin/courses', subtitle: 'Total published + drafts' },
    { label: 'Nav Items', value: stats.navItems, icon: FiMenu, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/admin/nav-menu', subtitle: 'Menu structure' },
    { label: 'Blog Posts', value: stats.blogPosts, icon: FiFileText, color: 'text-amber-600', bg: 'bg-amber-50', link: '/admin/blog', subtitle: 'Articles & news' },
    { label: 'Alumni', value: stats.companies, icon: FiUsers, color: 'text-brand-purple', bg: 'bg-brand-purple/10', link: '/admin/alumni', subtitle: 'Partner companies' },
    { label: 'Tags', value: stats.tags, icon: FiTag, color: 'text-sky-600', bg: 'bg-sky-50', link: '/admin/tags', subtitle: 'Course categories' },
    { label: 'FAQs', value: stats.faqs, icon: FiMessageCircle, color: 'text-rose-600', bg: 'bg-rose-50', link: '/admin/courses', subtitle: 'Across all courses' },
    { label: 'Promo Banners', value: stats.banners, icon: FiStar, color: 'text-amber-600', bg: 'bg-amber-50', link: '/admin/promo-banner', subtitle: 'Home page banners' },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="bg-gradient-to-br from-brand-blue via-brand-accent to-brand-blue rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
          <FiLayers className="w-full h-full" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-white/80 mt-1.5 text-sm sm:text-base">Everything you need to manage your site.</p>
          </div>
          <Link
            to="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl text-sm font-medium transition-all"
          >
            <FiExternalLink className="w-4 h-4" />
            View Site
            <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FiTrendingUp className="w-4 h-4 text-brand-accent" />
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Overview</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <StatCard key={i} {...card} />
          ))}
        </div>
      </div>

      {/* Quick Actions + Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Quick Actions */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FiPlusCircle className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Quick Create</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, i) => (
              <QuickActionCard key={i} {...action} />
            ))}
          </div>
        </div>

        {/* Content Management */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FiLayers className="w-4 h-4 text-brand-accent" />
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Content</h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
            {contentLinks.map((item, i) => (
              <Link key={i} to={item.to}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
              >
                <div className={`w-9 h-9 ${item.bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-navy">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
                <FiChevronRight className="w-4 h-4 text-gray-200 group-hover:text-brand-accent transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column: Config + Recent */}
        <div className="space-y-6">

          {/* Config */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FiSettings className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Configuration</h2>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
              {configLinks.map((item, i) => (
                <Link key={i} to={item.to}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className={`w-9 h-9 ${item.bg} rounded-xl flex items-center justify-center shrink-0`}>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-navy">{item.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                  <FiChevronRight className="w-4 h-4 text-gray-200 group-hover:text-brand-accent transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Courses */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FiClock className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recent Courses</h2>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {recentCourses.length === 0 ? (
                <div className="p-5 text-center text-sm text-gray-400">
                  No courses yet.{' '}
                  <Link to="/admin/courses/new" className="text-brand-accent hover:underline font-medium">
                    Create one
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentCourses.map((course) => (
                    <Link
                      key={course.id}
                      to={`/admin/courses/${course.id}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-dark-navy truncate group-hover:text-brand-accent transition-colors">{course.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{course.slug}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                          course.is_published ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                        }`}>
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
            {recentCourses.length > 0 && (
              <Link to="/admin/courses"
                className="flex items-center justify-center gap-1.5 text-sm text-brand-accent hover:text-brand-accent/80 transition-colors py-3"
              >
                View All Courses <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
