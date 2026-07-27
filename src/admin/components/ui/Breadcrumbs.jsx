import { Link, useLocation } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

const labels = {
  courses: "Courses",
  wizard: "Add Course",
  reports: "Reports",
  tags: "Tags",
  home: "Home",
  blog: "Blog",
  categories: "Categories",
  footer: "Footer",
  media: "Media Library",
  "nav-menu": "Navigation",
  "site-settings": "Site Settings",
  "admin-users": "Admin Users",
  "about-page": "About",
  "contact-page": "Contact",
  "career-page": "Career",
  "services-page": "Services",
  "training-page": "Training",
  "form-submissions": "Form Submissions",
  "contact-submissions": "Contact Submissions",
  "chat-submissions": "Chat Submissions",
  "career-submissions": "Career Submissions",
};

export default function Breadcrumbs({ className = "" }) {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length <= 1) return null;

  return (
    <nav className={`flex items-center gap-1.5 text-xs text-neutral-500 ${className}`}>
      <Link to="/admin" className="hover:text-neutral-700 transition-colors font-medium">Dashboard</Link>
      {parts.map((part, i) => {
        const path = "/" + parts.slice(0, i + 1).join("/");
        const label = labels[part] || part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
        const isLast = i === parts.length - 1;
        return (
          <span key={path} className="flex items-center gap-1.5">
            <FiChevronRight className="w-3 h-3 text-neutral-300" />
            {isLast ? (
              <span className="text-neutral-700 font-medium truncate max-w-[200px]">{label}</span>
            ) : (
              <Link to={path} className="hover:text-neutral-700 transition-colors truncate max-w-[150px] font-medium">{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
