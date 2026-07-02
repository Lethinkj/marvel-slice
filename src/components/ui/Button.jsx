import { Link } from 'react-router-dom';

const sizes = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
  xl: 'px-7 py-3 text-base',
};

const variants = {
  primary:
    'bg-brand-orange text-white font-semibold hover:bg-orange-600 shadow-sm transition-all',
  'primary-lg':
    'bg-brand-orange text-white font-semibold hover:bg-orange-600 shadow-lg shadow-orange-500/25 transition-all',
  secondary:
    'bg-white/10 text-white font-semibold hover:bg-white/20 border border-white/20 transition-all',
  accent:
    'bg-brand-accent text-white font-semibold hover:bg-brand-blue shadow-sm transition-all',
  outline:
    'border-2 border-brand-blue text-brand-blue font-semibold hover:bg-brand-blue hover:text-white transition-all',
  'outline-white':
    'border-2 border-white text-white font-semibold hover:bg-white hover:text-brand-blue transition-all',
  ghost:
    'text-text-gray font-medium hover:text-brand-accent hover:bg-gray-50 transition-all',
  'ghost-red':
    'text-gray-400 font-medium hover:text-red-600 hover:bg-red-50 transition-all',
  'ghost-blue':
    'text-gray-400 font-medium hover:text-blue-600 hover:bg-blue-50 transition-all',
  link: 'text-brand-accent font-medium hover:text-brand-blue transition-all',
  'link-add':
    'text-brand-accent font-medium hover:text-brand-blue inline-flex items-center gap-1.5 transition-all',
  pill: 'bg-gray-100 text-text-gray font-medium hover:bg-gray-200 transition-all',
  'pill-active':
    'bg-brand-accent text-white font-medium shadow-sm transition-all',
  'pill-orange':
    'bg-brand-orange text-white font-medium shadow-md transition-all',
};

const shapes = {
  pill: 'rounded-full',
  md: 'rounded-lg',
  sm: 'rounded-md',
  square: 'rounded-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  shape = 'md',
  to,
  href,
  className = '',
  children,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 disabled:opacity-50 disabled:cursor-not-allowed';

  const alias = { orange: 'primary', outlineWhite: 'outline-white', purple: 'accent' };
  const resolvedVariant = alias[variant] || variant;
  const classes = `${base} ${sizes[size] || sizes.md} ${variants[resolvedVariant] || variants.primary} ${shapes[shape] || shapes.md} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
