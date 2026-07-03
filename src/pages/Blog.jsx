import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { FiSearch, FiArrowRight, FiChevronLeft, FiChevronRight, FiCalendar, FiUser, FiArrowUp, FiArrowLeft, FiTag } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Reveal, { Stagger, StaggerItem } from '../components/ui/Reveal';
import { useBlogPosts, useBlogCategories, useRecentPosts, usePopularTags, useBlogPost } from '../hooks/useBlog';

function Hero({ search, onSearchChange, onSearch }) {
  return (
    <section className="relative bg-gradient-to-br from-dark-navy via-brand-blue to-dark-navy text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-28 text-center relative">
        <Reveal>
          <h1 className="text-[clamp(1.75rem,5vw,3.5rem)] font-extrabold leading-tight">Latest Articles & News</h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-white/70 max-w-2xl mx-auto">Insights, tutorials, and stories from the Marvel Slice team</p>
        </Reveal>
        <div className="mt-6 sm:mt-8 max-w-xl mx-auto flex flex-col sm:flex-row gap-2 sm:gap-0">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={search} onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search articles..."
              onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
              className="w-full pl-11 sm:pl-12 pr-4 py-3.5 rounded-xl sm:rounded-l-xl sm:rounded-r-none text-dark-navy text-base focus:outline-none focus:ring-2 focus:ring-brand-orange" />
          </div>
          <button onClick={onSearch} className="bg-brand-orange text-white px-8 py-3.5 rounded-xl sm:rounded-l-none sm:rounded-r-xl font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2">
            Search <FiArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

function CategoryPills({ categories, active, onChange }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Button onClick={() => onChange(null)} variant={!active ? 'pill-orange' : 'pill'} size="sm" shape="pill">All</Button>
        {categories.map((cat) => (
          <Button key={cat.id} onClick={() => onChange(cat.slug)} variant={active === cat.slug ? 'pill-orange' : 'pill'} size="sm" shape="pill">{cat.name}</Button>
        ))}
      </div>
    </div>
  );
}

function FeaturedPost({ post }) {
  return (
    <Reveal>
    <Link to={`/blog/${post.slug}`} className="block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="grid md:grid-cols-2">
        <div className="h-64 md:h-full bg-gradient-to-br from-brand-blue to-dark-navy flex items-center justify-center">
          {post.image_url ? <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" /> : <span className="text-white/20 text-6xl font-bold">B</span>}
        </div>
        <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
          {post.blog_categories && (
            <span className="inline-block px-3 py-1 bg-brand-orange/10 text-brand-orange text-xs font-semibold rounded-full mb-4 w-fit">{post.blog_categories.name}</span>
          )}
          <h2 className="text-2xl lg:text-3xl font-bold text-dark-navy group-hover:text-brand-accent transition-colors">{post.title}</h2>
          <p className="mt-3 text-text-gray leading-relaxed line-clamp-3">{post.excerpt}</p>
          <div className="flex items-center gap-4 mt-6 text-sm text-gray-400">
            <span className="flex items-center gap-1.5"><FiUser className="w-4 h-4" />{post.author || 'Admin'}</span>
            <span className="flex items-center gap-1.5"><FiCalendar className="w-4 h-4" />
              {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
          </div>
          <span className="mt-6 text-brand-accent font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
            Read More <FiArrowRight className="w-4 h-4" /></span>
        </div>
      </div>
    </Link>
    </Reveal>
  );
}

function PostCard({ post }) {
  return (
    <Link to={`/blog/${post.slug}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
      <div className="aspect-[16/10] bg-gradient-to-br from-brand-blue to-dark-navy flex items-center justify-center overflow-hidden">
        {post.image_url ? <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <FiCalendar className="w-12 h-12 text-white/20" />}
      </div>
      <div className="p-6 flex flex-col flex-1">
        {post.blog_categories && (
          <span className="inline-block px-3 py-1 bg-brand-orange/10 text-brand-orange text-xs font-semibold rounded-full mb-3 w-fit">{post.blog_categories.name}</span>
        )}
        <h3 className="font-bold text-dark-navy text-lg group-hover:text-brand-accent transition-colors line-clamp-2">{post.title}</h3>
        <p className="mt-2 text-sm text-text-gray line-clamp-2 flex-1">{post.excerpt}</p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-400 flex items-center gap-1"><FiCalendar className="w-3.5 h-3.5" />
            {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
          <span className="text-sm text-brand-accent font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            Read More <FiArrowRight className="w-3.5 h-3.5" /></span>
        </div>
      </div>
    </Link>
  );
}

function Pagination({ page, total, perPage, onChange }) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  // Windowed page list so it never overflows on mobile: first, last, current +/- 1, with ellipses.
  const pages = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-12 flex-wrap">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1}
        className="p-2 rounded-lg border border-gray-200 text-text-gray hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <FiChevronLeft className="w-5 h-5" /></button>
      {pages.map((p, i) => (
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="w-8 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-text-gray text-sm">…</span>
        ) : (
          <button key={p} onClick={() => onChange(p)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-sm font-medium transition-colors ${
              p === page ? 'bg-brand-orange text-white shadow-md' : 'border border-gray-200 text-text-gray hover:bg-gray-50'
            }`}>{p}</button>
        )
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages}
        className="p-2 rounded-lg border border-gray-200 text-text-gray hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <FiChevronRight className="w-5 h-5" /></button>
    </div>
  );
}

function RecentPostsWidget({ posts }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-bold text-dark-navy text-lg mb-4 flex items-center gap-2">
        <FiCalendar className="w-4 h-4 text-brand-accent" />
        Recent Posts
      </h3>
      <Stagger className="space-y-3">
        {posts.map((post, i) => (
          <StaggerItem key={post.id}>
            <Link to={`/blog/${post.slug}`} className="block group p-3 -mx-3 rounded-xl hover:bg-gray-50 transition-all duration-200">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-accent/10 to-brand-blue/10 flex items-center justify-center text-xs font-bold text-brand-accent shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-dark-navy group-hover:text-brand-accent transition-colors line-clamp-2">{post.title}</p>
                  {post.published_at && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><FiCalendar className="w-3 h-3" />{new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>}
                </div>
              </div>
            </Link>
          </StaggerItem>
        ))}
        {posts.length === 0 && <p className="text-sm text-gray-400">No recent posts.</p>}
      </Stagger>
    </div>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    const { supabase } = await import('../lib/supabaseClient');
    await supabase.from('newsletter_subscribers').insert({ email }).select();
    setSubscribed(true);
    setEmail('');
  }
  return (
    <div className="bg-gradient-to-br from-brand-blue to-dark-navy rounded-2xl p-6 text-white">
      <h3 className="font-bold text-lg mb-2">Newsletter</h3>
      <p className="text-sm text-white/70 mb-4">Get the latest posts delivered to your inbox.</p>
      {subscribed ? (
        <p className="text-green-400 text-sm font-medium">Thanks for subscribing!</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" required
            className="w-full px-4 py-2.5 rounded-xl text-dark-navy text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange" />
          <Button type="submit" variant="primary" size="lg" shape="md" className="w-full">
            Subscribe <FiArrowRight className="w-4 h-4" /></Button>
        </form>
      )}
    </div>
  );
}

function PopularTags({ tags, activeTag, onTagClick }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-bold text-dark-navy text-lg mb-4">Popular Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button key={tag.id} onClick={() => onTagClick?.(tag.name)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              activeTag === tag.name
                ? 'bg-brand-orange text-white'
                : 'bg-gray-100 text-text-gray hover:bg-brand-orange/10 hover:text-brand-orange'
            }`}>{tag.name}</button>
        ))}
        {tags.length === 0 && <p className="text-sm text-gray-400">No tags yet.</p>}
      </div>
    </div>
  );
}

function SinglePost({ slug }) {
  const { data: post, isLoading } = useBlogPost(slug);

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-dark-navy mb-4">Post not found</h1>
        <Link to="/blog" className="text-brand-accent hover:underline">Back to blog</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-text-gray hover:text-brand-accent mb-8 transition-colors">
        <FiArrowLeft className="w-4 h-4" /> Back to Blog</Link>
      <Reveal>
        {post.blog_categories && (
          <span className="inline-block px-3 py-1 bg-brand-orange/10 text-brand-orange text-xs font-semibold rounded-full mb-4">{post.blog_categories.name}</span>
        )}
        <h1 className="text-3xl lg:text-4xl font-extrabold text-dark-navy leading-tight">{post.title}</h1>
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
          <span className="flex items-center gap-1.5"><FiUser className="w-4 h-4" />{post.author || 'Admin'}</span>
          <span className="flex items-center gap-1.5"><FiCalendar className="w-4 h-4" />
            {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}</span>
        </div>
      </Reveal>
      <Reveal>
        {post.image_url && <img src={post.image_url} alt={post.title} className="w-full rounded-2xl mt-8 shadow-sm border border-gray-100" />}
        {post.excerpt && <p className="text-lg text-text-gray mt-8 leading-relaxed">{post.excerpt}</p>}
        <div className="mt-8 text-text-gray text-base leading-relaxed whitespace-pre-line">{post.content}</div>
      </Reveal>

      {post.tags && post.tags.length > 0 && (
        <div className="mt-10 pt-8 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link key={tag.id} to={`/blog?tag=${tag.name}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-text-gray rounded-full text-sm hover:bg-brand-orange/10 hover:text-brand-orange transition-colors">
                <FiTag className="w-3 h-3" />{tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Blog() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState(null);
  const [tag, setTag] = useState(searchParams.get('tag') || null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const urlTag = searchParams.get('tag');
    if (urlTag && urlTag !== tag) {
      setTag(urlTag);
      setCategory(null);
      setPage(1);
    }
  }, [searchParams]);

  const { data: postsData, isLoading } = useBlogPosts({ category, tag, search, page });
  const { data: categories } = useBlogCategories();
  const { data: recentPosts } = useRecentPosts(3);
  const { data: popularTags } = usePopularTags();

  if (slug) {
    return <SinglePost slug={slug} />;
  }

  const posts = postsData?.posts || [];
  const total = postsData?.total || 0;

  const isAllPage = !category && !tag && page === 1;
  const featured = isAllPage ? (posts.find((p) => p.is_featured) || posts[0]) : null;
  const gridPosts = featured ? posts.filter((p) => p.id !== featured.id) : posts;

  function handleSearch() {
    setCategory(null);
    setTag(null);
    setPage(1);
    setSearchParams({});
  }

  return (
    <div>
      <Hero search={search} onSearchChange={setSearch} onSearch={handleSearch} />
              <CategoryPills categories={categories || []} active={category} onChange={(slug) => { setCategory(slug); setTag(null); setPage(1); setSearchParams({}); }} />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {isLoading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-text-gray"><p className="text-lg">No articles found.</p></div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
            <div className="lg:w-[70%] space-y-6 sm:space-y-8">
              {isAllPage && featured && <FeaturedPost post={featured} />}
              <Stagger className="grid md:grid-cols-2 gap-6">
                {gridPosts.map((post) => (
                  <StaggerItem key={post.id} className="h-full">
                    <PostCard post={post} />
                  </StaggerItem>
                ))}
              </Stagger>
              <Pagination page={page} total={total} perPage={9} onChange={setPage} />
            </div>
            <Reveal variant="left" as="aside" className="lg:w-[30%] space-y-6">
              <RecentPostsWidget posts={recentPosts || []} />
              <NewsletterForm />
              <PopularTags tags={popularTags || []} activeTag={tag} onTagClick={(t) => { const next = t === tag ? null : t; setTag(next); setCategory(null); setPage(1); setSearchParams(next ? { tag: next } : {}); }} />
            </Reveal>
          </div>
        )}
      </section>
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-11 h-11 sm:w-12 sm:h-12 bg-brand-orange text-white rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 transition-colors z-50">
        <FiArrowUp className="w-5 h-5" /></button>
    </div>
  );
}
