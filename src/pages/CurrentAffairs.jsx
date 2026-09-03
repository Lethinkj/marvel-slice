import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FiArrowLeft,
  FiArrowRight,
  FiX,
  FiLoader,
  FiSearch,
  FiCalendar,
  FiGlobe,
  FiExternalLink,
  FiBookmark,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { RSS_FEEDS, fetchRssFeed } from '../lib/rssService';

const ITEMS_PER_PAGE = 9;

const CATEGORIES = [
  'All Topics',
  'Banking & RBI',
  'Economy & Business',
  'Government Schemes',
  'National Affairs',
  'International Affairs',
  'Science & Defense',
  'Sports & Awards',
];

export default function CurrentAffairs() {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('All Topics');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Fetch articles from Supabase current_affairs
  const { data: dbArticles, isLoading: isDbLoading } = useQuery({
    queryKey: ['current_affairs_articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('current_affairs')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(100);

      if (error) {
        console.warn('Supabase current_affairs query note:', error.message);
        return [];
      }
      return data || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  // Live RSS Fallback Query if DB table is being initialized
  const { data: rssFallbackArticles, isLoading: isRssLoading } = useQuery({
    queryKey: ['current_affairs_rss_fallback'],
    queryFn: async () => {
      if (dbArticles && dbArticles.length > 0) return [];
      const results = await Promise.all(RSS_FEEDS.slice(0, 4).map((f) => fetchRssFeed(f)));
      const combined = results.flat();
      return combined.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
    },
    enabled: (!dbArticles || dbArticles.length === 0) && !isDbLoading,
    staleTime: 5 * 60 * 1000,
  });

  const articles = useMemo(() => {
    if (dbArticles && dbArticles.length > 0) return dbArticles;
    return rssFallbackArticles || [];
  }, [dbArticles, rssFallbackArticles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchesCategory =
        activeCategory === 'All Topics' ||
        art.category?.toLowerCase() === activeCategory.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        art.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [articles, activeCategory, searchQuery]);

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE) || 1;

  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredArticles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredArticles, currentPage]);

  function handleCategorySelect(cat) {
    setActiveCategory(cat);
    setCurrentPage(1);
  }

  function handleSearchChange(e) {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }

  function handlePageChange(pageNum) {
    setCurrentPage(pageNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function getPageNumbers(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
    if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    return [1, '...', current - 1, current, current + 1, '...', total];
  }

  function formatDate(isoStr) {
    if (!isoStr) return 'Recent';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recent';
    }
  }

  function handleBackNavigation(e) {
    if (e) e.preventDefault();
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  }

  return (
    <div className="bg-white min-h-screen text-slate-800">
      <div className="current-affairs-content">
        {/* LIVE CURRENT AFFAIRS FEED SECTION */}
        <section className="py-8 sm:py-12 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <button
              type="button"
              onClick={handleBackNavigation}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-orange transition-colors cursor-pointer group mb-2"
            >
              <FiArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-orange transition-transform group-hover:-translate-x-0.5" />
              <span>Back</span>
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-navy">
                  Daily Current Affairs & Exam Notes
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Filtered and categorized automatically for competitive exam revision.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search articles, RBI, schemes..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-all shadow-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-brand-blue text-white border-brand-blue shadow-md'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-brand-blue/40 hover:text-brand-blue'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Articles Grid */}
            {isDbLoading || isRssLoading ? (
              <div className="py-16 text-center space-y-3">
                <FiLoader className="w-8 h-8 animate-spin text-brand-blue mx-auto" />
                <p className="text-sm font-semibold text-slate-600">Loading latest current affairs updates...</p>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-3 max-w-md mx-auto">
                <FiGlobe className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-dark-navy">No articles match your search</h3>
                <p className="text-xs text-slate-500">
                  Try switching categories or clearing your search.
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                    className="px-5 py-2 bg-brand-blue text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>Clear Search</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedArticles.map((art, idx) => (
                    <motion.div
                      key={art.id || art.source_url || idx}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white border border-[#E5ECF5] hover:border-brand-orange/40 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div className="p-5 space-y-3">
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-brand-blue border border-blue-200/80">
                            {art.category || 'General'}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                            <FiCalendar className="w-3 h-3 text-slate-400" />
                            <span>{formatDate(art.published_at)}</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-bold text-dark-navy leading-snug group-hover:text-brand-blue transition-colors line-clamp-2">
                          {art.title}
                        </h3>

                        {/* Summary */}
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {art.summary}
                        </p>
                      </div>

                      {/* Footer / Action */}
                      <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500 truncate max-w-[140px]">
                          Source: {art.source || 'Official News'}
                        </span>

                        <button
                          type="button"
                          onClick={() => setSelectedArticle(art)}
                          className="text-xs font-bold text-brand-orange hover:text-orange-600 inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>Read Takeaway</span>
                          <FiArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* PAGINATION CONTROLS */}
                {filteredArticles.length > ITEMS_PER_PAGE && (
                  <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80">
                    <span className="text-xs text-slate-500 font-medium">
                      Showing <span className="font-bold text-dark-navy">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                      <span className="font-bold text-dark-navy">{Math.min(currentPage * ITEMS_PER_PAGE, filteredArticles.length)}</span> of{' '}
                      <span className="font-bold text-dark-navy">{filteredArticles.length}</span> articles
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-brand-blue/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all inline-flex items-center gap-1"
                      >
                        <FiChevronLeft className="w-3.5 h-3.5" />
                        <span>Prev</span>
                      </button>

                      {getPageNumbers(currentPage, totalPages).map((p, i) =>
                        p === '...' ? (
                          <span key={`ellipsis-${i}`} className="px-2 text-xs font-bold text-slate-400">
                            ...
                          </span>
                        ) : (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handlePageChange(p)}
                            className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              currentPage === p
                                ? 'bg-brand-blue text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-blue/40'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}

                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-brand-blue/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all inline-flex items-center gap-1"
                      >
                        <span>Next</span>
                        <FiChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ARTICLE DETAIL MODAL */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-blue-100 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-brand-blue text-white px-6 py-4 flex items-center justify-between border-b border-blue-600/30">
                <div>
                  <span className="text-[11px] uppercase font-extrabold tracking-wider bg-white/15 px-2.5 py-0.5 rounded-md text-white border border-white/20">
                    {selectedArticle.category || 'Current Affairs'}
                  </span>
                  <p className="text-xs text-white/80 mt-1">
                    Published: {formatDate(selectedArticle.published_at)} • Source: {selectedArticle.source || 'News'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="w-7 h-7 rounded-full bg-white text-red-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                >
                  <FiX className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                <h3 className="text-lg sm:text-xl font-extrabold text-dark-navy leading-snug">
                  {selectedArticle.title}
                </h3>

                <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-brand-blue uppercase tracking-wider">
                    <FiBookmark className="w-4 h-4" />
                    <span>Summary & Exam Relevance</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    {selectedArticle.summary}
                  </p>
                </div>

                {selectedArticle.content && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detailed Exam Notes</h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {selectedArticle.content}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                {selectedArticle.source_url ? (
                  <a
                    href={selectedArticle.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:text-brand-orange transition-colors"
                  >
                    <span>Read Original Article on {selectedArticle.source || 'News'}</span>
                    <FiExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">Verified News Source</span>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
