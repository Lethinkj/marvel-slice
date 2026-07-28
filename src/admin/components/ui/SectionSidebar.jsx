import React from 'react';

export function SectionSidebar({ navItems, activeItemKey, onNavClick }) {
  return (
    <div className="w-[220px] transition-all duration-200">
      <nav className="sticky top-6 self-start max-h-[calc(100vh-80px)] overflow-y-auto">
        <div className="bg-white rounded-xl border border-admin-200 shadow-sm p-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = activeItemKey === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavClick(item.key)}
                className={`cursor-pointer w-full flex items-center text-sm font-medium text-left transition-all rounded-lg min-h-[40px] px-2.5 py-2 gap-2 ${
                  isActive 
                    ? 'bg-admin-50 text-admin-600 font-semibold border-l-[3px] border-admin-600 -ml-[1px]' 
                    : 'text-neutral-600 hover:bg-admin-50 hover:text-admin-600 border-l-[3px] border-transparent'
                }`}
                title={item.label}
              >
                {Icon && <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-admin-600' : 'text-neutral-400'}`} />}
                <span className="flex-1 truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
