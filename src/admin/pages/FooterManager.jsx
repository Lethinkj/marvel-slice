import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdminButton from '../components/AdminButton';
import { FiPlus, FiLink, FiChevronDown, FiChevronRight } from 'react-icons/fi';

function LinkRow({ link, onUpdate, onDelete }) {
  return (
    <div className="flex items-center gap-2">
      <FiLink className="w-3 h-3 text-neutral-300 shrink-0" />
      <input type="text" value={link.label || ''} onChange={(e) => onUpdate('label', e.target.value)}
        className="flex-1 px-2.5 py-1.5 border border-neutral-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
        placeholder="Link label" />
      <input type="text" value={link.url || ''} onChange={(e) => onUpdate('url', e.target.value)}
        className="flex-1 px-2.5 py-1.5 border border-neutral-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
        placeholder="/path or https://..." />
      <button type="button" onClick={onDelete}
        className="px-2.5 py-1 text-xs font-medium text-destructive-600 bg-destructive-50 hover:bg-destructive-100 rounded-md transition-colors shrink-0">
        Remove
      </button>
    </div>
  );
}

function ColumnCard({ column, onUpdate, onDelete, onAddLink, onUpdateLink, onDeleteLink }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 bg-neutral-50/80 border-b border-neutral-100">
        <button type="button" onClick={() => setExpanded(!expanded)} className="p-0.5">
          {expanded ? <FiChevronDown className="w-4 h-4 text-neutral-400" /> : <FiChevronRight className="w-4 h-4 text-neutral-400" />}
        </button>
        <input type="text" value={column.title || ''} onChange={(e) => onUpdate('title', e.target.value)}
          className="flex-1 font-semibold text-neutral-900 bg-transparent border-none focus:outline-none focus:ring-0 px-0 py-0 text-sm"
          placeholder="Column title" />
        <button type="button" onClick={onDelete}
          className="px-2.5 py-1 text-xs font-medium text-destructive-600 bg-destructive-50 hover:bg-destructive-100 rounded-md transition-colors">
          Remove
        </button>
      </div>
      {expanded && (
        <div className="p-4 space-y-2">
          {(column.footer_links || []).length === 0 && (
            <p className="text-xs text-neutral-400 italic text-center py-2">No links in this column</p>
          )}
          {(column.footer_links || []).map((link, li) => (
            <LinkRow key={link.id || li}
              link={link}
              onUpdate={(field, value) => onUpdateLink(li, field, value)}
              onDelete={() => onDeleteLink(li)} />
          ))}
          <button type="button" onClick={onAddLink}
            className="flex items-center gap-1 text-xs font-medium text-accent-600 hover:text-accent-700 transition-colors pt-1">
            <FiPlus className="w-3 h-3" /> Add Link
          </button>
        </div>
      )}
    </div>
  );
}

export default function FooterManager() {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase
      .from('footer_columns')
      .select('*, footer_links(*)')
      .order('sort_order');
    setColumns(data || []);
    setLoading(false);
  }

  async function addColumn() {
    const { data, error } = await supabase
      .from('footer_columns')
      .insert({ title: 'New Column', sort_order: columns.length })
      .select()
      .single();
    if (!error) {
      setColumns([...columns, { ...data, footer_links: [] }]);
    }
  }

  async function updateColumn(idx, field, value) {
    const col = columns[idx];
    const updated = { ...col, [field]: value };
    const newCols = [...columns];
    newCols[idx] = updated;
    setColumns(newCols);
    await supabase.from('footer_columns').update({ [field]: value }).eq('id', col.id);
  }

  async function deleteColumn(idx) {
    const col = columns[idx];
    if (!window.confirm(`Delete column "${col.title}" and all its links?`)) return;
    await supabase.from('footer_columns').delete().eq('id', col.id);
    setColumns(columns.filter((_, i) => i !== idx));
  }

  async function addLink(colIdx) {
    const col = columns[colIdx];
    const { data, error } = await supabase
      .from('footer_links')
      .insert({ column_id: col.id, label: 'New Link', url: '#', sort_order: (col.footer_links || []).length })
      .select()
      .single();
    if (!error) {
      const newCols = [...columns];
      newCols[colIdx] = { ...col, footer_links: [...(col.footer_links || []), data] };
      setColumns(newCols);
    }
  }

  async function updateLink(colIdx, linkIdx, field, value) {
    const col = columns[colIdx];
    const link = col.footer_links[linkIdx];
    const updated = { ...link, [field]: value };
    const newLinks = [...col.footer_links];
    newLinks[linkIdx] = updated;
    const newCols = [...columns];
    newCols[colIdx] = { ...col, footer_links: newLinks };
    setColumns(newCols);
    await supabase.from('footer_links').update({ [field]: value }).eq('id', link.id);
  }

  async function deleteLink(colIdx, linkIdx) {
    const col = columns[colIdx];
    const link = col.footer_links[linkIdx];
    await supabase.from('footer_links').delete().eq('id', link.id);
    const newCols = [...columns];
    newCols[colIdx] = { ...col, footer_links: col.footer_links.filter((_, i) => i !== linkIdx) };
    setColumns(newCols);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Footer Manager</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage footer columns and their links</p>
        </div>
        <AdminButton onClick={addColumn} variant="primary" size="md">
          <FiPlus className="w-4 h-4" />
          Add Column
        </AdminButton>
      </div>

      {columns.length === 0 ? (
        <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
          <p className="text-sm text-neutral-400">No footer columns yet. Click "Add Column" to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {columns.map((col, i) => (
            <ColumnCard key={col.id}
              column={col}
              onUpdate={(field, value) => updateColumn(i, field, value)}
              onDelete={() => deleteColumn(i)}
              onAddLink={() => addLink(i)}
              onUpdateLink={(li, field, value) => updateLink(i, li, field, value)}
              onDeleteLink={(li) => deleteLink(i, li)} />
          ))}
        </div>
      )}
    </div>
  );
}
