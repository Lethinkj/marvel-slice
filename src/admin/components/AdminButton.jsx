import { Link } from "react-router-dom";

const sizes = {
  xs: "px-2 py-1 text-xs rounded-lg",
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-5 py-2.5 text-base rounded-lg",
};

const variants = {
  primary: "text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-sm transition-all duration-150",
  secondary: "text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] shadow-sm transition-all duration-150",
  ghost: "text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-all duration-150",
  destructive: "text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] shadow-sm transition-all duration-150",
};

export default function AdminButton({ variant = "primary", size = "md", to, href, className = "", children, ...props }) {
  const base = "inline-flex items-center justify-center gap-2 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`;

  if (to) return <Link to={to} className={cls} {...props}>{children}</Link>;
  if (href) return <a href={href} className={cls} {...props}>{children}</a>;
  return <button className={cls} {...props}>{children}</button>;
}
