import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import AdminButton from "../components/AdminButton";
import {
  FiBookOpen, FiUsers, FiFileText, FiMenu, FiTag, FiMessageCircle, FiStar,
  FiExternalLink, FiPlusCircle, FiClock, FiArrowRight, FiChevronRight,
} from "react-icons/fi";

function StatCard({ icon: Icon, label, value, color = "text-accent-600", bg = "bg-accent-50", link, subtitle }) {
  return (
    <Link to={link} className="block bg-white rounded-lg border border-neutral-200 p-4 hover:border-neutral-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <span className={`text-xl font-semibold tabular-nums ${color}`}>{value}</span>
      </div>
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      {subtitle && <p className="text-[11px] text-neutral-400 mt-0.5">{subtitle}</p>}
    </Link>
  );
}

function ActivityRow({ icon: Icon, label, time, link, color }) {
  return (
    <Link to={link} className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors group">
      <div className={`w-7 h-7 ${color || "bg-neutral-100"} rounded-lg flex items-center justify-center shrink-0`}>
        <Icon className="w-3.5 h-3.5 text-neutral-500" />
      </div>
      <span className="flex-1 text-sm text-neutral-700 truncate">{label}</span>
      <span className="text-xs text-neutral-400">{time}</span>
      <FiChevronRight className="w-3.5 h-3.5 text-neutral-200 group-hover:text-accent-500 transition-colors shrink-0" />
    </Link>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const results = await Promise.allSettled([
        supabase.from("courses").select("*", { count: "exact", head: true }),
        supabase.from("nav_items").select("*", { count: "exact", head: true }),
        supabase.from("faqs").select("*", { count: "exact", head: true }),
        supabase.from("alumni_companies").select("*", { count: "exact", head: true }),
        supabase.from("tags").select("*", { count: "exact", head: true }),
        supabase.from("promo_banners").select("*", { count: "exact", head: true }),
        supabase.from("blog_posts").select("*", { count: "exact", head: true }),
        supabase.from("courses").select("id, title, slug, is_published, created_at").order("created_at", { ascending: false }).limit(5),
      ]);
      const getCount = (r) => (r.status === "fulfilled" ? r.value.count ?? 0 : 0);
      setStats({
        courses: getCount(results[0]), navItems: getCount(results[1]), faqs: getCount(results[2]),
        companies: getCount(results[3]), tags: getCount(results[4]), banners: getCount(results[5]), blogPosts: getCount(results[6]),
      });
      setRecentCourses(results[7].status === "fulfilled" ? results[7].value.data ?? [] : []);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>;

  const statCards = [
    { label: "Courses", value: stats.courses, icon: FiBookOpen, link: "/admin/courses", subtitle: `${stats.courses} total` },
    { label: "Blog Posts", value: stats.blogPosts, icon: FiFileText, link: "/admin/blog", bg: "bg-info-50", color: "text-info-500", subtitle: "Articles & news" },
    { label: "Nav Items", value: stats.navItems, icon: FiMenu, link: "/admin/nav-menu", bg: "bg-success-50", color: "text-success-700", subtitle: "Menu structure" },
    { label: "Alumni", value: stats.companies, icon: FiUsers, link: "/admin/alumni", bg: "bg-accent-50", color: "text-accent-600", subtitle: "Partner companies" },
    { label: "Tags", value: stats.tags, icon: FiTag, link: "/admin/tags", bg: "bg-warning-50", color: "text-warning-700", subtitle: "Course categories" },
    { label: "FAQs", value: stats.faqs, icon: FiMessageCircle, link: "/admin/courses", bg: "bg-destructive-50", color: "text-destructive-500", subtitle: "Across all courses" },
    { label: "Banners", value: stats.banners, icon: FiStar, link: "/admin/promo-banner", bg: "bg-warning-50", color: "text-warning-700", subtitle: "Home page banners" },
  ];

  const quickActions = [
    { to: "/admin/courses/wizard", label: "New Course", icon: FiPlusCircle },
    { to: "/admin/nav-menu", label: "Nav Item", icon: FiMenu },
    { to: "/admin/blog/new", label: "Blog Post", icon: FiFileText },
    { to: "/admin/media", label: "Upload Media", icon: FiClock },
  ];

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="space-y-6">
      {/* Compact header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <AdminButton variant="secondary" size="sm" to="/" href="/" >
            <FiExternalLink className="w-3.5 h-3.5" /> View Site
          </AdminButton>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {statCards.map((card, i) => <StatCard key={i} {...card} />)}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div>
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Quick Create</h2>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, i) => (
              <Link key={i} to={action.to} className="flex flex-col items-center justify-center gap-1.5 p-4 bg-white rounded-lg border border-neutral-200 hover:border-accent-300 hover:shadow-sm transition-all text-center">
                <div className="w-8 h-8 rounded-lg bg-accent-50 flex items-center justify-center">
                  <action.icon className="w-4 h-4 text-accent-600" />
                </div>
                <span className="text-xs font-medium text-neutral-700">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Recent Activity</h2>
          <div className="bg-white rounded-lg border border-neutral-200 divide-y divide-neutral-100 overflow-hidden">
            {recentCourses.length === 0 ? (
              <div className="p-6 text-center text-sm text-neutral-400">No recent activity.</div>
            ) : (
              recentCourses.map((course) => (
                <ActivityRow
                  key={course.id}
                  icon={FiBookOpen}
                  label={course.title}
                  time={new Date(course.created_at).toLocaleDateString()}
                  link={`/admin/courses/${course.id}`}
                  color="bg-accent-50"
                />
              ))
            )}
          </div>
          {recentCourses.length > 0 && (
            <Link to="/admin/courses" className="flex items-center justify-center gap-1 text-sm text-accent-600 hover:text-accent-700 transition-colors py-3">
              View All Courses <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
