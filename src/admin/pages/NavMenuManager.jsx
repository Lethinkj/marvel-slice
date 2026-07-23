import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from "../../lib/supabaseClient";
import AdminButton from "../components/AdminButton";
import {
  FiPlus,
  FiFileText,
  FiCheck,
  FiX,
  FiFolder,
  FiFile,
  FiBookOpen,
  FiList,
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
  const queryClient = useQueryClient();

  const [dbItems, setDbItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ label: "", path: "", is_active: true, parent_id: null });
  const [activeSection, setActiveSection] = useState(null);
  const [parentOpen, setParentOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [allCourses, setAllCourses] = useState([]);
  const [courseDropdown, setCourseDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const pathAuto = useRef(true);

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

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCourseDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (currentUser?.role !== "admin" && currentUser?.role !== "manager" && currentUser?.role !== "master_admin") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">
            Access Denied
          </h1>
          <p className="text-neutral-500">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

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

  function getSectionItems(label) {
    return dbItems.filter((item) => item.parent_label === label);
  }

  function getChildItems(pid) {
    return dbItems.filter(
      (item) => String(item.parent_id) === String(pid) && !item.parent_label,
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

  function linkedCourses(item) {
    return allCourses.filter((c) => c.nav_item_id === item.id);
  }

  async function toggleCourseLink(courseId, itemId) {
    const course = allCourses.find(c => c.id === courseId);
    const newNavItemId = course.nav_item_id === itemId ? null : itemId;
    await supabase.from("courses").update({ nav_item_id: newNavItemId }).eq("id", courseId);
    setAllCourses(prev => prev.map(c => c.id === courseId ? { ...c, nav_item_id: newNavItemId } : c));
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
    queryClient.invalidateQueries({ queryKey: ['topNavItems'] });
    setEditing(null);
    setForm({ label: "", path: "", is_active: true, parent_id: null });
    fetchItems();
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete "${item.label}"?`)) return;
    await supabase.from("nav_items").delete().eq("id", item.id);
    queryClient.invalidateQueries({ queryKey: ['topNavItems'] });
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
        <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Navigation Menu</h1>
        <p className="text-sm text-neutral-500 mt-1">
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
              className="rounded-lg border border-neutral-200 bg-white overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100 bg-neutral-50">
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${isContainer ? "bg-accent-50" : "bg-neutral-100"}`}
                >
                  {isContainer ? (
                    <FiFolder className="w-4 h-4 text-accent-500" />
                  ) : (
                    <FiFile className="w-4 h-4 text-neutral-400" />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 truncate">
                    {section.label}
                  </p>
                  {section.path && (
                    <p className="text-xs text-neutral-400 truncate">
                      /{section.label.toLowerCase().replace(/\s+/g, "-")}
                    </p>
                  )}
                </div>
                {isContainer ? (
                  <button
                    onClick={() => openAdd(section.label)}
                    className="p-1.5 text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
                    title={`Add item under ${section.label}`}
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                ) : (
                  <Link
                    to={`/admin/pages/${section.label.toLowerCase().replace(/\s+/g, "-")}`}
                    className="p-1.5 text-neutral-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
                    title="Edit Page"
                  >
                    <FiFileText className="w-4 h-4" />
                  </Link>
                )}
              </div>

              <div className="divide-y divide-neutral-50">
                {items.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    {isContainer ? (
                      <button
                        onClick={() => openAdd(section.label)}
                        className="text-sm text-accent-600 hover:text-accent-700 font-medium flex items-center justify-center gap-1.5 mx-auto transition-colors"
                      >
                        <FiPlus className="w-4 h-4" /> Add item
                      </button>
                    ) : (
                      <Link
                        to={`/admin/pages/${section.label.toLowerCase().replace(/\s+/g, "-")}`}
                        className="text-sm text-accent-600 hover:text-accent-700 font-medium inline-flex items-center gap-1.5 transition-colors"
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
                        className="px-4 py-2.5 hover:bg-neutral-50 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          {subItems.length > 0 && (
                            <FiFolder className="w-3.5 h-3.5 text-accent-500 shrink-0" />
                          )}
                          <span className="text-sm text-neutral-900 flex-1 truncate">
                            {item.label}
                          </span>
                          {item.path && (
                            <span className="text-[11px] text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded-full truncate max-w-[120px]">
                              {item.path}
                            </span>
                          )}
                          <span
                            className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                              item.is_active !== false
                                ? "bg-success-50 text-success-700"
                                : "bg-destructive-50 text-destructive-700"
                            }`}
                          >
                            {item.is_active !== false ? "On" : "Off"}
                          </span>
                          <div className="flex items-center gap-1 shrink-0 opacity-100">
                            <button
                              onClick={() => openEdit(item)}
                              className="px-2 py-0.5 text-[11px] font-medium text-accent-600 bg-accent-50 hover:bg-accent-100 rounded transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="px-2 py-0.5 text-[11px] font-medium text-destructive-600 bg-destructive-50 hover:bg-destructive-100 rounded transition-colors"
                            >
                              Delete
                            </button>
                            <Link
                              to={`/admin/nav-pages/${item.id}`}
                              className="px-2 py-0.5 text-[11px] font-medium text-neutral-500 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
                            >
                              Page
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
                className="rounded-lg border border-neutral-200 bg-white p-5"
              >
                <p className="text-sm font-semibold text-neutral-900 mb-3">
                  {editing
                    ? `Edit: ${editing.label}`
                    : form.parent_id
                      ? `Add sub-item under ${dbItems.find(i => i.id === form.parent_id)?.label || '...'}`
                      : `Add item under ${activeSection || selectedSection}`}
                </p>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[180px]">
                    <label className="block text-xs font-semibold text-neutral-700 mb-1 uppercase tracking-wider">
                      Label
                    </label>
                    <input
                      value={form.label}
                      onChange={(e) => handleLabelChange(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                      placeholder="e.g. Angular Course"
                    />
                  </div>
                  <div className="flex-1 min-w-[180px] relative">
                    <label className="block text-xs font-semibold text-neutral-700 mb-1 uppercase tracking-wider">
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
                            className="w-full flex items-center justify-between px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white cursor-pointer hover:border-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500"
                          >
                            <span className={form.parent_id ? 'text-neutral-900' : 'text-neutral-400'}>
                              {parentItem
                                ? parentItem.label
                                : `— Top level in ${activeSection || selectedSection} —`}
                            </span>
                            <svg className={`w-4 h-4 text-neutral-400 transition-transform ${parentOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {parentOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 max-h-[240px] overflow-y-auto">
                              <button
                                type="button"
                                onClick={() => { handleParentChange(null); setParentOpen(false); }}
                                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                                  !form.parent_id
                                    ? 'bg-accent-50 text-accent-700 font-medium'
                                    : 'text-neutral-500 hover:bg-neutral-50'
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
                                      ? 'bg-accent-50 text-accent-700 font-medium'
                                      : 'text-neutral-700 hover:bg-neutral-50'
                                  }`}
                                  style={{ paddingLeft: `${12 + p._depth * 20}px` }}
                                >
                                  {p._depth > 0 && <span className="text-neutral-400 mr-1">&#8627;</span>}
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
                    <label className="block text-xs font-semibold text-neutral-700 mb-1 uppercase tracking-wider">
                      Path (optional)
                    </label>
                    <input
                      value={form.path}
                      onChange={(e) => handlePathChange(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors font-mono text-xs"
                      placeholder="/auto-generated-from-label"
                    />
                  </div>
                  {allCourses.length > 0 && (
                    <div className="flex-1 min-w-[180px]">
                      <label className="block text-xs font-semibold text-neutral-700 mb-1 uppercase tracking-wider">
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
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors bg-white appearance-none cursor-pointer"
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
                  <label className="flex items-center gap-2.5 p-3 bg-neutral-50 rounded-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors">
                    <div
                      className={`relative w-10 h-6 rounded-full transition-colors ${form.is_active ? "bg-accent-500" : "bg-neutral-300"}`}
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
                    <span className="text-sm font-medium text-neutral-900">Active</span>
                  </label>
                  <div className="flex gap-2">
                    <AdminButton type="submit" variant="primary" size="md">
                      <FiCheck className="w-4 h-4" /> {editing ? "Update" : "Add"}
                    </AdminButton>
                    <AdminButton type="button" onClick={cancel} variant="ghost" size="md">
                      <FiX className="w-4 h-4" /> Cancel
                    </AdminButton>
                  </div>
                </div>
              </form>

              <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
                <div className="px-5 py-3 border-b border-neutral-100 bg-neutral-50">
                  <p className="text-sm font-semibold text-neutral-900">Items in {activeSection || selectedSection}</p>
                </div>
                <div className="divide-y divide-neutral-50">
                  {getSectionItems(activeSection || selectedSection).length === 0 ? (
                    <p className="px-5 py-6 text-sm text-neutral-400 text-center">No items yet.</p>
                  ) : (
                    (function renderItems(parentItems, depth = 0) {
                      return parentItems.map((item) => {
                        const subItems = getChildItems(item.id);
                        return (
                          <div key={item.id}>
                            <div
                              className={`flex items-center gap-3 px-5 py-2.5 hover:bg-neutral-50 transition-colors group ${depth > 0 ? 'border-l-2 border-accent-200 ml-3' : ''}`}
                              style={{ paddingLeft: `${20 + depth * 24}px` }}
                            >
                              {subItems.length > 0 ? (
                                <FiFolder className="w-4 h-4 text-accent-500 shrink-0" />
                              ) : (
                                <FiFile className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
                              )}
                              <span className="text-sm text-neutral-900 font-medium flex-1 truncate">
                                {item.label}
                              </span>
                              {(() => {
                                const linked = linkedCourses(item);
                                return linked.length > 0 ? (
                                  <div className="flex gap-1">
                                    {linked.slice(0, 2).map(c => (
                                      <Link key={c.id} to={`/admin/courses/${c.id}`}
                                        className="text-[11px] text-accent-700 bg-accent-50 px-2 py-0.5 rounded-full truncate max-w-[100px] hover:bg-accent-100 transition-colors flex items-center gap-1">
                                        <FiBookOpen className="w-3 h-3" /> {c.title}
                                      </Link>
                                    ))}
                                    {linked.length > 2 && (
                                      <span className="text-[11px] text-neutral-400">+{linked.length - 2}</span>
                                    )}
                                  </div>
                                ) : null;
                              })()}
                              {item.path && (
                                <span className="text-[11px] text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded-full truncate max-w-[100px] hidden sm:inline">
                                  {item.path}
                                </span>
                              )}
                              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                                item.is_active !== false
                                  ? "bg-success-50 text-success-700"
                                  : "bg-destructive-50 text-destructive-700"
                              }`}>
                                {item.is_active !== false ? "On" : "Off"}
                              </span>
                              <div className="flex items-center gap-1 shrink-0 transition-opacity">
                                <Link to={`/admin/nav-menu/children/${item.id}`}
                                  className="p-1 text-neutral-400 hover:text-accent-600 hover:bg-accent-50 rounded transition-colors"
                                  title="Manage sub-items">
                                  <FiList className="w-3.5 h-3.5" />
                                </Link>
                                <button onClick={() => { setActiveSection(activeSection || selectedSection); setForm({ label: "", path: "", is_active: true, parent_id: item.id }); setEditing(null); }}
                                  className="p-1 text-neutral-400 hover:text-accent-600 hover:bg-accent-50 rounded transition-colors"
                                  title="Add sub-item">
                                  <FiPlus className="w-3.5 h-3.5" />
                                </button>
                                <div className="relative" ref={courseDropdown === item.id ? dropdownRef : null}>
                                  <button onClick={() => setCourseDropdown(courseDropdown === item.id ? null : item.id)}
                                    className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${courseDropdown === item.id ? 'bg-accent-100 text-accent-700' : 'bg-accent-50 text-accent-600 hover:bg-accent-100'}`}>
                                    Linked Courses
                                  </button>
                                  {courseDropdown === item.id && (
                                    <div className="absolute top-full right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 min-w-[200px] max-h-[260px] flex flex-col">
                                      <div className="overflow-y-auto">
                                        {allCourses.length === 0 ? (
                                          <p className="px-3 py-3 text-xs text-neutral-400 text-center">No courses.</p>
                                        ) : (
                                          allCourses.map(c => {
                                            const checked = linkedCourses(item).some(lc => lc.id === c.id);
                                            return (
                                              <label key={c.id}
                                                className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 cursor-pointer text-xs border-b border-neutral-50 last:border-b-0">
                                                <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-colors ${checked ? 'bg-accent-600 border-accent-600' : 'border-neutral-300'}`}>
                                                  {checked && <FiCheck className="w-2.5 h-2.5 text-white" />}
                                                </div>
                                                <input type="checkbox" checked={checked} onChange={() => toggleCourseLink(c.id, item.id)} className="sr-only" />
                                                <span className="truncate text-neutral-700">{c.title}</span>
                                              </label>
                                            );
                                          })
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <button onClick={() => openEdit(item)}
                                  className="px-2 py-0.5 text-[11px] font-medium text-accent-600 bg-accent-50 hover:bg-accent-100 rounded transition-colors">
                                  Edit
                                </button>
                                <button onClick={() => handleDelete(item)}
                                  className="px-2 py-0.5 text-[11px] font-medium text-destructive-600 bg-destructive-50 hover:bg-destructive-100 rounded transition-colors">
                                  Delete
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
            <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
              <p className="text-neutral-400">Select a section to add or edit items.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
