import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  { label: "Software Learning", path: null },
  { label: "Competitive Exam", path: null },
  { label: "Services", path: null },
  { label: "Training", path: null },
];

export default function NavMenuManager() {
  const { user: currentUser } = useAuth();

  // Redirect or show error if user is not a manager or admin
  if (currentUser?.role !== "admin" && currentUser?.role !== "manager" && currentUser?.role !== "master_admin") {
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
  const [form, setForm] = useState({ label: "", path: "", is_active: true, parent_id: null });
  const [activeSection, setActiveSection] = useState(null);
  const [parentOpen, setParentOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [allCourses, setAllCourses] = useState([]);
  const pathAuto = useRef(true);
  const selectedSection = searchParams.get("section");
  const filteredSections = selectedSection
    ? sections.filter((s) => s.label === selectedSection)
    : sections;

  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function getParentPath(itemId) {
    const item = dbItems.find(i => i.id === itemId);
    if (!item) return '';
    const parentPath = item.parent_id ? getParentPath(item.parent_id) : '';
    const slug = slugify(item.label);
    return parentPath ? `${parentPath}/${slug}` : `/${slug}`;
  }

  const courseSections = ['Software Learning', 'Competitive Exam'];

  function handleLabelChange(value) {
    setForm((prev) => {
      const next = { ...prev, label: value };
      if (pathAuto.current) {
        const slug = slugify(value);
        const section = activeSection || selectedSection;
        const isCourseSection = courseSections.includes(section);
        if (isCourseSection) {
          next.path = value ? `/courses/category/${slug}` : '';
        } else if (prev.parent_id) {
          const parentPath = getParentPath(prev.parent_id);
          next.path = value ? `${parentPath}/${slug}` : '';
        } else {
          next.path = value ? `/${slug}` : '';
        }
      }
      return next;
    });
  }

  function handleParentChange(parentId) {
    setForm((prev) => {
      const next = { ...prev, parent_id: parentId };
      if (pathAuto.current && next.label) {
        const slug = slugify(next.label);
        const section = activeSection || selectedSection;
        const isCourseSection = courseSections.includes(section);
        if (isCourseSection) {
          next.path = `/courses/category/${slug}`;
        } else if (parentId) {
          const parentPath = getParentPath(parentId);
          next.path = `${parentPath}/${slug}`;
        } else {
          next.path = `/${slug}`;
        }
      }
      return next;
    });
  }

  function handlePathChange(value) {
    pathAuto.current = false;
    setForm((prev) => ({ ...prev, path: value }));
  }

  useEffect(() => {
    if (selectedSection && sections.some((s) => s.label === selectedSection)) {
      openAdd(selectedSection);
    }
  }, [searchParams]);

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
      .select("id, title, slug, nav_item_id")
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

  function getAllSectionItems(label) {
    const result = [];
    function walk(items, depth) {
      for (const item of items) {
        result.push({ ...item, _depth: depth });
        walk(getChildItems(item.id), depth + 1);
      }
    }
    walk(getSectionItems(label), 0);
    return result;
  }

  function linkedCourse(item) {
    return allCourses.find((c) => c.nav_item_id === item.id);
  }

  function openAdd(sectionLabel, parentItem = null) {
    setActiveSection(sectionLabel);
    setEditing(null);
    setParentOpen(false);
    pathAuto.current = true;
    setForm({ label: "", path: "", is_active: true, parent_id: parentItem?.id || null });
  }

  function openEdit(item) {
    setEditing(item);
    setParentOpen(false);
    pathAuto.current = false;
    setForm({
      label: item.label,
      path: item.path || "",
      is_active: item.is_active !== false,
      parent_id: item.parent_id || null,
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.label.trim()) return;
    if (editing) {
      await supabase
        .from("nav_items")
        .update({
          label: form.label,
          path: form.path || null,
          is_active: form.is_active,
        })
        .eq("id", editing.id);
    } else {
      if (!activeSection) return;
      await supabase.from("nav_items").insert({
        label: form.label,
        path: form.path || null,
        parent_label: form.parent_id ? null : activeSection,
        parent_id: form.parent_id || null,
        is_active: form.is_active,
        sort_order: 0,
      });
    }
    setEditing(null);
    setForm({ label: "", path: "", is_active: true, parent_id: null });
    fetchItems();
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete "${item.label}"?`)) return;
    await supabase.from("nav_items").delete().eq("id", item.id);
    fetchItems();
  }

  function cancel() {
    setEditing(null);
    if (!selectedSection) {
      setActiveSection(null);
    }
    setParentOpen(false);
    pathAuto.current = true;
    setForm({ label: "", path: "", is_active: true, parent_id: null });
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
          Manage dropdown items for container sections.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-80 xl:w-96 shrink-0">
          <div className="space-y-4">
        {filteredSections.map((section) => {
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

        <div className="flex-1 min-w-0 space-y-6">
          {(activeSection || selectedSection) && (
            <>
              <form
                onSubmit={handleSave}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
              >
                <p className="text-sm font-semibold text-dark-navy mb-3">
                  {editing
                    ? `Edit: ${editing.label}`
                    : form.parent_id
                      ? `Add sub-item under ${dbItems.find(i => i.id === form.parent_id)?.label || '...'}`
                      : `Add item under ${activeSection || selectedSection}`}
                </p>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[180px]">
                    <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                      Label
                    </label>
                    <input
                      value={form.label}
                      onChange={(e) => handleLabelChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                      placeholder="e.g. Angular Course"
                    />
                  </div>
                  <div className="flex-1 min-w-[180px] relative">
                    <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                      Parent (optional)
                    </label>
                    {(() => {
                      const allItems = getAllSectionItems(activeSection || selectedSection);
                      const parentItem = allItems.find(i => i.id === form.parent_id);
                      return (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setParentOpen(!parentOpen)}
                            className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer hover:border-gray-400 transition-colors"
                          >
                            <span className={form.parent_id ? 'text-dark-navy' : 'text-gray-400'}>
                              {parentItem
                                ? parentItem.label
                                : `— Top level in ${activeSection || selectedSection} —`}
                            </span>
                            <svg className={`w-4 h-4 text-gray-400 transition-transform ${parentOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {parentOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[240px] overflow-y-auto">
                              <button
                                type="button"
                                onClick={() => { handleParentChange(null); setParentOpen(false); }}
                                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                                  !form.parent_id
                                    ? 'bg-brand-orange/10 text-brand-orange font-medium'
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                — Top level in {activeSection || selectedSection} —
                              </button>
                              {allItems.map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => { handleParentChange(p.id); setParentOpen(false); }}
                                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                                    form.parent_id === p.id
                                      ? 'bg-brand-orange/10 text-brand-orange font-medium'
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                  style={{ paddingLeft: `${12 + p._depth * 20}px` }}
                                >
                                  {p._depth > 0 && <span className="text-gray-400 mr-1">&#8627;</span>}
                                  {p.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex-1 min-w-[180px]">
                    <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                      Path (optional)
                    </label>
                    <input
                      value={form.path}
                      onChange={(e) => handlePathChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent font-mono text-xs"
                      placeholder="/auto-generated-from-label"
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

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                  <p className="text-sm font-semibold text-dark-navy">Items in {activeSection || selectedSection}</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {getSectionItems(activeSection || selectedSection).length === 0 ? (
                    <p className="px-5 py-6 text-sm text-gray-400 text-center">No items yet.</p>
                  ) : (
                    (function renderItems(parentItems, depth = 0) {
                      return parentItems.map((item) => {
                        const subItems = getChildItems(item.id);
                        return (
                          <div key={item.id}>
                            <div
                              className={`flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 transition-colors ${depth > 0 ? 'border-l-2 border-brand-orange/20 ml-3' : ''}`}
                              style={{ paddingLeft: `${20 + depth * 24}px` }}
                            >
                              {subItems.length > 0 ? (
                                <FiFolder className="w-4 h-4 text-brand-orange shrink-0" />
                              ) : (
                                <FiFile className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                              )}
                              <span className="text-sm text-dark-navy font-medium flex-1 truncate">
                                {item.label}
                              </span>
                              {(() => {
                                const course = linkedCourse(item);
                                return course ? (
                                  <Link
                                    to={`/admin/courses/${course.id}`}
                                    className="text-[11px] text-brand-accent bg-brand-accent/5 px-2 py-0.5 rounded-full truncate max-w-[140px] hover:bg-brand-accent/10 transition-colors flex items-center gap-1"
                                  >
                                    <FiBookOpen className="w-3 h-3" />
                                    {course.title}
                                  </Link>
                                ) : null;
                              })()}
                              {item.path && (
                                <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full truncate max-w-[100px] hidden sm:inline">
                                  {item.path}
                                </span>
                              )}
                              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                                item.is_active !== false
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-red-50 text-red-600"
                              }`}>
                                {item.is_active !== false ? "On" : "Off"}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button onClick={() => { setActiveSection(activeSection || selectedSection); setForm({ label: "", path: "", is_active: true, parent_id: item.id }); setEditing(null); }}
                                  className="p-1 text-gray-400 hover:text-brand-accent hover:bg-brand-accent/5 rounded transition-colors"
                                  title="Add sub-item">
                                  <FiPlus className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => openEdit(item)}
                                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Edit">
                                  <FiEdit2 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleDelete(item)}
                                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete">
                                  <FiTrash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            {subItems.length > 0 && renderItems(subItems, depth + 1)}
                          </div>
                        );
                      });
                    })(getSectionItems(activeSection || selectedSection))
                  )}
                </div>
              </div>
            </>
          )}

          {!activeSection && !editing && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-400">Select a section to add or edit items.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
