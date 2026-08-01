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
  "nav-menu": "Menu",
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

const createSlugs = new Set(["new", "wizard", "add"]);

const entityMeta = {
  courses: { list: "Courses", new: "New Course", edit: "Update" },
  blog: { list: "Blog", new: "New Post", edit: "Edit Post" },
  jobs: { list: "Job Openings", new: "New Job Opening", edit: "Edit Job Opening" },
  services: { list: "Services", new: "New Service", edit: "Update" },
  training: { list: "Training Programs", new: "New Training", edit: "Update" },
  tags: { list: "Tags", new: "New Tag", edit: "Update" },
};

function capitalize(part) {
  return part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
}

function getLabel(part, prevPart, isLast, isId) {
  if (isLast) {
    if (createSlugs.has(part) && prevPart && entityMeta[prevPart]) {
      return entityMeta[prevPart].new;
    }
    if (isId && prevPart && entityMeta[prevPart]) {
      return entityMeta[prevPart].edit;
    }
  }
  if (entityMeta[part]) return entityMeta[part].list;
  return labels[part] || capitalize(part);
}

function isIdPart(part) {
  return /^[0-9a-fA-F-]+$/.test(part) && !createSlugs.has(part) && !labels[part];
}

export default function Breadcrumbs({ className = "" }) {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean).filter(p => p !== "admin");

  const crumbs = parts.map((part, i) => {
    const prevPart = parts[i - 1];
    const isLast = i === parts.length - 1;
    const id = isIdPart(part);
    return {
      part,
      path: "/admin/" + parts.slice(0, i + 1).join("/"),
      label: getLabel(part, prevPart, isLast, id),
      isLast,
    };
  });

  if (crumbs.length === 0) {
    return (
      <nav className={`flex items-center gap-1.5 text-xs text-neutral-500 ${className}`}>
        <span className="text-blue-600 font-medium">Dashboard</span>
        <FiChevronRight className="w-3 h-3 text-neutral-300" />
      </nav>
    );
  }

  return (
    <nav className={`flex items-center gap-1.5 text-xs text-neutral-500 ${className}`}>
      <Link to="/admin" className="hover:text-neutral-700 transition-colors font-medium">Dashboard</Link>
      {crumbs.map((c) => (
        <span key={c.path} className="flex items-center gap-1.5">
          <FiChevronRight className="w-3 h-3 text-neutral-300" />
          {c.isLast ? (
            <span className="text-blue-600 font-medium truncate max-w-[200px]">{c.label}</span>
          ) : (
            <Link to={c.path} className="hover:text-neutral-700 transition-colors truncate max-w-[150px] font-medium">{c.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}
