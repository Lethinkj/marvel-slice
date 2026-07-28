import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function SectionAccordion({ title, defaultExpanded = false, children }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-admin-200 overflow-hidden mb-6">
      <button 
        type="button" 
        onClick={() => setExpanded(!expanded)} 
        className={`w-full flex items-center justify-between px-6 py-4 bg-gray-50/50 hover:bg-gray-50 transition-colors ${expanded ? 'border-b border-admin-100' : ''}`}
      >
        <h2 className="text-base font-semibold text-black">{title}</h2>
        {expanded ? (
          <FiChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <FiChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {expanded && (
        <div className="p-6 space-y-6">
          {children}
        </div>
      )}
    </div>
  );
}
