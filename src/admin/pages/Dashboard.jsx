import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import AdminButton from '../components/AdminButton';
import PageShell from '../components/ui/PageShell';
import Card from '../components/ui/Card';
import { LoadingState } from '../components/ui/EmptyState';
import {
  FiBookOpen, FiUsers, FiFileText, FiMenu, FiTag, FiMessageCircle,
  FiExternalLink, FiPlusCircle, FiArrowRight, FiChevronRight, FiInbox, FiClock,
} from 'react-icons/fi';

function StatCard({ icon: Icon, label, value, link }) {
  return (
    <Link to={link} className="block bg-white rounded-xl border border-admin-200 shadow-sm p-5 hover:shadow-elevated hover:border-admin-300 transition-all group">
      <div className="flex items-start justify-between mb-2">
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-admin-600">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xl font-semibold tabular-nums text-admin-900">{value}</span>
      </div>
      <p className="text-sm font-medium text-admin-500">{label}</p>
    </Link>
  );
}

function QuickAction({ to, icon: Icon, label }) {
  return (
    <Link to={to} className="flex flex-col items-center justify-center gap-1.5 p-4 bg-white rounded-xl border border-admin-200 shadow-sm hover:border-admin-300 hover:shadow-elevated transition-all text-center group">
      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center group-hover:bg-admin-100 transition-colors">
        <Icon className="w-4 h-4 text-admin-600" />
      </div>
      <span className="text-xs font-medium text-admin-700">{label}</span>
    </Link>
  );
}

const quickActions = [
  { to: '/admin/courses/wizard', label: 'New Course', icon: FiPlusCircle },
  { to: '/admin/blog', label: 'Blog Post', icon: FiFileText },
  { to: '/admin/career-submissions', label: 'Submissions', icon: FiInbox },
  { to: '/admin/media', label: 'Upload Media', icon: FiClock },
];

const statCardDefs = [
  { label: 'Courses', key: 'courses', icon: FiBookOpen, link: '/admin/courses' },
  { label: 'Blog Posts', key: 'blogPosts', icon: FiFileText, link: '/admin/blog' },
  { label: 'Nav Items', key: 'navItems', icon: FiMenu, link: '/admin/nav-menu' },
  { label: 'Alumni', key: 'companies', icon: FiUsers, link: '/admin/alumni' },
  { label: 'Tags', key: 'tags', icon: FiTag, link: '/admin/tags' },
  { label: 'FAQs', key: 'faqs', icon: FiMessageCircle, link: '/admin/courses' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState({ career: 0, contact: 0, brochure: 0, form: 0 });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const results = await Promise.allSettled([
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('nav_items').select('*', { count: 'exact', head: true }),
        supabase.from('faqs').select('*', { count: 'exact', head: true }),
        supabase.from('alumni_companies').select('*', { count: 'exact', head: true }),
        supabase.from('tags').select('*', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('blog_posts').select('id, title, created_at').order('created_at', { ascending: false }).limit(3),
        supabase.from('career_submissions').select('*', { count: 'exact', head: true }),
        supabase.from('contact_submissions').select('*', { count: 'exact', head: true }),
        supabase.from('brochure_downloads').select('*', { count: 'exact', head: true }),
        supabase.from('form_submissions').select('*', { count: 'exact', head: true }),
      ]);
      const getCount = (r) => (r.status === 'fulfilled' ? r.value.count ?? 0 : 0);
      setStats({
        courses: getCount(results[0]), navItems: getCount(results[1]), faqs: getCount(results[2]),
        companies: getCount(results[3]), tags: getCount(results[4]), blogPosts: getCount(results[5]),
      });
      setPending({
        career: getCount(results[8]), contact: getCount(results[9]), brochure: getCount(results[10]), form: getCount(results[11]),
      });

      const recent = [];
      if (results[6].status === 'fulfilled') {
        for (const c of (results[6].value.data || [])) recent.push({ ...c, type: 'course', link: `/admin/courses/${c.id}` });
      }
      if (results[7].status === 'fulfilled') {
        for (const p of (results[7].value.data || [])) recent.push({ ...p, type: 'blog', link: `/admin/blog/${p.id}` });
      }
      recent.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8);
      setRecentItems(recent);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <LoadingState />;

  const totalPending = pending.career + pending.contact + pending.brochure + pending.form;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const greeting = `Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'}, ${user?.name?.split(' ')[0] || 'Admin'}`;

  return (
    <PageShell
      title={greeting}
      subtitle={today}
      actions={
        <AdminButton to="/" target="_blank" variant="secondary" size="md">
          <FiExternalLink className="w-4 h-4" /> View Site
        </AdminButton>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCardDefs.map((card, i) => (
          <StatCard key={i} {...card} value={stats?.[card.key] || 0} />
        ))}
        <Link to="/admin/career-submissions" className="block bg-white rounded-xl border border-admin-200 shadow-sm p-5 hover:shadow-elevated hover:border-admin-300 transition-all group">
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <FiInbox className="w-4 h-4" />
            </div>
            <span className="text-xl font-semibold tabular-nums text-admin-900">{totalPending}</span>
          </div>
          <p className="text-sm font-medium text-admin-500">Pending Submissions</p>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div>
          <h2 className="text-xs font-semibold text-admin-500 uppercase tracking-wider mb-3">Quick Create</h2>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, i) => <QuickAction key={i} {...action} />)}
          </div>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-xs font-semibold text-admin-500 uppercase tracking-wider mb-3">Recent Activity</h2>
          <Card>
            {recentItems.length === 0 ? (
              <div className="py-8 text-center text-sm text-admin-400">No recent activity.</div>
            ) : (
              <div className="divide-y divide-admin-100 -mx-5 -mb-5">
                {recentItems.map((item) => (
                  <Link key={`${item.type}-${item.id}`} to={item.link} className="flex items-center gap-3 px-5 py-2.5 hover:bg-white transition-colors group">
                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shrink-0">
                      {item.type === 'course' ? <FiBookOpen className="w-3.5 h-3.5 text-admin-600" /> : <FiFileText className="w-3.5 h-3.5 text-admin-600" />}
                    </div>
                    <span className="flex-1 text-sm text-admin-700 truncate">{item.title}</span>
                    <span className="text-xs text-admin-400 shrink-0">{new Date(item.created_at).toLocaleDateString()}</span>
                    <FiChevronRight className="w-3.5 h-3.5 text-admin-200 group-hover:text-admin-500 transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </Card>
          {recentItems.length > 0 && (
            <Link to="/admin/courses" className="flex items-center justify-center gap-1 text-sm text-admin-600 hover:text-admin-700 transition-colors py-3">
              View All Courses <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </PageShell>
  );
}
