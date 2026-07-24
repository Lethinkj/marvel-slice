import { useState, useMemo } from 'react';

function SearchIcon() {
  return (
    <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

export default function DataTable({
  columns,
  data,
  searchable = true,
  searchPlaceholder = 'Search...',
  filterFn,
  emptyTitle,
  emptyDescription,
  emptyAction,
  onRowClick,
  rowKey = 'id',
  isLoading,
  variant = 'table',
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return data || [];
    const q = search.toLowerCase();
    return (data || []).filter((row) => {
      if (filterFn) return filterFn(row, q);
      return columns.some((col) => {
        const val = col.accessor ? row[col.accessor] : '';
        return String(val || '').toLowerCase().includes(q);
      });
    });
  }, [data, search, filterFn, columns]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
        </div>
        {emptyTitle && <h3 className="text-sm font-semibold text-neutral-700 mb-1">{emptyTitle}</h3>}
        {emptyDescription && <p className="text-xs text-neutral-400 max-w-xs">{emptyDescription}</p>}
        {emptyAction && <div className="mt-4">{emptyAction}</div>}
      </div>
    );
  }

  const renderSearchBar = () => (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100">
      <div className="relative flex-1 max-w-xs">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><SearchIcon /></div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-9 pr-3 h-8 rounded-lg border border-neutral-200 bg-neutral-50 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all"
        />
      </div>
    </div>
  );

  const renderCell = (row, col) =>
    col.cell ? col.cell(row) : col.accessor ? row[col.accessor] : null;

  const renderNoResults = () =>
    filtered.length === 0 && search ? (
      <div className="flex flex-col items-center py-12 text-center">
        <p className="text-sm text-neutral-400">No results match your search.</p>
        <button onClick={() => setSearch('')} className="mt-2 text-xs font-semibold text-accent-600 hover:text-accent-700">
          Clear search
        </button>
      </div>
    ) : null;

  if (variant === 'cards') {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 shadow-card overflow-hidden">
        {searchable && renderSearchBar()}
        <div className="divide-y divide-neutral-100">
          {filtered.map((row) => (
            <div
              key={row[rowKey]}
              onClick={() => onRowClick?.(row)}
              className="px-5 py-4 flex items-center gap-4 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              {columns.map((col, i) => (
                <div key={i} className={`${i === 0 ? 'flex-1 min-w-0' : 'shrink-0'} ${col.className || ''}`}>
                  {renderCell(row, col)}
                </div>
              ))}
            </div>
          ))}
        </div>
        {renderNoResults()}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-card overflow-hidden">
      {searchable && renderSearchBar()}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/50">
              {columns.map((col, i) => (
                <th key={i} className={`text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr
                key={row[rowKey]}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-neutral-50 last:border-0 transition-colors ${onRowClick ? 'cursor-pointer hover:bg-neutral-50' : 'hover:bg-neutral-50/50'}`}
              >
                {columns.map((col, i) => (
                  <td key={i} className={`px-4 py-3 text-sm text-neutral-700 ${col.className || ''}`}>
                    {renderCell(row, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {renderNoResults()}
    </div>
  );
}
