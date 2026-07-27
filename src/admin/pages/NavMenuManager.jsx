import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from "../../lib/supabaseClient";
import {
  FiPlus, FiCheck, FiFolder, FiFile, FiEdit3, FiTrash2,
  FiChevronDown, FiChevronRight,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import PageShell from "../components/ui/PageShell";
import useConfirm from '../hooks/useConfirm';
import { toast } from '../components/Toast';

const PAGE_SIZE = 10;
const MAX_DEPTH = 2;

function formatTimestamp() {
  return new Date().toISOString();
}

export default function NavMenuManager() {
  const [confirm, confirmDialog] = useConfirm();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionLabel = searchParams.get("section") || "Software Learning";

  // activeTab is now purely derived from the URL — the global sidebar's
  // "View"/"Add" sub-links set ?tab=view / ?tab=add. This page no longer
  // renders its own tab bar or section switcher; it just reacts to the URL.
  const activeTab = searchParams.get("tab") === "add" ? "add" : "view";

  const [dbItems, setDbItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [lockedParent, setLockedParent] = useState(null);
  const [form, setForm] = useState({ label: "", path: "", status: "on", parent_id: null });
  const [parentOpen, setParentOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState({});
  const [highlightId, setHighlightId] = useState(null);
  const pathAuto = useRef(true);
  const highlightTimer = useRef(null);

  // Navigate to a given tab ("view" | "add") while preserving section + any
  // other params. This is the single function that changes what's on screen —
  // the global sidebar can call the exact same navigation by linking to
  // `?section=<label>&tab=<view|add>` directly, no separate state to sync.
  const goToTab = useCallback((tab, extraParams = {}) => {
    const next = Object.fromEntries(searchParams);
    setSearchParams({ ...next, section: sectionLabel, tab, ...extraParams }, { replace: true });
  }, [searchParams, setSearchParams, sectionLabel]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("nav_items").select("*").order("sort_order");
    if (data) setDbItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  useEffect(() => {
    if (!searchParams.get("section")) {
      setSearchParams({ section: "Software Learning", tab: "view" }, { replace: true });
    }
  }, []);

  // Reset local table/form state whenever the section changes (sidebar switched
  // sections). Tab itself stays whatever the URL says — if the sidebar link
  // for that section points at "view", the URL already reflects that.
  useEffect(() => {
    setPage(1);
    setExpanded({});
    cancelForm();
  }, [sectionLabel]);

  useEffect(() => {
    return () => { if (highlightTimer.current) clearTimeout(highlightTimer.current); };
  }, []);

  if (currentUser?.role !== "admin" && currentUser?.role !== "manager" && currentUser?.role !== "master_admin") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-lg border border-admin-200 bg-white p-6 text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Access Denied</h1>
          <p className="text-neutral-500">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  function slugify(text) {
    return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }

  function getSectionItems(label) {
    return dbItems.filter((item) => item.parent_label === label);
  }

  function getChildItems(pid) {
    return dbItems.filter((item) => String(item.parent_id) === String(pid) && !item.parent_label);
  }

  function getAllSectionItems(label) {
    const result = [];
    function walk(items, depth) {
      for (const item of items) {
        result.push({ ...item, _depth: depth });
        if (depth < MAX_DEPTH) walk(getChildItems(item.id), depth + 1);
      }
    }
    walk(getSectionItems(label), 0);
    return result;
  }

  function getParentChain(itemId) {
    const chain = [];
    let current = dbItems.find(i => i.id === itemId);
    while (current) {
      chain.unshift(current.label);
      current = current.parent_id ? dbItems.find(i => i.id === current.parent_id) : null;
    }
    return chain;
  }

  function handleLabelChange(value) {
    setForm((prev) => {
      const next = { ...prev, label: value };
      if (pathAuto.current) {
        const slug = slugify(value);
        next.path = value ? `/courses/${slugify(sectionLabel)}/${slug}` : '';
      }
      return next;
    });
  }

  function handlePathChange(value) {
    pathAuto.current = false;
    setForm((prev) => ({ ...prev, path: value }));
  }

  function openAdd(parentItem = null) {
    setEditing(null);
    setLockedParent(parentItem);
    setParentOpen(false);
    pathAuto.current = true;
    setForm({ label: "", path: "", status: "on", parent_id: parentItem?.id || null });
    goToTab("add");
  }

  function openEdit(item) {
    setEditing(item);
    setLockedParent(null);
    setParentOpen(false);
    pathAuto.current = false;
    setForm({ label: item.label, path: item.path || "", status: item.is_active !== false ? "on" : "off", parent_id: null });
    goToTab("add");
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.label.trim()) return;

    const now = formatTimestamp();
    let savedId;

    if (editing) {
      await supabase.from("nav_items").update({
        label: form.label, path: form.path || null, is_active: form.status === "on",
      }).eq("id", editing.id);
      savedId = editing.id;
      toast({ type: "success", message: "Nav item updated" });
    } else {
      const { data } = await supabase.from("nav_items").insert({
        label: form.label, path: form.path || null,
        parent_label: form.parent_id ? null : sectionLabel,
        parent_id: form.parent_id || null,
        is_active: form.status === "on", sort_order: 0, created_at: now,
      }).select("id").single();
      savedId = data?.id;
      toast({ type: "success", message: "Nav item added" });
    }

    queryClient.invalidateQueries({ queryKey: ['topNavItems'] });
    cancelForm();
    await fetchItems();

    // Auto-expand parent chain and highlight
    if (savedId) {
      const parentItem = form.parent_id ? dbItems.find(i => i.id === form.parent_id) : null;
      if (parentItem) {
        setExpanded(p => ({ ...p, [parentItem.id]: true }));
      }
      setHighlightId(savedId);
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
      highlightTimer.current = setTimeout(() => setHighlightId(null), 2000);
    }
    setPage(1);
    goToTab("view");
  }

  function countAllDescendants(parentId) {
    let count = 0;
    const children = getChildItems(parentId);
    for (const child of children) {
      count += 1 + countAllDescendants(child.id);
    }
    return count;
  }

  async function handleDelete(item) {
    const totalSubs = countAllDescendants(item.id);
    const subText = totalSubs > 0 ? ` and its ${totalSubs} sub-item${totalSubs > 1 ? 's' : ''}` : '';
    if (!(await confirm(`Delete "${item.label}"${subText}?`))) return;
    // Cascade delete — DB has ON DELETE CASCADE, so deleting parent suffices
    await supabase.from("nav_items").delete().eq("id", item.id);
    queryClient.invalidateQueries({ queryKey: ['topNavItems'] });
    toast({ type: "success", message: `"${item.label}" deleted` });
    fetchItems();
  }

  function cancelForm() {
    setEditing(null);
    setLockedParent(null);
    setParentOpen(false);
    pathAuto.current = true;
    setForm({ label: "", path: "", status: "on", parent_id: null });
  }

  const parents = getSectionItems(sectionLabel);
  const totalPages = Math.ceil(parents.length / PAGE_SIZE) || 1;
  const paginatedParents = parents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-admin-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  function NavTable({ items, level = 0, parentLabel = '' }) {
    return items.map((item, idx) => {
      const subs = level < MAX_DEPTH ? getChildItems(item.id) : [];
      const open = expanded[item.id];
      const isHighlighted = highlightId === item.id;
      const slNo = level === 0 ? (page - 1) * PAGE_SIZE + idx + 1 : idx + 1;
      const labelPrefix = level > 0 ? `${parentLabel}.${slNo}` : `${slNo}`;

      return (
        <div key={item.id}>
          <div className={`grid grid-cols-12 gap-3 px-6 py-3 items-center transition-colors ${isHighlighted ? 'bg-indigo-50/60' : 'hover:bg-gray-50'} ${level > 0 ? 'bg-gray-50/30' : 'bg-white'}`}
            style={{ paddingLeft: `${24 + level * 28}px` }}>
            <div className="col-span-1 text-xs text-gray-400 font-mono">{labelPrefix}</div>
            <div className="col-span-3 flex items-center gap-2 min-w-0">
              {subs.length > 0 ? (
                <button onClick={() => setExpanded(p => ({ ...p, [item.id]: !open }))} className="p-0.5 text-gray-400 hover:text-gray-600 focus:outline-none">
                  {open ? <FiChevronDown className="w-3.5 h-3.5" /> : <FiChevronRight className="w-3.5 h-3.5" />}
                </button>
              ) : <span className="w-4" />}
              {level > 0 ? (
                <FiFile className="w-4 h-4 text-gray-400 shrink-0" />
              ) : subs.length > 0 ? (
                <FiFolder className="w-4 h-4 text-cyan-500 shrink-0" />
              ) : (
                <FiFile className="w-3.5 h-3.5 text-gray-300 shrink-0" />
              )}
              <span className="text-sm text-gray-800 font-medium truncate">{item.label}</span>
            </div>
            <div className="col-span-4 truncate">
              {item.path ? (
                <span className="text-xs text-gray-400 font-mono truncate block">{item.path}</span>
              ) : (
                <span className="text-xs text-gray-300">—</span>
              )}
            </div>
            <div className="col-span-1">
              {subs.length > 0 ? (
                <button onClick={() => setExpanded(p => ({ ...p, [item.id]: !open }))}
                  className="text-xs font-medium text-indigo-500 hover:text-indigo-700 focus:outline-none">
                  {subs.length}
                </button>
              ) : (
                <span className="text-xs text-gray-300">—</span>
              )}
            </div>
            <div className="col-span-1">
              <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${
                item.is_active !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {item.is_active !== false ? 'On' : 'Off'}
              </span>
            </div>
            <div className="col-span-2 flex items-center justify-end gap-1">
              {level < MAX_DEPTH && (
                <button onClick={() => openAdd(item)} className="p-1.5 text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 rounded transition-colors" title="Add sub-item">
                  <FiPlus className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={() => openEdit(item)} className="p-1.5 text-gray-300 hover:text-amber-500 hover:bg-amber-50 rounded transition-colors" title="Edit">
                <FiEdit3 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(item)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete">
                <FiTrash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {open && subs.length > 0 && (
            <NavTable items={subs} level={level + 1} parentLabel={labelPrefix} />
          )}
        </div>
      );
    });
  }

  return (
    <PageShell title="Navigation Menu" subtitle={`Manage navigation items — ${sectionLabel}`}>

      {/* No local section switcher and no local tab bar here anymore —
          the global sidebar owns both (Navigation ▸ Software Learning ▾ ▸ View / Add).
          This page just renders whatever ?section=&tab= currently says. */}
      <div className="space-y-6">
        {activeTab === "add" && (
          <form onSubmit={handleSave} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-900 mb-5">
              {editing
                ? `Edit: ${editing.label}`
                : lockedParent
                  ? `Add sub-item under ${getParentChain(lockedParent.id).join(' ▸ ')}`
                  : `Add item under ${sectionLabel}`}
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Label <span className="text-red-400">*</span></label>
                  <input value={form.label} onChange={(e) => handleLabelChange(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                    placeholder="e.g. Web Development" autoFocus />
                </div>
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Parent</label>
                  {lockedParent ? (
                    <div className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed truncate">
                      {getParentChain(lockedParent.id).join(' ▸ ')}
                    </div>
                  ) : (
                    <div className="relative">
                      <button type="button" onClick={() => setParentOpen(!parentOpen)}
                        className="w-full flex items-center justify-between px-3.5 py-2 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                        <span className={form.parent_id ? 'text-gray-900' : 'text-gray-400'}>
                          {form.parent_id
                            ? dbItems.find(i => i.id === form.parent_id)?.label || '...'
                            : '— None (top level) —'}
                        </span>
                        <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${parentOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {parentOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[240px] overflow-y-auto">
                          <button type="button" onClick={() => { setForm(p => ({ ...p, parent_id: null })); setParentOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-sm ${!form.parent_id ? 'bg-indigo-50/40 text-gray-900 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
                            — None (top level) —
                          </button>
                          {getAllSectionItems(sectionLabel).map((p) => (
                            <button key={p.id} type="button" onClick={() => { setForm(prev => ({ ...prev, parent_id: p.id })); setParentOpen(false); }}
                              className={`w-full text-left px-3 py-2 text-sm ${form.parent_id === p.id ? 'bg-indigo-50/40 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                              style={{ paddingLeft: `${12 + p._depth * 20}px` }}>
                              {p._depth > 0 && <span className="text-gray-400 mr-1">&#8627;</span>}{p.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Path</label>
                  <input value={form.path} onChange={(e) => handlePathChange(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-mono text-xs"
                    placeholder="/auto-generated" />
                </div>
              </div>
              <div className="flex items-center gap-3 justify-end">
                <label className="flex items-center gap-2.5 px-3.5 py-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <div className={`relative w-9 h-5 rounded-full transition-colors ${form.status === "on" ? "bg-indigo-500" : "bg-gray-300"}`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${form.status === "on" ? "translate-x-4" : ""}`} />
                    <input type="checkbox" checked={form.status === "on"} onChange={(e) => setForm(p => ({ ...p, status: e.target.checked ? "on" : "off" }))} className="sr-only" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
                <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
                  <FiCheck className="w-4 h-4" /> {editing ? "Update" : "Save"}
                </button>
                <button type="button" onClick={() => { cancelForm(); goToTab("view"); }} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
              </div>
            </div>
          </form>
        )}

        {activeTab === "view" && (
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
            {parents.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <FiFolder className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400 mb-3">No items yet.</p>
                <button onClick={() => { cancelForm(); goToTab("add"); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                  <FiPlus className="w-3.5 h-3.5" /> Add first item
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-gray-100 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="col-span-1">SL NO</div>
                  <div className="col-span-3">LABEL</div>
                  <div className="col-span-4">PATH</div>
                  <div className="col-span-1">SUBS</div>
                  <div className="col-span-1">STATUS</div>
                  <div className="col-span-2 text-right">ACTIONS</div>
                </div>
                <div className="divide-y divide-gray-100">
                  <NavTable items={paginatedParents} level={0} />
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
                    <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
                    <div className="flex items-center gap-1">
                      <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="px-3 py-1 text-xs font-medium rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Previous</button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(pn => pn === 1 || pn === totalPages || Math.abs(pn - page) <= 1)
                        .reduce((acc, pn, idx, arr) => {
                          if (idx > 0 && pn - arr[idx - 1] > 1) acc.push('...');
                          acc.push(pn);
                          return acc;
                        }, [])
                        .map((pn, i) =>
                          pn === '...'
                            ? <span key={`e${i}`} className="w-7 h-7 text-xs text-gray-400 flex items-center justify-center">...</span>
                            : <button key={pn} onClick={() => setPage(pn)}
                                className={`w-7 h-7 text-xs font-medium rounded-md transition-colors ${page === pn ? 'bg-indigo-600 text-white' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>{pn}</button>
                        )}
                      <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="px-3 py-1 text-xs font-medium rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      {confirmDialog}
    </PageShell>
  );
}

