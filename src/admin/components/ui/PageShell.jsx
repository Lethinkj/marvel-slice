export default function PageShell({ title, subtitle, actions, children, maxWidth = 'max-w-[1600px]', className = '' }) {
  return (
    <div className={`min-h-[calc(100vh-4rem)] bg-white p-6 lg:p-8 space-y-6 mx-auto ${maxWidth} ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-admin-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-admin-900">{title}</h1>
          {subtitle && <p className="text-sm text-admin-500 mt-1">{subtitle}</p>}
        </div>
        {actions && (
          <div className="flex items-center gap-3 self-start sm:self-auto">
            {actions}
          </div>
        )}
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}
