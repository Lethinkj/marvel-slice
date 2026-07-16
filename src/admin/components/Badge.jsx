const variants = {
  published: "bg-success-50 text-success-700",
  draft: "bg-warning-50 text-warning-700",
  active: "bg-success-50 text-success-700",
  inactive: "bg-neutral-100 text-neutral-600",
  featured: "bg-accent-50 text-accent-700",
  admin: "bg-info-50 text-info-700",
  editor: "bg-accent-50 text-accent-700",
  master_admin: "bg-accent-100 text-accent-800",
  coming_soon: "bg-warning-50 text-warning-700",
  on: "bg-success-50 text-success-700",
  off: "bg-neutral-100 text-neutral-500",
  default: "bg-neutral-100 text-neutral-700",
};

export default function Badge({ variant = "default", children, className = "" }) {
  const cls = variants[variant] || variants.default;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cls} ${className}`}>
      {children}
    </span>
  );
}
