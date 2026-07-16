import { Link } from "react-router-dom";

const sizes = {
  xs: "px-2 py-1 text-xs rounded-md",
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-5 py-2.5 text-base rounded-lg",
};

const variants = {
  primary: "bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800 shadow-sm",
  secondary: "bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100",
  ghost: "text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200",
  destructive: "bg-destructive-500 text-white hover:bg-destructive-700 active:bg-destructive-800 shadow-sm",
};

export default function AdminButton({ variant = "primary", size = "md", to, href, className = "", children, ...props }) {
  const base = "inline-flex items-center justify-center gap-1.5 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`;

  if (to) return <Link to={to} className={cls} {...props}>{children}</Link>;
  if (href) return <a href={href} className={cls} {...props}>{children}</a>;
  return <button className={cls} {...props}>{children}</button>;
}
