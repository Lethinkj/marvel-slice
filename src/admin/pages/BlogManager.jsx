import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import AdminButton from '../components/AdminButton';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import DataTable from '../components/ui/DataTable';
import { FiPlus, FiFileText, FiSearch, FiChevronRight, FiCalendar } from 'react-icons/fi';

export default function BlogManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('*, blog_categories(name)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setPosts(data || []);
        setLoading(false);
      });
  }, []);

  async function togglePublish(id, current) {
    const payload = current
      ? { is_published: false }
      : { is_published: true, published_at: current ? undefined : new Date().toISOString() };
    await supabase.from('blog_posts').update(payload).eq('id', id);
    setPosts(posts.map((p) => (p.id === id ? { ...p, ...payload } : p)));
  }

  async function handleDelete(id, title) {
    if (!window.confirm(`Delete "${title}"?`)) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    setPosts(posts.filter((p) => p.id !== id));
  }

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(search.toLowerCase())
  );

  const cardsColumns = [
    {
      cell: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center shrink-0">
            <FiFileText className="w-5 h-5 text-accent-600" />
          </div>
          <div className="flex-1 min-w-0">
            <Link to={`/admin/blog/${row.id}`} className="font-semibold text-neutral-900 hover:text-accent-600 transition-colors">
              {row.title}
            </Link>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-neutral-400">
              <span className="flex items-center gap-1">
                <FiCalendar className="w-3 h-3" />
                {row.published_at ? new Date(row.published_at).toLocaleDateString() : 'Not published'}
              </span>
              {row.blog_categories && <span className="px-2 py-0.5 bg-accent-50 text-accent-600 rounded-full">{row.blog_categories.name}</span>}
              {row.is_featured && <Badge variant="featured">Featured</Badge>}
            </div>
          </div>
        </div>
      ),
    },
    {
      cell: (row) => (
        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={row.is_published} onChange={() => togglePublish(row.id, row.is_published)} className="sr-only peer" />
            <div className="w-9 h-5 bg-neutral-200 rounded-full peer-checked:bg-accent-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
          </label>
          <Badge variant={row.is_published ? 'published' : 'draft'}>{row.is_published ? 'Published' : 'Draft'}</Badge>
        </div>
      ),
    },
    {
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Link to={`/admin/blog/${row.id}`} className="px-3 py-1.5 text-xs font-medium text-accent-600 bg-accent-50 hover:bg-accent-100 rounded-md transition-colors">Edit</Link>
          <button onClick={() => handleDelete(row.id, row.title)} className="px-3 py-1.5 text-xs font-medium text-destructive-600 bg-destructive-50 hover:bg-destructive-100 rounded-md transition-colors">Delete</button>
          <FiChevronRight className="w-4 h-4 text-neutral-300 transition-colors shrink-0" />
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Blog Posts</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {search
              ? `${filteredPosts.length} of ${posts.length} post${posts.length !== 1 ? 's' : ''}`
              : `${posts.length} post${posts.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <AdminButton to="/admin/blog/new" variant="primary" size="md">
          <FiPlus className="w-4 h-4" />
          New Post
        </AdminButton>
      </div>

      {posts.length > 0 && (
        <div className="relative mb-4">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts by title..."
            className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all bg-white"
          />
        </div>
      )}

      {filteredPosts.length === 0 ? (
        posts.length === 0 ? (
          <EmptyState
            icon={FiFileText}
            title="No blog posts yet"
            description="Get started by creating your first blog post."
            action={{ to: '/admin/blog/new', icon: <FiPlus className="w-4 h-4" />, label: 'Create your first post' }}
          />
        ) : (
          <EmptyState
            icon={FiFileText}
            title="No results found"
            description={`No posts match "${search}". Try a different search term.`}
          />
        )
      ) : (
        <DataTable columns={cardsColumns} data={filteredPosts} searchable={false} variant="cards" />
      )}
    </div>
  );
}
