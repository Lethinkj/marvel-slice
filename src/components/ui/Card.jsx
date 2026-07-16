export default function Card({
  children,
  accent = false,
  className = '',
  ...props
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 ${accent ? 'border-l-4 border-brand-accent' : ''} ${className}`}
      style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)' }}
      {...props}
    >
      {children}
    </div>
  );
}
