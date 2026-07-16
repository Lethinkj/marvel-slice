import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useParams } from "react-router-dom";
import { FiBookOpen, FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";
import { supabase } from "../lib/supabaseClient";
import CourseCard from "../components/ui/CourseCard";
import Reveal, { Stagger, StaggerItem } from "../components/ui/Reveal";

const PER_PAGE = 5;

const PARENT_SLUGS = {
  'Software Learning': 'software-learning',
  'Competitive Exam': 'competitive-exam',
};

function Pagination({ page, total, onPage }) {
  const last = Math.ceil(total / PER_PAGE);
  if (last <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-brand-accent hover:border-brand-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <FiChevronLeft className="w-4 h-4" />
      </button>
      {Array.from({ length: last }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
            p === page
              ? "bg-brand-accent text-white shadow-sm"
              : "border border-gray-200 text-gray-600 hover:border-brand-accent hover:text-brand-accent"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= last}
        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-brand-accent hover:border-brand-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <FiChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categorySlug } = useParams();
  const [search, setSearch] = useState("");
  const parentParam = searchParams.get("parent") || null;
  const activeCategory = searchParams.get("category") || categorySlug || null;
  const showAll = !activeCategory && !parentParam;
  const page = parseInt(searchParams.get("page") || "1", 10);

  function setPage(p) {
    const next = new URLSearchParams(searchParams);
    if (p <= 1) next.delete("page"); else next.set("page", String(p));
    setSearchParams(next);
  }

  const { data: courses, isLoading } = useQuery({
    queryKey: ["allCourses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*, nav_item_id")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
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

  const categories = useMemo(() => {
    if (!navItems || !courses) return [];
    const map = {};
    const courseIds = new Set(
      courses.map((c) => c.nav_item_id).filter(Boolean),
    );
    navItems.forEach((ni) => {
      if (
        courseIds.has(ni.id) ||
        courses.some((c) => c.nav_item_id === ni.id)
      ) {
        let slug = ni.label.toLowerCase().replace(/\s+/g, "-");
        if (ni.path) {
          const m = ni.path.match(/\/courses\/category\/(.+)/) || ni.path.match(/\/(.+)/);
          if (m) slug = m[1];
        }
        if (!map[ni.id]) {
          map[ni.id] = { id: ni.id, label: ni.label, slug, courses: [] };
        }
      }
    });
    courses.forEach((course) => {
      const cat = course.nav_item_id ? map[course.nav_item_id] : null;
      if (cat) {
        cat.courses.push(course);
      }
    });
    return Object.values(map).filter((c) => c.courses.length > 0);
  }, [navItems, courses]);

  const isParentSlug = activeCategory && Object.values(PARENT_SLUGS).includes(activeCategory);
  const parentPageSlug = (isParentSlug ? activeCategory : null) || parentParam || null;

  const childIdsForParent = useMemo(() => {
    if (!navItems || !parentPageSlug) return null;
    const parentLabel = Object.keys(PARENT_SLUGS).find((k) => PARENT_SLUGS[k] === parentPageSlug);
    if (!parentLabel) return null;
    const byId = {};
    navItems.forEach((ni) => { byId[ni.id] = ni; });
    function belongsToParent(ni) {
      if (ni.parent_label === parentLabel) return true;
      let current = ni;
      let visited = new Set();
      while (current.parent_id) {
        if (visited.has(current.id)) break;
        visited.add(current.id);
        current = byId[current.parent_id];
        if (!current) break;
        if (current.parent_label === parentLabel) return true;
        if (current.label === parentLabel) return true;
      }
      if (current && current.label === parentLabel) return true;
      return false;
    }
    const ids = new Set();
    navItems.forEach((ni) => {
      if (belongsToParent(ni)) ids.add(ni.id);
    });
    return ids;
  }, [navItems, parentPageSlug]);

  const visibleCategories = useMemo(() => {
    if (!parentPageSlug || !childIdsForParent) return categories;
    return categories.filter((cat) => childIdsForParent.has(cat.id));
  }, [categories, parentPageSlug, childIdsForParent]);

  const filteredCourses = useMemo(() => {
    if (!activeCategory || !courses) return courses || [];

    const cat = categories.find((c) => c.slug === activeCategory);
    if (cat) return cat.courses;

    if (parentPageSlug) {
      const parentLabel = Object.keys(PARENT_SLUGS).find((k) => PARENT_SLUGS[k] === parentPageSlug);
      if (parentLabel && navItems) {
        const byId = {};
        navItems.forEach((ni) => { byId[ni.id] = ni; });
        function belongsToParent(ni) {
          if (ni.parent_label === parentLabel) return true;
          let current = ni;
          let visited = new Set();
          while (current.parent_id) {
            if (visited.has(current.id)) break;
            visited.add(current.id);
            current = byId[current.parent_id];
            if (!current) break;
            if (current.parent_label === parentLabel) return true;
            if (current.label === parentLabel) return true;
          }
          if (current && current.label === parentLabel) return true;
          return false;
        }
        const childIds = new Set();
        navItems.forEach((ni) => {
          if (belongsToParent(ni)) childIds.add(ni.id);
        });
        return courses.filter((c) => c.nav_item_id && childIds.has(c.nav_item_id));
      }
    }

    return [];
  }, [courses, categories, activeCategory, navItems, parentPageSlug]);

  const searchedCourses = useMemo(() => {
    let source;
    if (activeCategory) {
      source = filteredCourses;
    } else if (parentParam && childIdsForParent) {
      source = (courses || []).filter((c) => c.nav_item_id && childIdsForParent.has(c.nav_item_id));
    } else {
      source = courses || [];
    }
    if (!search) return source;
    const q = search.toLowerCase();
    return source.filter(
      (c) =>
        (c.title || "").toLowerCase().includes(q) ||
        (c.slug || "").toLowerCase().includes(q),
    );
  }, [filteredCourses, courses, activeCategory, parentParam, childIdsForParent, search]);

  const paginatedCourses = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return searchedCourses.slice(start, start + PER_PAGE);
  }, [searchedCourses, page]);

  const totalItems = searchedCourses.length;

  const foundCategory = activeCategory ? categories.find((c) => c.slug === activeCategory) : null;
  const slugIsValid = !activeCategory || foundCategory || Object.values(PARENT_SLUGS).includes(activeCategory);
  const effectiveCategory = slugIsValid ? activeCategory : null;
  const parentLabel = parentParam ? Object.keys(PARENT_SLUGS).find((k) => PARENT_SLUGS[k] === parentParam) || null : null;
  const activeLabel = effectiveCategory
    ? foundCategory?.label || parentLabel || null
    : parentLabel;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <Reveal className="text-center mb-8 sm:mb-12">
        <h1 className="text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold text-dark-navy">
          {showAll ? "Our Courses" : (activeLabel || parentLabel || "Our Courses")}
        </h1>
        <p className="text-text-gray text-base sm:text-lg mt-3 max-w-2xl mx-auto">
          {showAll
            ? "Choose a category to explore courses"
            : activeLabel
              ? `Explore all ${activeLabel} courses`
              : parentLabel
                ? `Explore all ${parentLabel} courses`
                : "Explore our courses"}
        </p>
      </Reveal>

      {parentParam && visibleCategories.length > 0 && (
        <div className="flex justify-center mb-8">
          <select
            value={effectiveCategory || ''}
            onChange={(e) => { setSearch(""); setSearchParams({ category: e.target.value || undefined, parent: parentParam }); }}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-dark-navy bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent cursor-pointer"
          >
            <option value="">All</option>
            {visibleCategories.map((cat) => (
              <option key={cat.id} value={cat.slug}>{cat.label}</option>
            ))}
          </select>
        </div>
      )}

      {!showAll && courses && courses.length > 0 && (
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-dark-navy bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all"
            />
          </div>
        </div>
      )}

      {!courses || courses.length === 0 ? (
        <div className="text-center py-16">
          <FiBookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-text-gray">No courses available yet.</p>
        </div>
      ) : showAll ? (
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <button
            onClick={() => setSearchParams({ parent: 'software-learning' })}
            className="bg-white rounded-2xl border-2 border-gray-200 p-8 text-center hover:border-brand-accent hover:shadow-md transition-all group"
          >
            <div className="w-16 h-16 rounded-full bg-brand-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-accent/20 transition-colors">
              <FiBookOpen className="w-8 h-8 text-brand-accent" />
            </div>
            <h3 className="text-xl font-bold text-dark-navy">Software Learning</h3>
            <p className="text-sm text-gray-500 mt-1">Development, data science & cloud courses</p>
          </button>
          <button
            onClick={() => setSearchParams({ parent: 'competitive-exam' })}
            className="bg-white rounded-2xl border-2 border-gray-200 p-8 text-center hover:border-brand-accent hover:shadow-md transition-all group"
          >
            <div className="w-16 h-16 rounded-full bg-brand-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-accent/20 transition-colors">
              <FiBookOpen className="w-8 h-8 text-brand-accent" />
            </div>
            <h3 className="text-xl font-bold text-dark-navy">Competitive Exam</h3>
            <p className="text-sm text-gray-500 mt-1">UPSC, SSC, banking & railway exam prep</p>
          </button>
        </div>
      ) : parentParam && !effectiveCategory && !search ? (
        <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {visibleCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSearchParams({ category: cat.slug, parent: parentParam })}
              className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:border-brand-accent hover:shadow-md transition-all group"
            >
              <h3 className="text-lg font-bold text-dark-navy group-hover:text-brand-accent transition-colors">{cat.label}</h3>
              <p className="text-sm text-gray-500 mt-1">{cat.courses.length} course{cat.courses.length !== 1 ? 's' : ''}</p>
            </button>
          ))}
        </div>
      ) : (effectiveCategory || parentParam) && searchedCourses.length === 0 ? (
        <div className="text-center py-16">
          <FiSearch className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-text-gray">
            {search ? `No courses match "${search}"` : "No courses found in this category."}
          </p>
        </div>
      ) : (
        <>
          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {paginatedCourses.map((course) => (
              <StaggerItem key={course.id} className="h-full">
                <CourseCard course={course} bannerSize="lg" showViewLink />
              </StaggerItem>
            ))}
          </Stagger>
          <Pagination page={page} total={totalItems} onPage={setPage} />
        </>
      )}
    </div>
  );
}
