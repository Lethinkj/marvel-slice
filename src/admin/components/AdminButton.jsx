import { Link } from "react-router-dom";

const sizes = {
  xs: "px-2 py-1 text-xs rounded-lg",
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-5 py-2.5 text-base rounded-lg",
};

const variants = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm hover:shadow active:scale-[0.98] transition-all",
  secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 active:bg-slate-100 transition-all",
  ghost: "text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-all",
  destructive: "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm hover:shadow active:scale-[0.98] transition-all",
};

export default function AdminButton({ variant = "primary", size = "md", to, href, className = "", children, ...props }) {
  const base = "inline-flex items-center justify-center gap-1.5 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`;

  if (to) return <Link to={to} className={cls} {...props}>{children}</Link>;
  if (href) return <a href={href} className={cls} {...props}>{children}</a>;
  return <button className={cls} {...props}>{children}</button>;
}
