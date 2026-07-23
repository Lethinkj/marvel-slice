import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { FiSearch, FiEye, FiRefreshCw, FiDownload, FiCheck, FiX, FiChevronLeft, FiChevronRight, FiFileText, FiLoader, FiSend } from 'react-icons/fi';
import ReplyModal from '../components/ReplyModal';

const PAGE_SIZE = 15;

export default function BrochureDownloads() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [readFilter, setReadFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selected, setSelected] = useState(null);
  const [exportModal, setExportModal] = useState(null);
  const [replyTo, setReplyTo] = useState(null);

  async function fetchDownloads() {
    setLoading(true);
    let query = supabase.from('brochure_downloads').select('*');

    if (readFilter === 'read') query = query.eq('is_read', true);
    else if (readFilter === 'unread') query = query.eq('is_read', false);

    const now = new Date();
    if (dateFilter === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      query = query.gte('created_at', start);
    } else if (dateFilter === '7d') {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', start);
    } else if (dateFilter === '30d') {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', start);
    } else if (dateFilter === 'custom' && customStart) {
      query = query.gte('created_at', new Date(customStart).toISOString());
      if (customEnd) query = query.lte('created_at', new Date(customEnd + 'T23:59:59').toISOString());
    }

    query = query.order('created_at', { ascending: false });

    const { data } = await query;
    setDownloads(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchDownloads(); }, [readFilter, dateFilter, customStart, customEnd]);

  async function toggleRead(download) {
    await supabase.from('brochure_downloads').update({ is_read: !download.is_read }).eq('id', download.id);
    setDownloads(prev => prev.map(d => d.id === download.id ? { ...d, is_read: !download.is_read } : d));
    if (selected?.id === download.id) setSelected({ ...selected, is_read: !download.is_read });
  }

  function clearFilters() {
    setReadFilter('all');
    setDateFilter('all');
    setCustomStart('');
    setCustomEnd('');
    setSearch('');
    setPage(1);
  }

  const filtered = useMemo(() => downloads.filter(d =>
    !search || d.name?.toLowerCase().includes(search.toLowerCase()) || d.email?.toLowerCase().includes(search.toLowerCase()) || d.course_title?.toLowerCase().includes(search.toLowerCase())
  ), [downloads, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Brochure Downloads</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{filtered.length} download{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchDownloads} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-neutral-300 text-neutral-600 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-all disabled:opacity-50">
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={() => setExportModal('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-accent-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all">
            <FiFileText className="w-4 h-4" /> PDF
          </button>
          <button onClick={() => setExportModal('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-accent-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all">
            <FiDownload className="w-4 h-4" /> CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 mb-6 p-4 bg-white rounded-xl border border-neutral-200">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">Search</label>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Name, email, or course..."
              className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">Status</label>
          <select value={readFilter} onChange={e => { setReadFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-500">
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">Date</label>
          <select value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-500">
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="custom">Custom range</option>
          </select>
        </div>
        {dateFilter === 'custom' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">From</label>
              <input type="date" value={customStart} onChange={e => { setCustomStart(e.target.value); setPage(1); }}
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">To</label>
              <input type="date" value={customEnd} onChange={e => { setCustomEnd(e.target.value); setPage(1); }}
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
            </div>
          </>
        )}
        <button onClick={clearFilters}
          className="px-3 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-700 transition-colors">
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-16 text-neutral-400 text-sm">No brochure downloads found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Phone</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Course</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Date</th>
                  <th className="text-center px-4 py-3 font-semibold text-neutral-600">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-neutral-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((d, i) => (
                  <tr key={d.id} className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${!d.is_read ? 'bg-accent-50/40' : ''}`}>
                    <td className="px-4 py-3 text-xs text-neutral-400 font-mono">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-4 py-3 font-medium text-neutral-900">{d.name}</td>
                    <td className="px-4 py-3 text-neutral-600">{d.email}</td>
                    <td className="px-4 py-3 text-neutral-600">{d.phone || '—'}</td>
                    <td className="px-4 py-3 text-neutral-600 max-w-[200px] truncate">{d.course_title || '—'}</td>
                    <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">{new Date(d.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${d.is_read ? 'bg-neutral-100 text-neutral-500' : 'bg-accent-100 text-accent-700'}`}>
                        {d.is_read ? 'Read' : 'New'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setReplyTo(d)} className="p-1.5 text-neutral-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors" title="Reply">
                          <FiSend className="w-4 h-4" />
                        </button>
                        <button onClick={() => setSelected(d)} className="p-1.5 text-neutral-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors" title="View">
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button onClick={() => toggleRead(d)} className={`p-1.5 rounded-lg transition-colors ${d.is_read ? 'text-neutral-400 hover:text-brand-orange hover:bg-brand-orange/10' : 'text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50'}`} title={d.is_read ? 'Mark unread' : 'Mark read'}>
                          {d.is_read ? <FiX className="w-4 h-4" /> : <FiCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <FiChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${page === i + 1 ? 'bg-accent-600 text-white' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'}`}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Export Modal */}
      {exportModal && (
        <ExportDialog type={exportModal} allData={downloads} onClose={() => setExportModal(null)} />
      )}

      {/* Reply Modal */}
      {replyTo && <ReplyModal submission={replyTo} type="brochure" onClose={() => setReplyTo(null)} />}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-neutral-100">
              <h2 className="text-base font-semibold text-neutral-900">Download Details</h2>
              <button onClick={() => setSelected(null)} className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-neutral-500 font-medium">Name</span>
                <span className="col-span-2 text-neutral-900">{selected.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-neutral-500 font-medium">Email</span>
                <span className="col-span-2 text-neutral-900">{selected.email}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-neutral-500 font-medium">Phone</span>
                <span className="col-span-2 text-neutral-900">{selected.phone || '—'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-neutral-500 font-medium">Course</span>
                <span className="col-span-2 text-neutral-900">{selected.course_title || '—'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-neutral-500 font-medium">Course ID</span>
                <span className="col-span-2 text-neutral-500 font-mono text-xs">{selected.course_id || '—'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-neutral-500 font-medium">Date</span>
                <span className="col-span-2 text-neutral-900">{new Date(selected.created_at).toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-neutral-500 font-medium">Status</span>
                <span className="col-span-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${selected.is_read ? 'bg-neutral-100 text-neutral-500' : 'bg-accent-100 text-accent-700'}`}>
                    {selected.is_read ? 'Read' : 'Unread'}
                  </span>
                </span>
              </div>
              <div className="flex justify-end pt-2 gap-2">
                <button onClick={() => { const s = selected; setSelected(null); setTimeout(() => setReplyTo(s), 100); }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all">
                  <FiSend className="w-4 h-4" /> Reply
                </button>
                <button onClick={() => { toggleRead(selected); }}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${selected.is_read ? 'bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/20' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>
                  {selected.is_read ? 'Mark as Unread' : 'Mark as Read'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExportDialog({ type, allData, onClose }) {
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [readFilter, setReadFilter] = useState('all');

  const filtered = useMemo(() => {
    let result = allData;
    if (readFilter === 'read') result = result.filter(s => s.is_read);
    else if (readFilter === 'unread') result = result.filter(s => !s.is_read);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (dateFilter === 'today') {
      result = result.filter(s => new Date(s.created_at) >= startOfToday);
    } else if (dateFilter === '7d') {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter(s => new Date(s.created_at) >= start);
    } else if (dateFilter === '30d') {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      result = result.filter(s => new Date(s.created_at) >= start);
    } else if (dateFilter === 'custom' && customStart) {
      const from = new Date(customStart);
      const to = customEnd ? new Date(customEnd + 'T23:59:59') : new Date(from.getFullYear(), from.getMonth(), from.getDate(), 23, 59, 59);
      result = result.filter(s => { const d = new Date(s.created_at); return d >= from && d <= to; });
    }
    return result;
  }, [allData, readFilter, dateFilter, customStart, customEnd]);

  async function exportCSV() {
    if (filtered.length === 0) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 30));
    const headers = ['SL.No', 'Name', 'Email', 'Phone', 'Course', 'Course ID', 'Status', 'Date'];
    const rows = filtered.map((s, i) => [
      i + 1, s.name, s.email, s.phone || '', s.course_title || '', s.course_id || '', s.is_read ? 'Read' : 'Unread', s.created_at,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'brochure-downloads-' + new Date().toISOString().slice(0, 10) + '.csv'; a.click();
    URL.revokeObjectURL(url);
    setLoading(false);
    onClose();
  }

  async function exportPDF() {
    if (filtered.length === 0) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 50));
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'), import('jspdf-autotable'),
    ]);
    const pdf = new jsPDF('l', 'mm', 'a4');
    const rows = filtered.map((s, i) => [
      i + 1, s.name, s.email, s.phone || '—', s.course_title || '—', s.is_read ? 'Read' : 'Unread', new Date(s.created_at).toLocaleDateString(),
    ]);
    autoTable(pdf, {
      head: [['#', 'Name', 'Email', 'Phone', 'Course', 'Status', 'Date']],
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: ['#1e293b'] },
      margin: { top: 20 },
    });
    pdf.setFontSize(16); pdf.setFont('helvetica', 'bold');
    pdf.text('Brochure Downloads', 14, 14);
    pdf.setFontSize(8); pdf.setFont('helvetica', 'normal');
    pdf.text('Generated: ' + new Date().toLocaleDateString() + '  |  ' + filtered.length + ' downloads', 14, 20);
    pdf.save('brochure-downloads-' + new Date().toISOString().slice(0, 10) + '.pdf');
    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg border border-neutral-200 w-full max-w-md max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Export {type.toUpperCase()}</h2>
            <p className="text-xs text-neutral-400">Choose filters for the report</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-lg transition-colors"><FiX className="w-5 h-5 text-neutral-400" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">Date Range</label>
            <select value={dateFilter} onChange={e => { setDateFilter(e.target.value); setCustomStart(''); setCustomEnd(''); }}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          {dateFilter === 'custom' && (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">From</label>
                <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">To</label>
                <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">Status</label>
            <select value={readFilter} onChange={e => setReadFilter(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500">
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-neutral-400">{filtered.length} download{filtered.length !== 1 ? 's' : ''}</span>
          <button onClick={type === 'pdf' ? exportPDF : exportCSV} disabled={loading || filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-accent-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50">
            {loading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiDownload className="w-4 h-4" />}
            {loading ? 'Exporting...' : 'Export ' + type.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}
