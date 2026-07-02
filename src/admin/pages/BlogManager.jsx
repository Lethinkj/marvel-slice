import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Button from '../../components/ui/Button';
import { FiPlus, FiEdit2, FiTrash2, FiFileText, FiChevronRight, FiCalendar, FiEye } from 'react-icons/fi';

export default function BlogManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark-navy">Blog Posts</h1>
          <p className="text-sm text-gray-500 mt-1">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
        </div>
        <Button to="/admin/blog/new" variant="accent" size="md">
          <FiPlus className="w-4 h-4" />
          New Post
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FiFileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-sm text-gray-400 mb-4">No blog posts yet.</p>
          <Button to="/admin/blog/new" variant="accent" size="sm">
            <FiPlus className="w-4 h-4" />
            Create your first post
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {posts.map((post) => (
            <div key={post.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-accent/10 rounded-xl flex items-center justify-center shrink-0">
                  <FiFileText className="w-5 h-5 text-brand-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/admin/blog/${post.id}`}
                    className="font-semibold text-dark-navy hover:text-brand-accent transition-colors">
                    {post.title}
                  </Link>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-3 h-3" />
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString()
                        : 'Not published'}
                    </span>
                    {post.blog_categories && (
                      <span className="px-2 py-0.5 bg-brand-orange/10 text-brand-orange rounded-full">
                        {post.blog_categories.name}
                      </span>
                    )}
                    {post.is_featured && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-xs">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => togglePublish(post.id, post.is_published)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    post.is_published
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${post.is_published ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  {post.is_published ? 'Published' : 'Draft'}
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to={`/admin/blog/${post.id}`}
                    className="p-2 text-gray-400 hover:text-brand-accent hover:bg-brand-accent/10 rounded-lg transition-colors"
                    title="Edit">
                    <FiEdit2 className="w-4 h-4" />
                  </Link>
                  <button onClick={() => handleDelete(post.id, post.title)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
                <FiChevronRight className="w-4 h-4 text-gray-200 group-hover:text-brand-accent transition-colors shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
