import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import Button from "../../components/ui/Button";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiLink,
  FiFileText,
  FiCheck,
  FiX,
  FiFolder,
  FiFile,
  FiExternalLink,
  FiBookOpen,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const sections = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Software Learning", path: null },
  { label: "Competitive Exam", path: null },
  { label: "Services", path: null },
  { label: "Training", path: null },
  { label: "Career", path: "/career" },
  { label: "Blog", path: "/blog" },
  { label: "Contact", path: "/contact" },
];

export default function NavMenuManager() {
  const { user: currentUser } = useAuth();

  // Redirect or show error if user is not a manager or admin
  if (currentUser?.role !== "admin" && currentUser?.role !== "manager") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <h1 className="text-2xl font-bold text-dark-navy mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  const [dbItems, setDbItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ label: "", path: "", is_active: true });
  const [activeSection, setActiveSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allCourses, setAllCourses] = useState([]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("nav_items")
      .select("*")
      .order("sort_order");
    if (data) setDbItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    supabase
      .from("courses")
      .select("id, title, slug")
      .eq("is_published", true)
      .order("title")
      .then(({ data }) => {
        if (data) setAllCourses(data);
      });
  }, []);

  function getSectionItems(label) {
    return dbItems.filter((item) => item.parent_label === label);
  }

  function getChildItems(pid) {
    return dbItems.filter(
      (item) => item.parent_id === pid && !item.parent_label,
    );
  }

  function openAdd(sectionLabel) {
    setActiveSection(sectionLabel);
    setEditing(null);
    setForm({ label: "", path: "", is_active: true });
  }

  function openEdit(item) {
    setActiveSection(null);
    setEditing(item);
    setForm({
      label: item.label,
      path: item.path || "",
      is_active: item.is_active !== false,
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.label.trim()) return;
    const payload = {
      label: form.label,
      path: form.path || null,
      parent_label: activeSection,
      parent_id: null,
      is_active: form.is_active,
      sort_order: 0,
    };
    if (editing) {
      await supabase.from("nav_items").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("nav_items").insert(payload);
    }
    setEditing(null);
    setActiveSection(null);
    setForm({ label: "", path: "", is_active: true });
    fetchItems();
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete "${item.label}"?`)) return;
    await supabase.from("nav_items").delete().eq("id", item.id);
    fetchItems();
  }

  function cancel() {
    setEditing(null);
    setActiveSection(null);
    setForm({ label: "", path: "", is_active: true });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-navy">Navigation Menu</h1>
        <p className="text-sm text-gray-500 mt-1">
          Add or edit items under each section.
        </p>
      </div>

      {(editing || activeSection) && (
        <form
          onSubmit={handleSave}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6"
        >
          <p className="text-sm font-semibold text-dark-navy mb-3">
            {editing
              ? `Edit: ${editing.label}`
              : `Add item under ${activeSection}`}
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                Label
              </label>
              <input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                placeholder="e.g. Angular Course"
              />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                Path (optional)
              </label>
              <input
                value={form.path}
                onChange={(e) => setForm({ ...form, path: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                placeholder="/some-path"
              />
            </div>
            {allCourses.length > 0 && (
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                  Link to Course
                </label>
                <select
                  value={
                    allCourses.find((c) => form.path === `/courses/${c.slug}`)
                      ?.id || ""
                  }
                  onChange={(e) => {
                    const course = allCourses.find(
                      (c) => c.id === e.target.value,
                    );
                    setForm({
                      ...form,
                      path: course ? `/courses/${course.slug}` : "",
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent bg-white appearance-none cursor-pointer"
                >
                  <option value="">— None —</option>
                  {allCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <label className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100/50 transition-colors">
              <div
                className={`relative w-10 h-6 rounded-full transition-colors ${form.is_active ? "bg-brand-accent" : "bg-gray-300"}`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.is_active ? "translate-x-4" : ""}`}
                />
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm({ ...form, is_active: e.target.checked })
                  }
                  className="sr-only"
                />
              </div>
              <span className="text-sm font-medium text-dark-navy">Active</span>
            </label>
            <div className="flex gap-2">
              <Button type="submit" variant="accent" size="md">
                <FiCheck className="w-4 h-4" /> {editing ? "Update" : "Add"}
              </Button>
              <Button type="button" onClick={cancel} variant="ghost" size="md">
                <FiX className="w-4 h-4" /> Cancel
              </Button>
            </div>
          </div>
        </form>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => {
          const items = getSectionItems(section.label);
          const isContainer = !section.path;

          return (
            <div
              key={section.label}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${isContainer ? "bg-brand-orange/10" : "bg-gray-100"}`}
                >
                  {isContainer ? (
                    <FiFolder className="w-4 h-4 text-brand-orange" />
                  ) : (
                    <FiFile className="w-4 h-4 text-gray-400" />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-dark-navy truncate">
                    {section.label}
                  </p>
                  {section.path && (
                    <p className="text-xs text-gray-400 truncate">
                      /{section.label.toLowerCase().replace(/\s+/g, "-")}
                    </p>
                  )}
                </div>
                {isContainer ? (
                  <button
                    onClick={() => openAdd(section.label)}
                    className="p-1.5 text-brand-accent hover:bg-brand-accent/5 rounded-lg transition-colors"
                    title={`Add item under ${section.label}`}
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                ) : (
                  <Link
                    to={`/admin/pages/${section.label.toLowerCase().replace(/\s+/g, "-")}`}
                    className="p-1.5 text-gray-400 hover:text-brand-accent hover:bg-brand-accent/5 rounded-lg transition-colors"
                    title="Edit Page"
                  >
                    <FiFileText className="w-4 h-4" />
                  </Link>
                )}
              </div>

              <div className="divide-y divide-gray-50">
                {items.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    {isContainer ? (
                      <button
                        onClick={() => openAdd(section.label)}
                        className="text-sm text-brand-accent hover:text-brand-blue font-medium flex items-center justify-center gap-1.5 mx-auto transition-colors"
                      >
                        <FiPlus className="w-4 h-4" /> Add item
                      </button>
                    ) : (
                      <Link
                        to={`/admin/pages/${section.label.toLowerCase().replace(/\s+/g, "-")}`}
                        className="text-sm text-brand-accent hover:text-brand-blue font-medium inline-flex items-center gap-1.5 transition-colors"
                      >
                        <FiFileText className="w-4 h-4" /> Edit Page
                      </Link>
                    )}
                  </div>
                ) : (
                  items.map((item) => {
                    const subItems = getChildItems(item.id);
                    return (
                      <div
                        key={item.id}
                        className="px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {subItems.length > 0 && (
                            <FiFolder className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                          )}
                          <span className="text-sm text-dark-navy flex-1 truncate">
                            {item.label}
                          </span>
                          {item.path && (
                            <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full truncate max-w-[120px]">
                              {item.path}
                            </span>
                          )}
                          <span
                            className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                              item.is_active !== false
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {item.is_active !== false ? "On" : "Off"}
                          </span>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              onClick={() => openEdit(item)}
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <FiEdit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                            <Link
                              to={`/admin/nav-pages/${item.id}`}
                              className="p-1 text-gray-400 hover:text-brand-accent hover:bg-brand-accent/5 rounded transition-colors"
                            >
                              <FiFileText className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
