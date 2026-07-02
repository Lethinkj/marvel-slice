import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Button from '../../components/ui/Button';
import { FiPlus, FiTrash2, FiEdit2, FiSave, FiCheck, FiX, FiLink, FiChevronDown, FiChevronRight } from 'react-icons/fi';

function LinkRow({ link, onUpdate, onDelete }) {
  return (
    <div className="flex items-center gap-2">
      <FiLink className="w-3 h-3 text-gray-300 shrink-0" />
      <input type="text" value={link.label || ''} onChange={(e) => onUpdate('label', e.target.value)}
        className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent"
        placeholder="Link label" />
      <input type="text" value={link.url || ''} onChange={(e) => onUpdate('url', e.target.value)}
        className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent"
        placeholder="/path or https://..." />
      <button type="button" onClick={onDelete}
        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0">
        <FiTrash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function ColumnCard({ column, onUpdate, onDelete, onAddLink, onUpdateLink, onDeleteLink }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50/80 border-b border-gray-100">
        <button type="button" onClick={() => setExpanded(!expanded)} className="p-0.5">
          {expanded ? <FiChevronDown className="w-4 h-4 text-gray-400" /> : <FiChevronRight className="w-4 h-4 text-gray-400" />}
        </button>
        <input type="text" value={column.title || ''} onChange={(e) => onUpdate('title', e.target.value)}
          className="flex-1 font-semibold text-dark-navy bg-transparent border-none focus:outline-none focus:ring-0 px-0 py-0 text-sm"
          placeholder="Column title" />
        <button type="button" onClick={onDelete}
          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <FiTrash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {expanded && (
        <div className="p-4 space-y-2">
          {(column.footer_links || []).length === 0 && (
            <p className="text-xs text-gray-400 italic text-center py-2">No links in this column</p>
          )}
          {(column.footer_links || []).map((link, li) => (
            <LinkRow key={link.id || li}
              link={link}
              onUpdate={(field, value) => onUpdateLink(li, field, value)}
              onDelete={() => onDeleteLink(li)} />
          ))}
          <button type="button" onClick={onAddLink}
            className="flex items-center gap-1 text-xs font-medium text-brand-accent hover:text-brand-blue transition-colors pt-1">
            <FiPlus className="w-3 h-3" /> Add Link
          </button>
        </div>
      )}
    </div>
  );
}

export default function FooterManager() {
  const [columns, setColumns] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
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
        <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark-navy">Footer Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Manage footer columns and their links</p>
        </div>
        <Button onClick={addColumn} variant="accent" size="md">
          <FiPlus className="w-4 h-4" />
          Add Column
        </Button>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm">
          <FiCheck className="w-4 h-4" /> Footer saved!
        </div>
      )}

      {columns.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-sm text-gray-400">No footer columns yet. Click "Add Column" to get started.</p>
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
