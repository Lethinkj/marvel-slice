import { useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useParams, Link } from "react-router-dom";
import {
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiChevronDown,
  FiGrid,
  FiList,
  FiClock,
  FiMonitor,
  FiCode,
  FiCpu,
  FiBarChart2,
  FiCloud,
  FiShield,
  FiAward,
  FiUsers,
  FiZap,
  FiGlobe,
} from "react-icons/fi";
import { supabase } from "../lib/supabaseClient";
import CourseCard from "../components/ui/CourseCard";
import CourseSkeleton from "../components/ui/CourseSkeleton";
import Reveal, { Stagger, StaggerItem } from "../components/ui/Reveal";

const PER_PAGE = 6;

// Fixed top-level parents — these are the only two groups that should
// ever appear in the SL/CE segmented control and drive the sidebar tree.
// Do NOT derive this dynamically from nav_items; that caused every
// category (Web Development, UPSC, Cybersecurity, etc.) to be treated
// as a top-level parent and rendered as one long horizontal chip strip.
const PARENTS = [
  { label: "Software Learning", slug: "software-learning" },
  { label: "Competitive Exam", slug: "competitive-exam" },
];

const CATEGORY_ICONS = {
  "Web Development": FiCode,
  "AI & Machine Learning": FiCpu,
  "Data Science & Analytics": FiBarChart2,
  "Cloud Computing & DevOps": FiCloud,
  Cybersecurity: FiShield,
  UPSC: FiAward,
  SSC: FiUsers,
  Banking: FiZap,
  Railway: FiGlobe,
  Defence: FiShield,
};

const DEFAULT_ICON = FiBookOpen;

function Pagination({ page, total, onPage }) {
  const last = Math.ceil(total / PER_PAGE);
  if (last <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-brand-orange hover:border-brand-orange disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
        aria-label="Previous page"
      >
        <FiChevronLeft className="w-4 h-4" />
      </button>
      {Array.from({ length: last }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            p === page
              ? "bg-brand-orange text-white shadow-sm"
              : "border border-gray-200 text-gray-600 hover:border-brand-orange hover:text-brand-orange"
          }`}
          aria-label={`Page ${p}`}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= last}
        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-brand-orange hover:border-brand-orange disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
        aria-label="Next page"
      >
        <FiChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function CourseListItem({ course }) {
  return (
    <Link
      to={`/courses/${course.slug}`}
      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-brand-orange/20 to-brand-orange/10 flex items-center justify-center">
        {course.hero_image_url ? (
          <img
            src={course.hero_image_url}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <FiBookOpen className="w-8 h-8 text-brand-orange/40" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-dark-navy text-sm sm:text-base truncate">
          {course.title}
        </h3>
        {course.description && (
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 line-clamp-2">
            {course.description}
          </p>
        )}
        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
          {course.duration && (
            <span className="flex items-center gap-1">
              <FiClock className="w-3.5 h-3.5" />
              {course.duration}
            </span>
          )}
          {course.mode && (
            <span className="flex items-center gap-1">
              <FiMonitor className="w-3.5 h-3.5" />
              {course.mode}
            </span>
          )}
        </div>
      </div>
      <FiChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
    </Link>
  );
}

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categorySlug } = useParams();
  const [search, setSearch] = useState("");
  const [userExpanded, setUserExpanded] = useState(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const parentParam = searchParams.get("parent") || null;
  const activeCategory = searchParams.get("category") || categorySlug || null;
  const page = parseInt(searchParams.get("page") || "1", 10);

  const setPage = useCallback(
    (p) => {
      const next = new URLSearchParams(searchParams);
      if (p <= 1) next.delete("page");
      else next.set("page", String(p));
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  const selectParent = useCallback(
    (slug) => {
      setSearch("");
      setPage(1);
      setSearchParams({ parent: slug });
    },
    [setPage, setSearchParams],
  );

  const selectCategory = useCallback(
    (slug) => {
      setSearch("");
      setPage(1);
      const next = new URLSearchParams(searchParams);
      next.set("category", slug);
      setSearchParams(next);
    },
    [searchParams, setPage, setSearchParams],
  );

  const clearCategory = useCallback(() => {
    setSearch("");
    setPage(1);
    const next = new URLSearchParams(searchParams);
    next.delete("category");
    setSearchParams(next);
  }, [searchParams, setPage, setSearchParams]);

  const { data: courses, isLoading } = useQuery({
    queryKey: ["allCourses"],
    queryFn: async () => {
      const { data } = await supabase
        .from("courses")
        .select("*, nav_item_id")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: navItems } = useQuery({
    queryKey: ["courseNavCategories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("nav_items")
        .select("id, label, path, parent_label, parent_id")
        .eq("is_active", true)
        .order("sort_order");
      return data || [];
    },
  });

  const courseMap = useMemo(() => {
    if (!courses || !navItems) return {};
    const map = {};
    courses.forEach((c) => {
      if (c.nav_item_id) {
        if (!map[c.nav_item_id]) map[c.nav_item_id] = [];
        map[c.nav_item_id].push(c);
      }
    });
    const byNav = {};
    navItems.forEach((ni) => {
      byNav[ni.id] = map[ni.id] || [];
    });
    return byNav;
  }, [courses, navItems]);

  // Fixed, not derived from navItems — see PARENTS comment above.
  const parents = PARENTS;

  function countFor(id) {
    return courseMap[id]?.length || 0;
  }

  const tree = useMemo(() => {
    if (!navItems || !parents.length) return {};
    const byParent = {};
    parents.forEach((p) => {
      byParent[p.label] = [];
    });
    navItems.forEach((ni) => {
      if (ni.parent_label && byParent[ni.parent_label]) {
        byParent[ni.parent_label].push(ni);
      }
    });
    const expand = (items) =>
      items.map((p) => {
        const children = navItems.filter((c) => c.parent_id === p.id);
        const childCount = children.reduce((sum, c) => sum + countFor(c.id), 0);
        return {
          ...p,
          children,
          totalCount: countFor(p.id) + childCount,
        };
      });
    const result = {};
    parents.forEach((p) => {
      result[p.slug] = expand(byParent[p.label]);
    });
    return result;
  }, [navItems, parents, courseMap]);

  const currentTree = tree[parentParam] || [];

  const activeNavId = useMemo(() => {
    if (!activeCategory || !navItems) return null;
    const found = navItems.find((ni) => {
      const slug = ni.path
        ? ni.path.replace(/.*\//, "")
        : ni.label.toLowerCase().replace(/\s+/g, "-");
      return slug === activeCategory;
    });
    return found?.id || null;
  }, [activeCategory, navItems]);

  const isActiveOrChild = useCallback((parentNode, activeId) => {
    if (!activeId) return false;
    if (parentNode.id === activeId) return true;
    return parentNode.children?.some((c) => c.id === activeId);
  }, []);

  const shouldExpand = useCallback(
    (parentNode) => {
      if (hasUserInteracted) return userExpanded === parentNode.id;
      return isActiveOrChild(parentNode, activeNavId);
    },
    [hasUserInteracted, userExpanded, activeNavId, isActiveOrChild],
  );

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    if (activeNavId) {
      const ids = new Set();
      const collect = (items) => {
        items.forEach((item) => {
          ids.add(item.id);
          if (item.children) collect(item.children);
        });
      };
      const findNode = (items) => {
        for (const item of items) {
          if (item.id === activeNavId) return item;
          if (item.children) {
            const found = findNode(item.children);
            if (found) return found;
          }
        }
        return null;
      };
      const node = findNode(currentTree);
      if (node) {
        collect([node]);
        return courses.filter((c) => c.nav_item_id && ids.has(c.nav_item_id));
      }
      return courseMap[activeNavId] || [];
    }
    if (parentParam) {
      const ids = new Set();
      const collect = (items) => {
        items.forEach((item) => {
          ids.add(item.id);
          if (item.children) collect(item.children);
        });
      };
      collect(currentTree);
      return courses.filter((c) => c.nav_item_id && ids.has(c.nav_item_id));
    }
    return courses;
  }, [courses, courseMap, activeNavId, parentParam, currentTree]);

  const searchedCourses = useMemo(() => {
    if (!search) return filteredCourses;
    const q = search.toLowerCase();
    return filteredCourses.filter(
      (c) =>
        (c.title || "").toLowerCase().includes(q) ||
        (c.slug || "").toLowerCase().includes(q),
    );
  }, [filteredCourses, search]);

  const paginatedCourses = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return searchedCourses.slice(start, start + PER_PAGE);
  }, [searchedCourses, page]);

  const totalItems = searchedCourses.length;

  function toggleParent(id) {
    setHasUserInteracted(true);
    setUserExpanded((prev) => (prev === id ? null : id));
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="w-48 h-8 bg-gray-200 rounded mb-8 animate-pulse" />
        <CourseSkeleton count={6} />
      </div>
    );
  }

  const sidebarNode = (parentNode) => {
    const Icon = CATEGORY_ICONS[parentNode.label] || DEFAULT_ICON;
    const parentSlug = parentNode.path
      ? parentNode.path.replace(/.*\//, "")
      : parentNode.label.toLowerCase().replace(/\s+/g, "-");
    const isParentActive = activeCategory === parentSlug;
    const expanded = shouldExpand(parentNode);
    const hasChildren = parentNode.children.length > 0;

    return (
      <div key={parentNode.id}>
        <button
          onClick={() => {
            if (hasChildren) toggleParent(parentNode.id);
            selectCategory(parentSlug);
          }}
          className={`w-full text-left px-3 py-2.5 text-sm transition-all duration-150 ease-out cursor-pointer flex items-center justify-between gap-2 overflow-hidden ${
            isParentActive
              ? "text-orange-600 font-bold"
              : "text-gray-700 hover:text-orange-600 hover:font-semibold"
          }`}
          aria-expanded={hasChildren ? expanded : undefined}
          aria-label={`${parentNode.label} (${parentNode.totalCount} courses)`}
        >
          <span className="flex items-center gap-3 min-w-0 flex-1">
            <span className="w-[18px] h-[18px] flex items-center justify-center shrink-0">
              <Icon
                className={`w-[18px] h-[18px] ${isParentActive ? "text-orange-600" : "text-gray-400"}`}
              />
            </span>
            <span className="truncate min-w-0 max-w-full">
              {parentNode.label}
            </span>
          </span>
          <span className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-medium text-gray-400 tabular-nums leading-none">
              {parentNode.totalCount}
            </span>
            {hasChildren && (
              <FiChevronRight
                className={`w-3.5 h-3.5 transition-transform duration-200 ease-out ${expanded ? "rotate-90" : ""} ${
                  isParentActive ? "text-orange-600" : "text-gray-400"
                }`}
              />
            )}
          </span>
        </button>
        <div
          className={`grid transition-all duration-200 ease-out ${
            expanded
              ? "grid-rows-[1fr] opacity-100 mt-0.5"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            {hasChildren && (
              <div className="ml-[22px] border-l-2 border-gray-100 pl-4">
                {parentNode.children.map((child) => {
                  const ChildIcon = CATEGORY_ICONS[child.label] || DEFAULT_ICON;
                  const childSlug = child.path
                    ? child.path.replace(/.*\//, "")
                    : child.label.toLowerCase().replace(/\s+/g, "-");
                  const isChildActive = activeCategory === childSlug;
                  return (
                    <button
                      key={child.id}
                      onClick={() => selectCategory(childSlug)}
                      className={`w-full text-left pl-3 pr-3 py-2 text-sm transition-all duration-150 ease-out cursor-pointer flex items-center justify-between gap-2 overflow-hidden ${
                        isChildActive
                          ? "text-orange-600 font-semibold"
                          : "text-gray-700 hover:text-orange-600 hover:font-semibold"
                      }`}
                      aria-label={`${child.label} (${countFor(child.id)} courses)`}
                    >
                      <span className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="w-[14px] h-[14px] flex items-center justify-center shrink-0">
                          <ChildIcon
                            className={`w-[14px] h-[14px] ${isChildActive ? "text-orange-600" : "text-gray-400"}`}
                          />
                        </span>
                        <span className="truncate min-w-0 max-w-full">
                          {child.label}
                        </span>
                      </span>
                      <span className="text-xs font-medium text-gray-400 tabular-nums leading-none shrink-0">
                        {countFor(child.id)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {!parentParam ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <Reveal className="text-center mb-10">
            <h1 className="text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold text-dark-navy">
              Our Courses
            </h1>
            <p className="text-text-gray text-base sm:text-lg mt-3">
              Choose a category to explore courses
            </p>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {parents.map((p) => (
              <button
                key={p.slug}
                onClick={() => selectParent(p.slug)}
                className="bg-white rounded-2xl border-2 border-gray-200 p-8 text-center hover:border-brand-orange hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-orange/20 transition-colors">
                  <FiBookOpen className="w-8 h-8 text-brand-orange" />
                </div>
                <h3 className="text-xl font-bold text-dark-navy">{p.label}</h3>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex w-full">
          {/* Left Sidebar — light gray, flush top, no gap */}
          <aside
            className="w-[270px] shrink-0 hidden lg:block bg-gray-50"
            aria-label="Course categories"
          >
            <nav className="sticky top-0 pt-6 pb-4 px-4">
              {/* Segmented control for SL/CE — only 2 tabs, always */}
              <div
                className="flex p-0.5 bg-gray-100 rounded-xl mb-6"
                role="tablist"
              >
                {parents.map((p) => (
                  <button
                    key={p.slug}
                    role="tab"
                    aria-selected={parentParam === p.slug}
                    onClick={() => selectParent(p.slug)}
                    className={`flex-1 px-3 py-2 text-xs font-bold rounded-[10px] transition-all duration-150 cursor-pointer ${
                      parentParam === p.slug
                        ? "bg-white text-brand-orange"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {currentTree.map(sidebarNode)}
            </nav>
          </aside>

          {/* Right content — white bg, flush top, wraps mobile dropdown and course grid */}
          <div className="flex-1 min-w-0 max-w-[1600px] bg-white pt-6">
            {/* Mobile sidebar (dropdown) */}
            <div className="lg:hidden px-4 sm:px-6 mb-6">
              <div
                className="flex p-0.5 bg-gray-100 rounded-xl mb-4"
                role="tablist"
              >
                {parents.map((p) => (
                  <button
                    key={p.slug}
                    role="tab"
                    aria-selected={parentParam === p.slug}
                    onClick={() => selectParent(p.slug)}
                    className={`flex-1 px-3 py-2 text-xs font-bold rounded-[10px] transition-all duration-150 cursor-pointer ${
                      parentParam === p.slug
                        ? "bg-white text-brand-orange shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-dark-navy bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange cursor-pointer flex items-center justify-between gap-2"
                  aria-label="Select a course category"
                  aria-expanded={mobileOpen}
                >
                  <span className="truncate">
                    {activeNavId
                      ? navItems?.find((n) => n.id === activeNavId)?.label ||
                        "All Courses"
                      : "All Courses"}
                  </span>
                  <FiChevronDown
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${mobileOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {mobileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMobileOpen(false)}
                    />
                    <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl max-h-[60vh] overflow-y-auto">
                      <button
                        onClick={() => {
                          clearCategory();
                          setMobileOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 transition-colors cursor-pointer truncate"
                      >
                        All Courses
                      </button>
                      {currentTree.map((parent) => {
                        const parentSlug = parent.path
                          ? parent.path.replace(/.*\//, "")
                          : parent.label.toLowerCase().replace(/\s+/g, "-");
                        const isParentActive = activeCategory === parentSlug;
                        return (
                          <div key={parent.id}>
                            <button
                              onClick={() => {
                                selectCategory(parentSlug);
                                setMobileOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer flex items-center justify-between gap-2 overflow-hidden ${
                                isParentActive
                                  ? "text-orange-600 font-semibold"
                                  : "text-gray-700 hover:text-orange-600 hover:font-semibold"
                              }`}
                            >
                              <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                                {parent.label}
                              </span>
                              <span className="text-xs font-medium text-gray-400 tabular-nums shrink-0">
                                {parent.totalCount}
                              </span>
                            </button>
                            {parent.children.map((child) => {
                              const childSlug = child.path
                                ? child.path.replace(/.*\//, "")
                                : child.label
                                    .toLowerCase()
                                    .replace(/\s+/g, "-");
                              const isChildActive =
                                activeCategory === childSlug;
                              return (
                                <button
                                  key={child.id}
                                  onClick={() => {
                                    selectCategory(childSlug);
                                    setMobileOpen(false);
                                  }}
                                  className={`w-full text-left pl-8 pr-4 py-2 text-sm transition-colors cursor-pointer flex items-center justify-between gap-2 overflow-hidden ${
                                    isChildActive
                                      ? "text-orange-600 font-semibold"
                                      : "text-gray-700 hover:text-orange-600 hover:font-semibold"
                                  }`}
                                >
                                  <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                                    {child.label}
                                  </span>
                                  <span className="text-xs font-medium text-gray-400 tabular-nums shrink-0">
                                    {countFor(child.id)}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="pr-4 sm:pr-6 lg:pr-8 pl-4 sm:pl-6 lg:pl-10 pb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-dark-navy mb-1">
                Find Your Courses
              </h2>
              <div className="flex items-center justify-between mb-5 sm:mb-6 flex-wrap gap-3">
                <h1 className="text-lg sm:text-2xl font-bold text-dark-navy">
                  {activeNavId
                    ? navItems?.find((n) => n.id === activeNavId)?.label ||
                      "Courses"
                    : parents.find((p) => p.slug === parentParam)?.label ||
                      "Courses"}
                </h1>
                <div className="flex items-center gap-3">
                  <div className="relative w-full sm:w-56 lg:w-60">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Search courses..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm text-dark-navy bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all"
                      aria-label="Search courses"
                    />
                  </div>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 transition-colors ${viewMode === "grid" ? "bg-brand-orange text-white" : "bg-white text-gray-400 hover:text-dark-navy"}`}
                      aria-label="Grid view"
                    >
                      <FiGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 transition-colors ${viewMode === "list" ? "bg-brand-orange text-white" : "bg-white text-gray-400 hover:text-dark-navy"}`}
                      aria-label="List view"
                    >
                      <FiList className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {searchedCourses.length === 0 ? (
                <div className="text-center py-16">
                  <FiSearch className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-text-gray">
                    {search
                      ? `No courses match "${search}"`
                      : "No courses found in this category."}
                  </p>
                </div>
              ) : (
                <>
                  {viewMode === "grid" ? (
                    <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
                      {paginatedCourses.map((course) => (
                        <StaggerItem key={course.id} className="h-full">
                          <CourseCard
                            course={course}
                            bannerSize="lg"
                            showViewLink
                          />
                        </StaggerItem>
                      ))}
                    </Stagger>
                  ) : (
                    <div className="space-y-4">
                      {paginatedCourses.map((course) => (
                        <CourseListItem key={course.id} course={course} />
                      ))}
                    </div>
                  )}
                  <Pagination page={page} total={totalItems} onPage={setPage} />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
