import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Button from '../../components/ui/Button';
import {
  FiPlus, FiTrash2, FiChevronDown, FiChevronRight, FiSave, FiUpload,
  FiHome, FiStar, FiFolder, FiAward, FiBook, FiLayout, FiHelpCircle, FiEye, FiMove, FiCheck, FiX, FiArrowLeft,
} from 'react-icons/fi';

const sectionDefs = [
  {
    key: 'hero', label: 'Hero', icon: FiHome, color: 'from-blue-500 to-blue-600',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text' },
      { name: 'subheading', label: 'Subheading', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'cta_left', label: 'Left CTA Label', type: 'text' },
      { name: 'cta_right', label: 'Right CTA Label', type: 'text' },
      { name: 'hero_image', label: 'Hero Image', type: 'image' },
      { name: 'video_url', label: 'Course Introduction Video URL (YouTube)', type: 'text' },
      { name: 'checklist', label: 'Checklist Items (one per line)', type: 'multiline' },
    ],
  },
  {
    key: 'highlights', label: 'Highlights', icon: FiStar, color: 'from-amber-400 to-orange-500',
    isList: true,
    itemFields: [
      { name: 'icon', label: 'Icon', type: 'icon' },
      { name: 'label', label: 'Label', type: 'text' },
    ],
  },
  {
    key: 'projects', label: 'Projects', icon: FiFolder, color: 'from-emerald-400 to-emerald-600',
    isList: true,
    itemFields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  {
    key: 'certification', label: 'Certification', icon: FiAward, color: 'from-purple-400 to-purple-600',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'image_url', label: 'Certification Image', type: 'image' },
      { name: 'companies', label: 'Recognized Companies (one per line)', type: 'multiline' },
    ],
  },
  {
    key: 'overview', label: 'Course Overview', icon: FiBook, color: 'from-cyan-400 to-cyan-600',
    isAccordion: true,
    fields: [
      { name: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  {
    key: 'tabs', label: 'Tabbed Content', icon: FiLayout, color: 'from-rose-400 to-rose-600',
    isTabs: true,
  },
  {
    key: 'faqs', label: 'FAQs', icon: FiHelpCircle, color: 'from-teal-400 to-teal-600',
    isList: true,
    itemFields: [
      { name: 'question', label: 'Question', type: 'text' },
      { name: 'answer', label: 'Answer', type: 'textarea' },
    ],
  },
];

const iconOptions = [
  { value: 'FiClock', label: 'Clock' },
  { value: 'FiVideo', label: 'Video' },
  { value: 'FiCode', label: 'Code' },
  { value: 'FiAward', label: 'Award' },
  { value: 'FiCalendar', label: 'Calendar' },
  { value: 'FiRefreshCw', label: 'Refresh' },
  { value: 'FiMessageCircle', label: 'Message' },
  { value: 'FiUsers', label: 'Users' },
  { value: 'FiBook', label: 'Book' },
  { value: 'FiGlobe', label: 'Globe' },
  { value: 'FiServer', label: 'Server' },
  { value: 'FiMonitor', label: 'Monitor' },
  { value: 'FiSmartphone', label: 'Mobile' },
  { value: 'FiLayers', label: 'Layers' },
  { value: 'FiGrid', label: 'Grid' },
];

function ImageUploader({ value, onChange, label }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `home/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('pages').upload(path, file);
    if (error) {
      alert('Upload failed: ' + error.message);
    } else {
      const { data } = supabase.storage.from('pages').getPublicUrl(path);
      onChange(data.publicUrl);
    }
    setUploading(false);
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="flex gap-2">
        <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all"
          placeholder="Paste image URL or upload..." />
        <label className="cursor-pointer flex items-center gap-1.5 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-brand-accent hover:text-brand-accent transition-colors">
          {uploading ? (
            <span className="w-4 h-4 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
          ) : (
            <FiUpload className="w-4 h-4" />
          )}
          <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>
      {value && (
        <div className="mt-2 relative group rounded-lg overflow-hidden border border-gray-200">
          <img src={value} alt="" className="h-32 w-full object-cover" />
          <button type="button" onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            <FiTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function AccordionItemsEditor({ items = [], onChange }) {
  function addItem() {
    onChange([...items, { question: '', answer: '', list_items: [] }]);
  }

  function updateItem(idx, field, value) {
    const updated = items.map((item, i) => i === idx ? { ...item, [field]: value } : item);
    onChange(updated);
  }

  function removeItem(idx) {
    onChange(items.filter((_, i) => i !== idx));
  }

  function addListItem(idx) {
    const item = items[idx];
    updateItem(idx, 'list_items', [...(item.list_items || []), '']);
  }

  function updateListItem(itemIdx, listIdx, value) {
    const item = items[itemIdx];
    const list = [...(item.list_items || [])];
    list[listIdx] = value;
    updateItem(itemIdx, 'list_items', list);
  }

  function removeListItem(itemIdx, listIdx) {
    const item = items[itemIdx];
    updateItem(itemIdx, 'list_items', (item.list_items || []).filter((_, i) => i !== listIdx));
  }

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-sm text-gray-400 italic">No accordion items yet.</p>
      )}
      {items.map((item, i) => (
        <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Item {i + 1}</span>
            <button type="button" onClick={() => removeItem(i)}
              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Question</label>
              <input type="text" value={item.question || ''} onChange={(e) => updateItem(i, 'question', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all"
                placeholder="e.g. What will you learn?" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Answer</label>
              <textarea value={item.answer || ''} onChange={(e) => updateItem(i, 'answer', e.target.value)} rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all"
                placeholder="Answer text..." />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-gray-600">Bullet Points</label>
                <button type="button" onClick={() => addListItem(i)}
                  className="text-xs text-brand-accent hover:text-brand-blue font-medium flex items-center gap-0.5">
                  <FiPlus className="w-3 h-3" /> Add point
                </button>
              </div>
              <div className="space-y-1.5">
                {(item.list_items || []).map((li, j) => (
                  <div key={j} className="flex items-center gap-1.5">
                    <span className="text-gray-400">•</span>
                    <input type="text" value={li} onChange={(e) => updateListItem(i, j, e.target.value)}
                      className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                      placeholder="Bullet point" />
                    <button type="button" onClick={() => removeListItem(i, j)}
                      className="p-1 text-red-400 hover:text-red-600">
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
      <Button type="button" onClick={addItem} variant="link-add" size="sm">
        <FiPlus className="w-4 h-4" /> Add Accordion Item
      </Button>
    </div>
  );
}

function BulletEditor({ bullets = [], onChange }) {
  function addBullet() {
    onChange([...bullets, { text: '', icon: 'FiCheck' }]);
  }
  function updateBullet(idx, field, value) {
    const updated = bullets.map((b, i) => i === idx ? { ...b, [field]: value } : b);
    onChange(updated);
  }
  function removeBullet(idx) {
    onChange(bullets.filter((_, i) => i !== idx));
  }
  return (
    <div className="space-y-2">
      {(bullets || []).map((b, i) => (
        <div key={i} className="flex items-center gap-2">
          <select value={b.icon || 'FiCheck'} onChange={(e) => updateBullet(i, 'icon', e.target.value)}
            className="w-28 px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-accent bg-white">
            <option value="FiCheck">Check</option>
            <option value="FiStar">Star</option>
            <option value="FiAward">Award</option>
            <option value="FiArrowRight">Arrow</option>
            <option value="FiCircle">Circle</option>
            <option value="FiZap">Zap</option>
            <option value="FiHeart">Heart</option>
            <option value="FiThumbsUp">Thumbs Up</option>
          </select>
          <input type="text" value={b.text || ''} onChange={(e) => updateBullet(i, 'text', e.target.value)}
            className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent"
            placeholder="Bullet point text" />
          <button type="button" onClick={() => removeBullet(i)}
            className="p-1 text-red-400 hover:text-red-600">
            <FiX className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button type="button" onClick={addBullet}
        className="flex items-center gap-1 text-xs font-medium text-brand-accent hover:text-brand-blue transition-colors">
        <FiPlus className="w-3 h-3" /> Add bullet point
      </button>
    </div>
  );
}

function TabsEditor({ tabs = [], onChange }) {
  function addTab() {
    onChange([...tabs, { label: '', text: '', image_url: '', bullets: [], layout: 'left' }]);
  }

  function updateTab(idx, field, value) {
    const updated = tabs.map((t, i) => i === idx ? { ...t, [field]: value } : t);
    onChange(updated);
  }

  function removeTab(idx) {
    onChange(tabs.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-4">
      {tabs.length === 0 && (
        <p className="text-sm text-gray-400 italic">No tabs yet.</p>
      )}
      {tabs.map((tab, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50/80 border-b border-gray-100">
            <FiMove className="w-4 h-4 text-gray-300 shrink-0" />
            <input type="text" value={tab.label || ''} onChange={(e) => updateTab(i, 'label', e.target.value)}
              className="flex-1 font-semibold text-dark-navy bg-transparent border-none focus:outline-none focus:ring-0 px-0 py-0 text-sm"
              placeholder="Tab label" />
            <button type="button" onClick={() => removeTab(i)}
              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 space-y-5">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${tab.layout !== 'right' ? 'border-brand-accent' : 'border-gray-300'}`}>
                  {tab.layout !== 'right' && <div className="w-2 h-2 rounded-full bg-brand-accent" />}
                </div>
                <input type="radio" name={`layout-${i}`} checked={tab.layout !== 'right'} onChange={() => updateTab(i, 'layout', 'left')} className="sr-only" />
                <span className="text-xs text-gray-600">Text left, image right</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${tab.layout === 'right' ? 'border-brand-accent' : 'border-gray-300'}`}>
                  {tab.layout === 'right' && <div className="w-2 h-2 rounded-full bg-brand-accent" />}
                </div>
                <input type="radio" name={`layout-${i}`} checked={tab.layout === 'right'} onChange={() => updateTab(i, 'layout', 'right')} className="sr-only" />
                <span className="text-xs text-gray-600">Image left, text right</span>
              </label>
            </div>

            <div className="grid grid-cols-5 gap-5">
              <div className="col-span-3 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Text Content</label>
                  <textarea value={tab.text || tab.content || ''} onChange={(e) => updateTab(i, 'text', e.target.value)} rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all"
                    placeholder="Main text content for this tab (~65% width)" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Bullet Points</label>
                  </div>
                  <BulletEditor bullets={tab.bullets || []} onChange={(v) => updateTab(i, 'bullets', v)} />
                </div>
              </div>
              <div className="col-span-2">
                <ImageUploader value={tab.image_url} onChange={(v) => updateTab(i, 'image_url', v)} label="Image" />
                <p className="text-xs text-gray-400 mt-1">~35% width, appears on the {tab.layout === 'right' ? 'left' : 'right'}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
      <Button type="button" onClick={addTab} variant="link-add" size="sm">
        <FiPlus className="w-4 h-4" /> Add Tab
      </Button>
    </div>
  );
}

function IconSelect({ value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">Icon</label>
      <select value={value || ''} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all bg-white">
        <option value="">Select icon...</option>
        {iconOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function SectionEditor({ def, data, onChange }) {
  if (def.isAccordion) {
    return <AccordionEditor def={def} data={data} onChange={onChange} />;
  }

  if (def.isTabs) {
    return <TabsSectionEditor data={data} onChange={onChange} />;
  }

  if (def.isList) {
    return <ListEditor def={def} data={data} onChange={onChange} />;
  }

  return <FieldEditor def={def} data={data} onChange={onChange} />;
}

function FieldEditor({ def, data, onChange }) {
  const heading = data?.heading || '';
  const subheading = data?.subheading || '';
  const content = data?.content || {};

  function updateContent(name, value) {
    onChange({ ...data, content: { ...content, [name]: value } });
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Heading">
          <input type="text" value={heading} onChange={(e) => onChange({ ...data, heading: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all"
            placeholder="Section heading" />
        </Field>
        <Field label="Subheading">
          <input type="text" value={subheading} onChange={(e) => onChange({ ...data, subheading: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all"
            placeholder="Section subheading (optional)" />
        </Field>
      </div>
      {def.fields.map((f) => (
        <RenderField key={f.name} field={f} value={content[f.name]} onChange={(v) => updateContent(f.name, v)} />
      ))}
    </div>
  );
}

function ListEditor({ def, data, onChange }) {
  const items = data?.content?.items || [];
  const heading = data?.heading || '';
  const subheading = data?.subheading || '';

  function addItem() {
    const newItem = {};
    def.itemFields.forEach((f) => { newItem[f.name] = ''; });
    onChange({ ...data, content: { ...(data?.content || {}), items: [...items, newItem] } });
  }

  function updateItem(idx, field, value) {
    const updated = items.map((item, i) => i === idx ? { ...item, [field]: value } : item);
    onChange({ ...data, content: { ...(data?.content || {}), items: updated } });
  }

  function removeItem(idx) {
    onChange({ ...data, content: { ...(data?.content || {}), items: items.filter((_, i) => i !== idx) } });
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Heading">
          <input type="text" value={heading} onChange={(e) => onChange({ ...data, heading: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all" />
        </Field>
        <Field label="Subheading">
          <input type="text" value={subheading} onChange={(e) => onChange({ ...data, subheading: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all" />
        </Field>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{def.label.slice(0, -1)} {i + 1}</span>
              <button type="button" onClick={() => removeItem(i)}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {def.itemFields.map((f) => (
                <div key={f.name}>
                  {f.type === 'textarea' ? (
                    <Field label={f.label}>
                      <textarea value={item[f.name] || ''} onChange={(e) => updateItem(i, f.name, e.target.value)} rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all" />
                    </Field>
                  ) : f.type === 'icon' ? (
                    <IconSelect value={item[f.name]} onChange={(v) => updateItem(i, f.name, v)} />
                  ) : (
                    <Field label={f.label}>
                      <input type="text" value={item[f.name] || ''} onChange={(e) => updateItem(i, f.name, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all" />
                    </Field>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        <Button type="button" onClick={addItem} variant="link-add" size="sm">
          <FiPlus className="w-4 h-4" /> Add {def.label.slice(0, -1)}
        </Button>
      </div>
    </div>
  );
}

function AccordionEditor({ def, data, onChange }) {
  const heading = data?.heading || '';
  const subheading = data?.subheading || '';
  const content = data?.content || {};
  const items = content.items || [];

  function updateContent(name, value) {
    onChange({ ...data, content: { ...content, [name]: value } });
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Heading">
          <input type="text" value={heading} onChange={(e) => onChange({ ...data, heading: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all" />
        </Field>
        <Field label="Subheading">
          <input type="text" value={subheading} onChange={(e) => onChange({ ...data, subheading: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all" />
        </Field>
      </div>
      {def.fields.map((f) => (
        <RenderField key={f.name} field={f} value={content[f.name]} onChange={(v) => updateContent(f.name, v)} />
      ))}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Accordion Items</h4>
        <AccordionItemsEditor items={items} onChange={(v) => updateContent('items', v)} />
      </div>
    </div>
  );
}

function TabsSectionEditor({ data, onChange }) {
  const heading = data?.heading || '';
  const subheading = data?.subheading || '';
  const content = data?.content || {};
  const tabs = content.tabs || [];

  function updateContent(name, value) {
    onChange({ ...data, content: { ...content, [name]: value } });
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Heading">
          <input type="text" value={heading} onChange={(e) => onChange({ ...data, heading: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all" />
        </Field>
        <Field label="Subheading">
          <input type="text" value={subheading} onChange={(e) => onChange({ ...data, subheading: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all" />
        </Field>
      </div>
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Tabs</h4>
        <TabsEditor tabs={tabs} onChange={(v) => updateContent('tabs', v)} />
      </div>
    </div>
  );
}

function RenderField({ field, value, onChange }) {
  if (field.type === 'image') {
    return <ImageUploader value={value} onChange={onChange} label={field.label} />;
  }
  if (field.type === 'textarea') {
    return (
      <Field label={field.label}>
        <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all"
          placeholder={field.label} />
      </Field>
    );
  }
  if (field.type === 'multiline') {
    return (
      <Field label={field.label}>
        <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all font-mono text-xs"
          placeholder={`Enter one ${field.label.toLowerCase()} per line`} />
      </Field>
    );
  }
  return (
    <Field label={field.label}>
      <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all"
        placeholder={`Enter ${field.label.toLowerCase()}`} />
    </Field>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

export default function HomePageEditor() {
  const [sections, setSections] = useState([]);
  const [openKey, setOpenKey] = useState('hero');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase.from('home_sections').select('*');
      const dbMap = {};
      (data || []).forEach((s) => { dbMap[s.section_key] = s; });

      const merged = sectionDefs.map((def) => {
        const existing = dbMap[def.key];
        return {
          id: existing?.id,
          section_key: def.key,
          heading: existing?.heading || '',
          subheading: existing?.subheading || '',
          content: existing?.content || {},
          is_active: existing?.is_active !== false,
        };
      });
      setSections(merged);
      setLoading(false);
    }
    load();
  }, []);

  function updateSection(key, data) {
    setSections((prev) => prev.map((s) => (s.section_key === key ? { ...s, ...data } : s)));
  }

  async function handleSave() {
    setSaving(true);
    for (const section of sections) {
      const payload = {
        section_key: section.section_key,
        heading: section.heading,
        subheading: section.subheading,
        content: section.content,
        is_active: section.is_active,
        sort_order: sectionDefs.findIndex((d) => d.key === section.section_key),
      };
      if (section.id) {
        await supabase.from('home_sections').update(payload).eq('id', section.id);
      } else {
        await supabase.from('home_sections').insert(payload);
      }
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="p-2 text-gray-400 hover:text-dark-navy rounded-lg hover:bg-gray-100 transition-colors">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
          <h1 className="text-2xl font-bold text-dark-navy">Home Page Editor</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all sections displayed on the home page</p>
        </div>
        </div>
        <Button onClick={handleSave} disabled={saving} variant="accent" size="md">
          <FiSave className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save All Sections'}
        </Button>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm">
          <FiCheck className="w-4 h-4" />
          All sections saved successfully!
        </div>
      )}

      <div className="space-y-3">
        {sections.map((section) => {
          const def = sectionDefs.find((d) => d.key === section.section_key);
          if (!def) return null;
          const Icon = def.icon;
          const isOpen = openKey === section.section_key;

          return (
            <div key={section.section_key}
              className={`bg-white rounded-xl border transition-all duration-200 ${
                isOpen ? 'border-brand-accent/30 shadow-md' : 'border-gray-200 shadow-sm hover:shadow-md'
              }`}>
              <button
                onClick={() => setOpenKey(isOpen ? null : section.section_key)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50/50 transition-colors rounded-xl">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${def.color} flex items-center justify-center text-white shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-semibold text-dark-navy flex-1">{def.label}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  section.content && Object.keys(section.content).length > 0
                    ? 'bg-green-50 text-green-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {section.content && Object.keys(section.content).length > 0 ? 'Edited' : 'Empty'}
                </span>
                {isOpen ? (
                  <FiChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <FiChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                  <SectionEditor def={def} data={section} onChange={(data) => updateSection(section.section_key, data)} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
