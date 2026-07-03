export default function Card({
  children,
  accent = false,
  className = '',
  ...props
}) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 ${accent ? 'border-l-4 border-brand-accent' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
