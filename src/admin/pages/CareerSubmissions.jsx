import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { FiDownload, FiSearch, FiEye, FiX, FiChevronLeft, FiChevronRight, FiRefreshCw, FiFileText, FiLoader, FiChevronDown, FiCheck } from 'react-icons/fi';

const PAGE_OPTIONS = [10, 20, 30, 40, 50, 100];
const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance', 'Operations', 'Design', 'Content', 'Other'];
const CATEGORIES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'];

function MultiSelect({ label, options, selected, onChange, className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const allSelected = selected.size === options.length;
  const someSelected = selected.size > 0;

  const displayText = someSelected
    ? `${selected.size} selected`
    : `All ${label}s`;

  function toggleAll() {
    if (allSelected) {
      onChange(new Set());
    } else {
      onChange(new Set(options));
    }
  }

  return (
    <div ref={ref} className={`relative ${className || ''}`}>
      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">{label}</label>
      <button onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full min-w-[180px] px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent">
        <span className={someSelected ? 'text-dark-navy' : 'text-gray-400'}>{displayText}</span>
        <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 text-sm font-medium text-gray-600">
            <input type="checkbox" checked={allSelected}
              onChange={toggleAll}
              className="w-4 h-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent" />
            {allSelected ? 'Deselect All' : 'Select All'}
          </label>
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700">
              <input type="checkbox" checked={selected.has(opt)}
                onChange={() => {
                  const next = new Set(selected);
                  if (next.has(opt)) next.delete(opt);
                  else next.add(opt);
                  onChange(next);
                }}
                className="w-4 h-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent" />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CareerSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState(new Set());
  const [selectedCategories, setSelectedCategories] = useState(new Set());
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
        .from('career_submissions')
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
      .from('career_submissions')
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
        (s.phone || '').includes(q) ||
        (s.department || '').toLowerCase().includes(q) ||
        (s.category || '').toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q)
      );
    }
    if (selectedDepartments.size > 0) {
      result = result.filter((s) => selectedDepartments.has(s.department));
    }
    if (selectedCategories.size > 0) {
      result = result.filter((s) => selectedCategories.has(s.category));
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
  }, [submissions, search, selectedDepartments, selectedCategories, dateFilter, customStart, customEnd]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  function clearFilters() {
    setSearch('');
    setSelectedDepartments(new Set());
    setSelectedCategories(new Set());
    setDateFilter('all');
    setCustomStart('');
    setCustomEnd('');
    setPage(1);
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dark-navy">Career Submissions</h1>
        <div className="flex items-center gap-2">
          <button onClick={refresh} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all disabled:opacity-50">
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={() => setExportModal('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-sm">
            <FiFileText className="w-4 h-4" /> PDF
          </button>
          <button onClick={() => setExportModal('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-sm">
            <FiDownload className="w-4 h-4" /> CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Search</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name, email, phone..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-accent" />
            </div>
          </div>
          <MultiSelect
            label="Department"
            options={DEPARTMENTS}
            selected={selectedDepartments}
            onChange={(v) => { setSelectedDepartments(v); setPage(1); }}
          />
          <MultiSelect
            label="Category"
            options={CATEGORIES}
            selected={selectedCategories}
            onChange={(v) => { setSelectedCategories(v); setPage(1); }}
          />
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Date</label>
            <select value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setPage(1); setCustomStart(''); setCustomEnd(''); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent min-w-[140px]">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          {dateFilter === 'custom' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">From</label>
                <input type="date" value={customStart} onChange={(e) => { setCustomStart(e.target.value); setPage(1); }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">To</label>
                <input type="date" value={customEnd} onChange={(e) => { setCustomEnd(e.target.value); setPage(1); }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
              </div>
            </>
          )}
          <button onClick={clearFilters}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : paged.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FiSearch className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No submissions found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Phone</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Department</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Document</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paged.map((s, i) => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">{(page - 1) * pageSize + i + 1}</td>
                      <td className="px-4 py-3 font-medium text-dark-navy">{s.full_name}</td>
                      <td className="px-4 py-3 text-gray-600">{s.email}</td>
                      <td className="px-4 py-3 text-gray-600">{s.phone}</td>
                      <td className="px-4 py-3">{s.department ? <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{s.department}</span> : <span className="text-gray-400">—</span>}</td>
                      <td className="px-4 py-3">{s.category ? <span className="inline-block px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">{s.category}</span> : <span className="text-gray-400">—</span>}</td>
                      <td className="px-4 py-3">
                        {s.file_url ? (
                          <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline text-xs font-medium">View</a>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setSelected(s)}
                          className="p-1.5 text-gray-400 hover:text-brand-accent hover:bg-brand-accent/10 rounded-lg transition-all">
                          <FiEye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{filtered.length} total</span>
                <span className="text-xs text-gray-300">|</span>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-brand-accent bg-white">
                  {PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="text-xs text-gray-400">per page</span>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 mr-2">Page {page} of {totalPages}</span>
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-1.5 text-gray-400 hover:text-brand-accent disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-white transition-colors">
                    <FiChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const start = Math.max(1, page - 3);
                    const n = start + i;
                    if (n > totalPages) return null;
                    return (
                      <button key={n} onClick={() => setPage(n)}
                        className={`w-7 h-7 text-xs rounded-lg font-medium transition-colors ${n === page ? 'bg-brand-accent text-white' : 'text-gray-500 hover:bg-gray-200'}`}>
                        {n}
                      </button>
                    );
                  })}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="p-1.5 text-gray-400 hover:text-brand-accent disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-white transition-colors">
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Export Modal */}
      {exportModal && (
        <ExportDialog
          type={exportModal}
          allData={submissions}
          onClose={() => setExportModal(null)}
        />
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-dark-navy">Submission Details</h2>
              <button onClick={() => setSelected(null)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <DetailRow label="ID" value={selected.id} />
              <DetailRow label="Full Name" value={selected.full_name} />
              <DetailRow label="Email" value={selected.email} />
              <DetailRow label="Phone" value={selected.phone} />
              <DetailRow label="Department" value={selected.department} />
              <DetailRow label="Category" value={selected.category} />
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                <p className="text-sm text-dark-navy whitespace-pre-wrap">{selected.description || '—'}</p>
              </div>
              {selected.file_url && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Document</label>
                  <a href={selected.file_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-brand-accent hover:underline">
                    <FiEye className="w-4 h-4" /> View Document
                  </a>
                </div>
              )}
              <DetailRow label="Submitted At" value={new Date(selected.created_at).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })} />
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
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
      <p className="text-sm text-dark-navy break-all">{value || '—'}</p>
    </div>
  );
}

function ExportDialog({ type, allData, onClose }) {
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState(new Set());
  const [selectedCategories, setSelectedCategories] = useState(new Set());

  const filtered = useMemo(() => {
    let result = allData;
    if (selectedDepartments.size > 0) {
      result = result.filter((s) => selectedDepartments.has(s.department));
    }
    if (selectedCategories.size > 0) {
      result = result.filter((s) => selectedCategories.has(s.category));
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
  }, [allData, selectedDepartments, selectedCategories, dateFilter, customStart, customEnd]);

  async function exportCSV() {
    if (filtered.length === 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 30));
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Department', 'Category', 'Description', 'Document Link', 'Submitted At'];
    const rows = filtered.map((s) => [
      s.id,
      s.full_name, s.email, s.phone, s.department || '', s.category || '',
      (s.description || '').replace(/"/g, '""'), s.file_url || '', s.created_at,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setLoading(false);
    onClose();
  }

  async function exportPDF() {
    if (filtered.length === 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 50));
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);
    const pdf = new jsPDF('l', 'mm', 'a4');
    const rows = filtered.map((s) => [
      s.full_name, s.email, s.phone, s.department || '—', s.category || '—',
      s.file_url || '—', new Date(s.created_at).toLocaleDateString(),
    ]);
    autoTable(pdf, {
      head: [['Name', 'Email', 'Phone', 'Department', 'Category', 'Document Link', 'Date']],
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: ['#1e293b'] },
      margin: { top: 20 },
    });
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Career Submissions', 14, 14);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated: ${new Date().toLocaleDateString()}  |  ${filtered.length} submissions`, 14, 20);
    pdf.save(`career-submissions-${new Date().toISOString().slice(0, 10)}.pdf`);
    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-dark-navy">Export {type.toUpperCase()}</h2>
            <p className="text-xs text-gray-400">Choose filters for the report</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <FiX className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Date Range</label>
            <select value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setCustomStart(''); setCustomEnd(''); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          {dateFilter === 'custom' && (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">From</label>
                <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">To</label>
                <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Department</label>
            <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              <label className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm font-medium text-gray-600 bg-gray-50/50">
                <input type="checkbox"
                  checked={selectedDepartments.size === DEPARTMENTS.length}
                  onChange={() => setSelectedDepartments(selectedDepartments.size === DEPARTMENTS.length ? new Set() : new Set(DEPARTMENTS))}
                  className="w-4 h-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent" />
                {selectedDepartments.size === DEPARTMENTS.length ? 'Deselect All' : 'Select All'}
              </label>
              {DEPARTMENTS.map((d) => (
                <label key={d} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700">
                  <input type="checkbox" checked={selectedDepartments.has(d)}
                    onChange={() => {
                      const next = new Set(selectedDepartments);
                      if (next.has(d)) next.delete(d);
                      else next.add(d);
                      setSelectedDepartments(next);
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent" />
                  {d}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Category</label>
            <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              <label className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm font-medium text-gray-600 bg-gray-50/50">
                <input type="checkbox"
                  checked={selectedCategories.size === CATEGORIES.length}
                  onChange={() => setSelectedCategories(selectedCategories.size === CATEGORIES.length ? new Set() : new Set(CATEGORIES))}
                  className="w-4 h-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent" />
                {selectedCategories.size === CATEGORIES.length ? 'Deselect All' : 'Select All'}
              </label>
              {CATEGORIES.map((c) => (
                <label key={c} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700">
                  <input type="checkbox" checked={selectedCategories.has(c)}
                    onChange={() => {
                      const next = new Set(selectedCategories);
                      if (next.has(c)) next.delete(c);
                      else next.add(c);
                      setSelectedCategories(next);
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent" />
                  {c}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-gray-400">{filtered.length} submission{filtered.length !== 1 ? 's' : ''}</span>
          <button onClick={type === 'pdf' ? exportPDF : exportCSV}
            disabled={loading || filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 shadow-sm">
            {loading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiDownload className="w-4 h-4" />}
            {loading ? 'Exporting...' : `Export ${type.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
