export default function Card({ title, description, children, actions, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      {(title || actions) && (
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-900">{title}</h3>}
            {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0 ml-4">{actions}</div>}
        </div>
      )}
      <div className="px-5 pb-5">{children}</div>
    </div>
  );
}
