import { useMemo } from 'react';

export default function Pagination({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  onItemsPerPageChange,
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const pages = useMemo(() => {
    const range = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) range.push(i);
    } else {
      range.push(1);
      if (currentPage > 3) range.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) range.push(i);
      if (currentPage < totalPages - 2) range.push('...');
      range.push(totalPages);
    }
    return range;
  }, [totalPages, currentPage]);

  if (totalItems === 0) return null;

  return (
    <div className="flex items-center justify-between w-full">
      <div className="text-sm text-neutral-600 font-sans">
        {startItem.toLocaleString()}-{endItem.toLocaleString()} of {totalItems.toLocaleString()}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="text-sm font-medium text-neutral-700 disabled:text-neutral-300 disabled:cursor-not-allowed hover:text-black transition-colors"
        >
          &lt; Back
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-sm text-neutral-400">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-10 h-10 rounded-md flex items-center justify-center text-sm font-medium transition-colors ${
                p === currentPage
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-200 text-black hover:bg-gray-100'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="text-sm font-medium text-neutral-700 disabled:text-neutral-300 disabled:cursor-not-allowed hover:text-black transition-colors"
        >
          Next &gt;
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-600">Result per page</span>
        <div className="relative">
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="h-9 pl-3 pr-8 rounded-md border border-gray-200 bg-white text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500/20 focus:border-neutral-500 transition-all appearance-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={150}>150</option>
          </select>
          <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
