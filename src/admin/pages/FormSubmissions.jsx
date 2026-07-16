import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { FiSearch, FiEye, FiX, FiChevronLeft, FiChevronRight, FiRefreshCw, FiDownload, FiLoader } from 'react-icons/fi';

const PAGE_OPTIONS = [10, 20, 30, 50, 100];

export default function FormSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dateFilter, setDateFilter] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selected, setSelected] = useState(null);
  const [exportModal, setExportModal] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('form_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      setSubmissions(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function refresh() {
    setLoading(true);
    const { data } = await supabase
      .from('form_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    setSubmissions(data || []);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    let result = submissions;
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((s) =>
        (s.full_name || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q) ||
        (s.phone || '').includes(q)
      );
    }
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (dateFilter === 'today') {
      result = result.filter((s) => new Date(s.created_at) >= startOfToday);
    } else if (dateFilter === 'custom' && customStart) {
      const from = new Date(customStart);
      const to = customEnd ? new Date(customEnd + 'T23:59:59') : new Date(from.getFullYear(), from.getMonth(), from.getDate(), 23, 59, 59);
      result = result.filter((s) => {
        const d = new Date(s.created_at);
        return d >= from && d <= to;
      });
    }
    return result;
  }, [submissions, search, dateFilter, customStart, customEnd]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  function clearFilters() {
    setSearch('');
    setDateFilter('all');
    setCustomStart('');
    setCustomEnd('');
    setPage(1);
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Form Submissions</h1>
        <div className="flex items-center gap-2">
          <button onClick={refresh} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-neutral-300 text-neutral-600 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-all disabled:opacity-50">
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={() => setExportModal('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-accent-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all">
            <FiDownload className="w-4 h-4" /> CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 p-4 mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">Search</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name, email, phone..."
                className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">Date</label>
            <select value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setPage(1); setCustomStart(''); setCustomEnd(''); }}
              className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 min-w-[140px]">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          {dateFilter === 'custom' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">From</label>
                <input type="date" value={customStart} onChange={(e) => { setCustomStart(e.target.value); setPage(1); }}
                  className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">To</label>
                <input type="date" value={customEnd} onChange={(e) => { setCustomEnd(e.target.value); setPage(1); }}
                  className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
              </div>
            </>
          )}
          <button onClick={clearFilters}
            className="px-3 py-2 text-sm text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
            Clear
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : paged.length === 0 ? (
          <div className="text-center py-16 text-neutral-400">
            <FiSearch className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No submissions found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="text-left px-4 py-3 font-semibold text-neutral-600">#</th>
                    <th className="text-left px-4 py-3 font-semibold text-neutral-600">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-neutral-600">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-neutral-600">Phone</th>
                    <th className="text-left px-4 py-3 font-semibold text-neutral-600">Date</th>
                    <th className="text-right px-4 py-3 font-semibold text-neutral-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {paged.map((s, i) => (
                    <tr key={s.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-neutral-400 font-mono">{(page - 1) * pageSize + i + 1}</td>
                      <td className="px-4 py-3 font-medium text-neutral-900">{s.full_name}</td>
                      <td className="px-4 py-3 text-neutral-600">{s.email}</td>
                      <td className="px-4 py-3 text-neutral-600">{s.phone}</td>
                      <td className="px-4 py-3 text-neutral-500 text-xs whitespace-nowrap">{new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setSelected(s)}
                          className="p-1.5 text-neutral-400 hover:text-accent-700 hover:bg-accent-100 rounded-lg transition-all">
                          <FiEye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 bg-neutral-50/50">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">{filtered.length} total</span>
                <span className="text-xs text-neutral-300">|</span>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="text-xs border border-neutral-200 rounded px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white">
                  {PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="text-xs text-neutral-400">per page</span>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-neutral-500 mr-2">Page {page} of {totalPages}</span>
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-1.5 text-neutral-400 hover:text-accent-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-white transition-colors">
                    <FiChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const start = Math.max(1, page - 3);
                    const n = start + i;
                    if (n > totalPages) return null;
                    return (
                      <button key={n} onClick={() => setPage(n)}
                        className={`w-7 h-7 text-xs rounded-lg font-medium transition-colors ${n === page ? 'bg-accent-600 text-white' : 'text-neutral-500 hover:bg-neutral-200'}`}>
                        {n}
                      </button>
                    );
                  })}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="p-1.5 text-neutral-400 hover:text-accent-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-white transition-colors">
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {exportModal === 'csv' && (
        <ExportCSV allData={filtered} onClose={() => setExportModal(null)} />
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-lg border border-neutral-200 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-bold text-neutral-900">Submission Details</h2>
              <button onClick={() => setSelected(null)} className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <DetailRow label="ID" value={selected.id} />
              <DetailRow label="Full Name" value={selected.full_name} />
              <DetailRow label="Email" value={selected.email} />
              <DetailRow label="Phone" value={selected.phone} />
              <DetailRow label="Submitted At" value={new Date(selected.created_at).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })} />
              <div className="pt-2">
                <a href={`mailto:${selected.email}?subject=Marvel%20Slice%20-%20Your%20Demo%20Class%20Inquiry&body=Hi%20${encodeURIComponent(selected.full_name)}%2C%0A%0AThank%20you%20for%20your%20interest%20in%20Marvel%20Slice.%20We%20will%20get%20back%20to%20you%20shortly.%0A%0ARegards%2C%0AMarvel%20Slice%20Team`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all">
                  <FiDownload className="w-4 h-4 rotate-90" /> Send Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">{label}</label>
      <p className="text-sm text-neutral-900 break-all">{value || '—'}</p>
    </div>
  );
}

function ExportCSV({ allData, onClose }) {
  const [loading, setLoading] = useState(false);

  async function doExport() {
    if (allData.length === 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 30));
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Submitted At'];
    const rows = allData.map((s) => [
      s.id, s.full_name, s.email, s.phone, s.created_at,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg border border-neutral-200 w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-neutral-900 mb-2">Export CSV</h2>
        <p className="text-sm text-neutral-500 mb-4">Export {allData.length} submission{allData.length !== 1 ? 's' : ''} to CSV</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-600 hover:bg-neutral-50 transition-colors">Cancel</button>
          <button onClick={doExport} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-accent-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50">
            {loading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiDownload className="w-4 h-4" />}
            {loading ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}
