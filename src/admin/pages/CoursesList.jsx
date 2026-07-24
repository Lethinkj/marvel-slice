import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import AdminButton from "../components/AdminButton";
import Badge from "../components/Badge";
import EmptyState from "../components/EmptyState";
import DataTable from "../components/ui/DataTable";
import { FiPlus, FiBookOpen, FiSearch } from "react-icons/fi";

export default function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [navItems, setNavItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    const [coursesRes, navRes] = await Promise.all([
      supabase.from("courses").select("*").order("created_at", { ascending: false }),
      supabase.from("nav_items").select("id, parent_id, parent_label, label"),
    ]);
    if (!coursesRes.error) setCourses(coursesRes.data || []);
    if (!navRes.error) setNavItems(navRes.data || []);
    setLoading(false);
  }

  function getRootSection(navItemId) {
    if (!navItemId || navItems.length === 0) return "Uncategorized";
    let current = navItems.find((n) => n.id === navItemId);
    if (!current) return "Uncategorized";
    while (current.parent_id) {
      const parent = navItems.find((n) => n.id === current.parent_id);
      if (!parent) break;
      current = parent;
    }
    return current.parent_label || "Uncategorized";
  }

  async function togglePublish(id, current) {
    await supabase.from("courses").update({ is_published: !current }).eq("id", id);
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_published: !current } : c))
    );
  }

  async function handleDelete(id, title) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await supabase.from("courses").delete().eq("id", id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }

  const filtered = courses.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (c.title || "").toLowerCase().includes(q) ||
      (c.slug || "").toLowerCase().includes(q)
    );
  });

  const grouped = filtered.reduce((acc, course) => {
    const cat = getRootSection(course.nav_item_id);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(course);
    return acc;
  }, {});

  const categoryOrder = ["Software Learning", "Competitive Exam"];
  const sortedCategories = Object.keys(grouped).sort(
    (a, b) => {
      const ai = categoryOrder.indexOf(a);
      const bi = categoryOrder.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    }
  );

  const columns = [
    {
      header: 'ID',
      className: 'w-20',
      cell: (row) => <span className="text-sm text-neutral-400 font-mono">{row.id.slice(0, 8)}...</span>,
    },
    {
      header: 'Title',
      cell: (row) => (
        <Link to={`/admin/courses/${row.id}`} className="text-sm font-medium text-neutral-900 hover:text-accent-600 transition-colors">
          {row.title || 'Untitled'}
        </Link>
      ),
    },
    {
      header: 'Slug',
      className: 'hidden sm:table-cell',
      cell: (row) => <span className="text-sm text-neutral-400">/{row.slug}</span>,
    },
    {
      header: 'Status',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={row.is_published} onChange={() => togglePublish(row.id, row.is_published)} className="sr-only peer" />
            <div className="w-9 h-5 bg-neutral-200 rounded-full peer peer-checked:bg-success-500 peer-focus-visible:ring-2 peer-focus-visible:ring-accent-500 peer-focus-visible:ring-offset-2 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
          </label>
          <Badge variant={row.is_published ? 'published' : 'draft'}>{row.is_published ? 'Published' : 'Draft'}</Badge>
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'w-24 text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Link to={`/admin/courses/${row.id}`} className="px-3 py-1.5 text-xs font-medium text-accent-600 bg-accent-50 hover:bg-accent-100 rounded-md transition-colors">Edit</Link>
          <button onClick={() => handleDelete(row.id, row.title)} className="px-3 py-1.5 text-xs font-medium text-destructive-600 bg-destructive-50 hover:bg-destructive-100 rounded-md transition-colors">Delete</button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">All Courses</h1>
          <p className="text-sm text-neutral-500">
            {courses.length} course{courses.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <AdminButton to="/admin/courses/wizard" variant="primary" size="sm">
          <FiPlus className="w-4 h-4" />
          Add Course
        </AdminButton>
      </div>

      {courses.length > 0 && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 h-9 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 bg-white"
            />
          </div>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="border border-neutral-200 rounded-lg">
          <EmptyState
            icon={FiBookOpen}
            title="No courses yet"
            description="Get started by creating your first course."
            action={{ to: "/admin/courses/wizard", icon: <FiPlus className="w-4 h-4" />, label: "Create your first course" }}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-neutral-200 rounded-lg">
          <EmptyState
            icon={FiSearch}
            title={`No courses match "${search}"`}
            description="Try a different search term."
          />
        </div>
      ) : (
        <div className="space-y-8">
          {sortedCategories.map((cat) => (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  {cat}
                </h2>
                <span className="text-xs text-neutral-400">
                  ({grouped[cat].length})
                </span>
              </div>
                <DataTable columns={columns} data={grouped[cat]} searchable={false} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
