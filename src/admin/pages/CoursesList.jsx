import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import Button from "../../components/ui/Button";
import { FiPlus, FiEdit2, FiTrash2, FiBookOpen, FiSearch } from "react-icons/fi";

export default function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    const { data, error } = await supabase
      .from("courses")
      .select(`*, nav_item_id, nav_items!left(parent_label)`)
      .order("created_at", { ascending: false });
    if (!error) setCourses(data || []);
    setLoading(false);
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

  function getCategory(course) {
    return course.nav_items?.parent_label || "Uncategorized";
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
    const cat = getCategory(course);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-navy">All Courses</h1>
          <p className="text-sm text-gray-500 mt-1">
            {courses.length} course{courses.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button to="/admin/courses/wizard" variant="accent" size="sm">
          <FiPlus className="w-4 h-4" />
          Add Course
        </Button>
      </div>

      {courses.length > 0 && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent bg-white"
            />
          </div>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FiBookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-sm text-gray-400 mb-4">No courses yet.</p>
          <Button to="/admin/courses/wizard" variant="accent" size="sm">
            <FiPlus className="w-4 h-4" />
            Create your first course
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FiSearch className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-sm text-gray-400">No courses match "{search}"</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedCategories.map((cat) => (
            <div key={cat}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {cat}
                <span className="ml-2 text-xs font-normal text-gray-300">
                  ({grouped[cat].length})
                </span>
              </h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3 w-20">
                        ID
                      </th>
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">
                        Title
                      </th>
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">
                        Slug
                      </th>
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3 w-28">
                        Status
                      </th>
                      <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3 w-24">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped[cat].map((course) => (
                      <tr
                        key={course.id}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-gray-400 font-mono">
                          {course.id.slice(0, 8)}...
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/admin/courses/${course.id}`}
                            className="font-medium text-dark-navy hover:text-brand-accent transition-colors"
                          >
                            {course.title || "Untitled"}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400 hidden sm:table-cell">
                          /{course.slug}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() =>
                              togglePublish(course.id, course.is_published)
                            }
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                              course.is_published
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                course.is_published
                                  ? "bg-emerald-500"
                                  : "bg-gray-400"
                              }`}
                            />
                            {course.is_published ? "Published" : "Draft"}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/admin/courses/${course.id}`}
                              className="p-1.5 text-gray-400 hover:text-brand-accent hover:bg-brand-accent/10 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() =>
                                handleDelete(course.id, course.title)
                              }
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
