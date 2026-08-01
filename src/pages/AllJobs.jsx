import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import Reveal from '../components/ui/Reveal';
import {
  FiMapPin, FiClock, FiDollarSign,
  FiBriefcase, FiBookmark, FiArrowRight,
  FiChevronLeft, FiChevronRight, FiSearch, FiArrowLeft,
} from 'react-icons/fi';

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

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
        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <FiChevronLeft className="w-5 h-5" /></button>
      {pages.map((p, i) => (
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="w-8 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-gray-500 text-sm">…</span>
        ) : (
          <button key={p} onClick={() => onChange(p)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-sm font-medium transition-colors ${
              p === page ? 'bg-blue-600 text-white shadow-md' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}>{p}</button>
        )
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages}
        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <FiChevronRight className="w-5 h-5" /></button>
    </div>
  );
}

export default function AllJobs() {
  const [page, setPage] = useState(1);
  const perPage = 6;

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['job-openings-all'],
    queryFn: async () => {
      const { data } = await supabase
        .from('job_openings')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const totalPages = Math.ceil((jobs?.length || 0) / perPage);
  const start = (page - 1) * perPage;
  const pageJobs = jobs?.slice(start, start + perPage) || [];

  return (
    <div className="bg-gradient-to-b from-blue-50/40 via-slate-50 to-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Reveal>
          <Link to="/career" className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-sm mb-6 transition-colors">
            <FiArrowLeft className="w-4 h-4" /> Back to Career
          </Link>

          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">All Job Openings</h1>
            <p className="text-slate-600 text-sm mt-1">Browse every open position and apply today.</p>
            <div className="w-12 h-1 bg-blue-500 mx-auto rounded-full mt-3" />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <span className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : pageJobs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pageJobs.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-brand-orange/10 text-brand-orange p-2.5 rounded-xl shrink-0">
                        <FiBriefcase className="w-5 h-5" />
                      </div>
                      <h3 className="flex-1 font-bold text-slate-800 text-lg leading-tight">{job.title}</h3>
                      <FiBookmark className="w-5 h-5 text-brand-orange/60 hover:text-brand-orange cursor-pointer shrink-0 transition-colors" />
                    </div>
                    {(job.experience || job.salary) && (
                      <div className="flex items-center gap-4 border-y border-slate-100 py-2.5 px-3 my-3 rounded-lg bg-slate-50/60 text-sm text-slate-600">
                        {job.experience && (
                          <span className="flex items-center gap-1.5">
                            <FiClock className="w-3.5 h-3.5 text-blue-500" />{job.experience}
                          </span>
                        )}
                        {job.salary && (
                          <span className="flex items-center gap-1.5">
                            <FiDollarSign className="w-3.5 h-3.5 text-blue-500" />{job.salary}
                          </span>
                        )}
                      </div>
                    )}
                    {job.description && (
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-3 flex-1">
                        {job.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-2">
                      {job.location ? (
                        <span className="text-slate-600 text-sm flex items-center gap-1 font-medium">
                          <FiMapPin className="w-3.5 h-3.5 shrink-0" />{job.location}
                        </span>
                      ) : <span />}
                      <button
                        onClick={() => {
                          if (job.apply_url?.trim()) {
                            window.open(job.apply_url.trim(), '_blank', 'noopener,noreferrer');
                          } else {
                            window.location.href = `/career?apply=${encodeURIComponent(job.title || '')}`;
                          }
                        }}
                        className="inline-flex items-center gap-1.5 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-all cursor-pointer">
                        Apply Now <FiArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </>
          ) : (
            <div className="text-center py-20">
              <FiSearch className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No openings right now — check back soon!</p>
              <Link to="/career" className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 text-sm font-semibold rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                Back to Career
              </Link>
            </div>
          )}
        </Reveal>
      </div>
    </div>
  );
}
