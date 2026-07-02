export default function Card({
  children,
  borderAccent = true,
  className = '',
  ...props
}) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm ${borderAccent ? 'border-l-4 border-brand-accent' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
