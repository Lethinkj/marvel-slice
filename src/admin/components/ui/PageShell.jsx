export default function PageShell({ title, breadcrumbs, actions, children }) {
  return (
    <div className="animate-fade-in-up">
      {breadcrumbs && (
        <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2">
          {breadcrumbs.map((cr, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-neutral-300">/</span>}
              {cr.href ? (
                <a href={cr.href} className="hover:text-accent-600 transition-colors">{cr.label}</a>
              ) : (
                <span className="text-neutral-500">{cr.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-neutral-900">{title}</h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
