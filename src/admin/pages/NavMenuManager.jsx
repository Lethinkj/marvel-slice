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
  FiMoreVertical,
  FiEdit3,
  FiTrash2,
  FiExternalLink,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import PageShell from "../components/ui/PageShell";
import useConfirm from '../hooks/useConfirm';

const sections = [
  { label: "Software Learning", path: null },
  { label: "Competitive Exam", path: null },
  { label: "Services", path: null },
  { label: "Training", path: null },
];

export default function NavMenuManager() {
  const [confirm, confirmDialog] = useConfirm();
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
  const [courseSelectOpen, setCourseSelectOpen] = useState(false);
  const dropdownRef = useRef(null);
  const courseSelectRef = useRef(null);
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
      if (courseSelectRef.current && !courseSelectRef.current.contains(e.target)) {
        setCourseSelectOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (currentUser?.role !== "admin" && currentUser?.role !== "manager" && currentUser?.role !== "master_admin") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-lg border border-admin-200 bg-white p-6 text-center">
          <h1 className="text-2xl font-bold text-black mb-4">
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
    if (!(await confirm(`Delete "${item.label}"?`))) return;
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
        <div className="w-8 h-8 border-2 border-admin-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  function KebabMenu({ item }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
      function handleClick(e) {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      }
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, []);
    return (
      <div className="relative" ref={ref}>
        <button onClick={() => setOpen(!open)} className="p-1 text-neutral-300 hover:text-neutral-600 rounded transition-colors">
          <FiMoreVertical className="w-4 h-4" />
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg border border-admin-200 shadow-lg z-50 py-1">
            <button onClick={() => { setOpen(false); openEdit(item); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors">
              <FiEdit3 className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={() => { setOpen(false); handleDelete(item); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-destructive-600 hover:bg-destructive-50 transition-colors">
              <FiTrash2 className="w-3.5 h-3.5" /> Delete
            </button>
            <Link to={`/admin/nav-pages/${item.id}`} onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors">
              <FiExternalLink className="w-3.5 h-3.5" /> Page
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <PageShell title="Navigation Menu" subtitle="Manage dropdown items for container sections.">
      {(activeSection || selectedSection) && (
        <form onSubmit={handleSave} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm mb-6">
          <p className="text-sm font-semibold text-gray-900 mb-5">
            {editing ? `Edit: ${editing.label}` : form.parent_id
              ? `Add sub-item under ${dbItems.find(i => i.id === form.parent_id)?.label || '...'}`
              : `Add item under ${activeSection || selectedSection}`}
          </p>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Label</label>
                <input value={form.label} onChange={(e) => handleLabelChange(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-white"
                  placeholder="e.g. Angular Course" />
              </div>
              <div className="relative">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Parent (optional)</label>
                {(() => {
                  const allItems = getAllSectionItems(activeSection || selectedSection);
                  const parentItem = allItems.find(i => i.id === form.parent_id);
                  return (
                    <div className="relative">
                      <button type="button" onClick={() => setParentOpen(!parentOpen)}
                        className="w-full flex items-center justify-between px-3.5 py-2 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                        <span className={form.parent_id ? 'text-gray-900' : 'text-gray-400'}>
                          {parentItem ? parentItem.label : `— Top level —`}
                        </span>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform ${parentOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {parentOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[240px] overflow-y-auto">
                          <button type="button" onClick={() => { handleParentChange(null); setParentOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-sm transition-colors ${!form.parent_id ? 'bg-indigo-50/40 text-gray-900 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
                            — Top level —
                          </button>
                          {allItems.map((p) => (
                            <button key={p.id} type="button" onClick={() => { handleParentChange(p.id); setParentOpen(false); }}
                              className={`w-full text-left px-3 py-2 text-sm transition-colors ${form.parent_id === p.id ? 'bg-indigo-50/40 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                              style={{ paddingLeft: `${12 + p._depth * 20}px` }}>
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
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Path (optional)</label>
                <input value={form.path} onChange={(e) => handlePathChange(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-white font-mono text-xs"
                  placeholder="/auto-generated-from-label" />
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              {allCourses.length > 0 && (
                <div className="w-56 relative" ref={courseSelectRef}>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Link to Course</label>
                  <div className="relative">
                    <button type="button" onClick={() => setCourseSelectOpen(!courseSelectOpen)}
                      className="w-full flex items-center justify-between px-3.5 py-2 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                      <span className={form.path ? 'text-gray-900 truncate' : 'text-gray-400'}>
                        {(() => {
                          const c = allCourses.find((c) => form.path === `/courses/${c.slug}`);
                          return c ? c.title : '— None —';
                        })()}
                      </span>
                      <svg className={`w-4 h-4 text-gray-400 shrink-0 ml-2 transition-transform ${courseSelectOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {courseSelectOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto">
                        <button type="button" onClick={() => { setForm({ ...form, path: "" }); setCourseSelectOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors ${!form.path ? 'bg-indigo-50/40 text-gray-900 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
                          — None —
                        </button>
                        {allCourses.map((c) => (
                          <button key={c.id} type="button" onClick={() => { setForm({ ...form, path: `/courses/${c.slug}` }); setCourseSelectOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-sm transition-colors ${form.path === `/courses/${c.slug}` ? 'bg-indigo-50/40 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                            {c.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 ml-auto">
                <label className="flex items-center gap-2.5 px-3.5 py-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className={`relative w-9 h-5 rounded-full transition-colors ${form.is_active ? "bg-indigo-500" : "bg-gray-300"}`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${form.is_active ? "translate-x-4" : ""}`} />
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="sr-only" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
                <AdminButton type="submit" variant="primary" size="md">
                  <FiCheck className="w-4 h-4" /> {editing ? "Update" : "Add"}
                </AdminButton>
                <button type="button" onClick={cancel} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 xl:col-span-4 space-y-4">
          {filteredSections.map((section) => {
            const items = getSectionItems(section.label);

            return (
              <div key={section.label} className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                <div
                  onClick={() => { setActiveSection(section.label); setEditing(null); setParentOpen(false); pathAuto.current = true; setForm({ label: "", path: "", is_active: true, parent_id: null }); }}
                  className={`flex items-center gap-3 px-6 py-3.5 border-b border-gray-100 cursor-pointer transition-colors ${(activeSection || selectedSection) === section.label ? 'bg-indigo-50/40' : 'hover:bg-gray-50'}`}
                >
                  <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                    <FiFolder className="w-4 h-4 text-indigo-500" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{section.label}</p>
                    <p className="text-xs text-gray-400">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); openAdd(section.label); }}
                    className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                    title={`Add item under ${section.label}`}
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>

                {items.length === 0 ? (
                  <div className="px-6 py-5 text-center">
                    <button onClick={() => openAdd(section.label)} className="text-sm text-gray-400 hover:text-indigo-500 font-medium transition-colors">
                      + Add first item
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {items.map((item) => {
                      const subItems = getChildItems(item.id);
                      return (
                        <div key={item.id} className="group relative">
                          <div className="flex items-center gap-2.5 px-6 py-2.5 hover:bg-gray-50/50 transition-colors">
                            {subItems.length > 0 ? (
                              <FiFolder className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                            ) : (
                              <FiFile className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                            )}
                            <span className="text-sm text-gray-800 flex-1 truncate">{item.label}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              item.is_active !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                            }`}>
                              {item.is_active !== false ? 'On' : 'Off'}
                            </span>
                            <KebabMenu item={item} />
                          </div>
                          {subItems.length > 0 && (
                            <div className="border-t border-gray-50">
                              {subItems.map((sub) => (
                                <div key={sub.id} className="flex items-center gap-2.5 pl-12 pr-6 py-2 hover:bg-gray-50/50 transition-colors group/sub">
                                  <FiFile className="w-3 h-3 text-gray-300 shrink-0" />
                                  <span className="text-sm text-gray-700 flex-1 truncate">{sub.label}</span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                    sub.is_active !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                                  }`}>
                                    {sub.is_active !== false ? 'On' : 'Off'}
                                  </span>
                                  <KebabMenu item={sub} />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-8 xl:col-span-8">
          {!activeSection && !selectedSection ? (
            <div className="rounded-lg border border-gray-200 bg-white p-10 text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                <FiFolder className="w-6 h-6 text-indigo-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">Select a section</p>
              <p className="text-xs text-gray-400">Click on a navigation section from the left panel to manage its items.</p>
            </div>
          ) : (

              <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <div className="col-span-5">Title</div>
                  <div className="col-span-3">URL Path</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
                <div className="divide-y divide-gray-50">
                  {getSectionItems(activeSection || selectedSection).length === 0 ? (
                    <div className="px-6 py-10 text-center">
                      <p className="text-sm text-gray-400">No items yet. Use the form above to add one.</p>
                    </div>
                  ) : (
                    (function renderItems(parentItems, depth = 0) {
                      return parentItems.map((item) => {
                        const subItems = getChildItems(item.id);
                        return (
                          <div key={item.id}>
                            <div className={`grid grid-cols-12 gap-3 px-6 py-3 hover:bg-gray-50/50 transition-colors items-center ${depth > 0 ? 'bg-gray-50/30' : ''}`}
                              style={{ paddingLeft: `${24 + depth * 28}px` }}>
                              <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                                {subItems.length > 0 ? (
                                  <FiFolder className="w-4 h-4 text-cyan-500 shrink-0" />
                                ) : (
                                  <FiFile className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                )}
                                <span className="text-sm text-gray-800 font-medium truncate">{item.label}</span>
                              </div>
                              <div className="col-span-3 truncate">
                                {item.path ? (
                                  <span className="text-xs text-gray-400 font-mono truncate block">{item.path}</span>
                                ) : (
                                  <span className="text-xs text-gray-300">—</span>
                                )}
                              </div>
                              <div className="col-span-2">
                                <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                  item.is_active !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                                }`}>
                                  {item.is_active !== false ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <div className="col-span-2 flex items-center justify-end gap-1">
                                <div className="relative" ref={courseDropdown === item.id ? dropdownRef : null}>
                                  <button onClick={() => setCourseDropdown(courseDropdown === item.id ? null : item.id)}
                                    className="p-1.5 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded transition-colors" title="Linked Courses">
                                    <FiBookOpen className="w-3.5 h-3.5" />
                                  </button>
                                  {courseDropdown === item.id && (
                                    <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px] max-h-[260px] flex flex-col">
                                      <div className="overflow-y-auto">
                                        {allCourses.length === 0 ? (
                                          <p className="px-3 py-3 text-xs text-gray-400 text-center">No courses.</p>
                                        ) : (
                                          allCourses.map(c => {
                                            const checked = linkedCourses(item).some(lc => lc.id === c.id);
                                            return (
                                              <label key={c.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-xs border-b border-gray-50 last:border-b-0">
                                                <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-colors ${checked ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'}`}>
                                                  {checked && <FiCheck className="w-2.5 h-2.5 text-white" />}
                                                </div>
                                                <input type="checkbox" checked={checked} onChange={() => toggleCourseLink(c.id, item.id)} className="sr-only" />
                                                <span className="truncate text-gray-700">{c.title}</span>
                                              </label>
                                            );
                                          })
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <button onClick={() => { setActiveSection(activeSection || selectedSection); setForm({ label: "", path: "", is_active: true, parent_id: item.id }); setEditing(null); }}
                                  className="p-1.5 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded transition-colors" title="Add sub-item">
                                  <FiPlus className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => openEdit(item)}
                                  className="p-1.5 text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 rounded transition-colors" title="Edit">
                                  <FiEdit3 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleDelete(item)}
                                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete">
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
            )}
        </div>
      </div>
      {confirmDialog}
    </PageShell>
  );
}
