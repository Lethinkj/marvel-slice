import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Button from '../../components/ui/Button';
import {
  FiPlus, FiTrash2, FiChevronDown, FiChevronRight, FiSave, FiUpload,
  FiHome, FiStar, FiAward, FiHelpCircle, FiArrowLeft, FiImage,
  FiLayout, FiMail, FiMessageSquare,
} from 'react-icons/fi';

const sectionDefs = [
  {
    key: 'hero', label: 'Hero Banner', icon: FiHome, color: 'from-orange-500 to-orange-600',
    fields: [
      { name: 'banner_image', label: 'Full-Width Banner Image (replaces everything)', type: 'image' },
      { name: 'headline', label: 'Headline', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'feature_bullets', label: 'Feature Bullets (one per line)', type: 'multiline' },
      { name: 'cta_text', label: 'CTA Button Text', type: 'text' },
      { name: 'student_image_url', label: 'Student Image', type: 'image' },
    ],
    hasList: true, listLabel: 'Stats', listItemFields: [
      { name: 'value', label: 'Value', type: 'text' },
      { name: 'label', label: 'Label', type: 'text' },
    ],
  },
  {
    key: 'intro_form', label: 'Intro + Form', icon: FiMail, color: 'from-emerald-400 to-emerald-600',
    fields: [
      { name: 'intro_text', label: 'Intro Paragraph', type: 'textarea' },
      { name: 'pill_buttons', label: 'Pill Buttons (one per line)', type: 'multiline' },
      { name: 'form_title', label: 'Form Title', type: 'text' },
    ],
    hasList: true, listLabel: 'Stats', listItemFields: [
      { name: 'value', label: 'Value', type: 'text' },
      { name: 'label', label: 'Label', type: 'text' },
    ],
  },
  {
    key: 'empowering', label: 'Empowering Careers', icon: FiStar, color: 'from-blue-500 to-blue-600',
    fields: [
      { name: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  {
    key: 'featured_courses', label: 'Feature Cards', icon: FiLayout, color: 'from-green-500 to-green-600',
    isFeatureCards: true,
  },
  {
    key: 'services', label: 'Featured Services', icon: FiAward, color: 'from-purple-500 to-purple-600',
    isServices: true,
  },
  {
    key: 'cta_banner', label: 'CTA Banner', icon: FiMessageSquare, color: 'from-teal-500 to-teal-600',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'cta_text', label: 'CTA Button Text', type: 'text' },
      { name: 'cta_link', label: 'CTA Button Link', type: 'text' },
    ],
  },
  {
    key: 'faqs', label: 'FAQs', icon: FiHelpCircle, color: 'from-orange-400 to-orange-500',
    isList: true,
    itemFields: [
      { name: 'question', label: 'Question', type: 'text' },
      { name: 'answer', label: 'Answer', type: 'textarea' },
    ],
  },
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

function ListEditor({ def, data, onChange }) {
  const items = data?.content?.[def.listKey || 'stats'] || [];
  function addItem() {
    const newItem = {};
    def.listItemFields.forEach((f) => { newItem[f.name] = ''; });
    onChange({ ...data, content: { ...(data?.content || {}), [def.listKey || 'stats']: [...items, newItem] } });
  }
  function updateItem(idx, field, value) {
    const updated = items.map((item, i) => i === idx ? { ...item, [field]: value } : item);
    onChange({ ...data, content: { ...(data?.content || {}), [def.listKey || 'stats']: updated } });
  }
  function removeItem(idx) {
    onChange({ ...data, content: { ...(data?.content || {}), [def.listKey || 'stats']: items.filter((_, i) => i !== idx) } });
  }
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{def.listLabel || 'Item'} {i + 1}</span>
            <button type="button" onClick={() => removeItem(i)}
              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {def.listItemFields.map((f) => (
              <div key={f.name}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea value={item[f.name] || ''} onChange={(e) => updateItem(i, f.name, e.target.value)} rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all" />
                ) : (
                  <input type="text" value={item[f.name] || ''} onChange={(e) => updateItem(i, f.name, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <Button type="button" onClick={addItem} variant="link-add" size="sm">
        <FiPlus className="w-4 h-4" /> Add {def.listLabel || 'Item'}
      </Button>
    </div>
  );
}

function FeatureCardsEditor({ data, onChange }) {
  const content = data?.content || {};
  const cards = content.cards || [];

  function addCard() {
    onChange({ ...data, content: { ...content, cards: [...cards, { heading: '', description: '', image_url: '', bullets: [''], button_text: 'View More', button_link: '#' }] } });
  }
  function updateCard(idx, field, value) {
    const updated = cards.map((c, i) => i === idx ? { ...c, [field]: value } : c);
    onChange({ ...data, content: { ...content, cards: updated } });
  }
  function removeCard(idx) {
    onChange({ ...data, content: { ...content, cards: cards.filter((_, i) => i !== idx) } });
  }
  function addBullet(cardIdx) {
    const c = cards[cardIdx];
    updateCard(cardIdx, 'bullets', [...(c.bullets || []), '']);
  }
  function updateBullet(cardIdx, bIdx, value) {
    const c = cards[cardIdx];
    const b = [...(c.bullets || [])];
    b[bIdx] = value;
    updateCard(cardIdx, 'bullets', b);
  }
  function removeBullet(cardIdx, bIdx) {
    const c = cards[cardIdx];
    updateCard(cardIdx, 'bullets', (c.bullets || []).filter((_, i) => i !== bIdx));
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Heading</label>
          <input type="text" value={data?.heading || ''} onChange={(e) => onChange({ ...data, heading: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" placeholder="Section heading" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Subheading</label>
          <input type="text" value={data?.subheading || ''} onChange={(e) => onChange({ ...data, subheading: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" placeholder="Section subheading" />
        </div>
      </div>
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700">Cards</h4>
          <Button type="button" onClick={addCard} variant="link-add" size="sm"><FiPlus className="w-4 h-4" /> Add Card</Button>
        </div>
        {cards.length === 0 && <p className="text-sm text-gray-400 italic">No cards yet.</p>}
        <div className="space-y-3">
          {cards.map((card, i) => (
            <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Card {i + 1}</span>
                <button type="button" onClick={() => removeCard(i)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Heading</label>
                    <input type="text" value={card.heading || ''} onChange={(e) => updateCard(i, 'heading', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Button Text</label>
                    <input type="text" value={card.button_text || 'View More'} onChange={(e) => updateCard(i, 'button_text', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <textarea value={card.description || ''} onChange={(e) => updateCard(i, 'description', e.target.value)} rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                </div>
                <ImageUploader value={card.image_url} onChange={(v) => updateCard(i, 'image_url', v)} label="Image" />
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-gray-600">Bullet Points</label>
                    <button type="button" onClick={() => addBullet(i)}
                      className="text-xs text-brand-accent hover:text-brand-blue font-medium flex items-center gap-0.5">
                      <FiPlus className="w-3 h-3" /> Add
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {(card.bullets || []).map((b, j) => (
                      <div key={j} className="flex items-center gap-1.5">
                        <span className="text-gray-400">•</span>
                        <input type="text" value={b} onChange={(e) => updateBullet(i, j, e.target.value)}
                          className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                          placeholder="Bullet point" />
                        <button type="button" onClick={() => removeBullet(i, j)}
                          className="p-1 text-red-400 hover:text-red-600"><FiTrash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Button Link</label>
                    <input type="text" value={card.button_link || '#'} onChange={(e) => updateCard(i, 'button_link', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ServicesEditor({ data, onChange }) {
  const content = data?.content || {};
  function updateContent(name, value) {
    onChange({ ...data, content: { ...content, [name]: value } });
  }

  const services = content.services_list || [];
  const cards = content.service_cards || [];

  function addService() { updateContent('services_list', [...services, { icon_name: 'FiBriefcase', title: '', description: '' }]); }
  function updateService(idx, field, value) {
    const u = services.map((s, i) => i === idx ? { ...s, [field]: value } : s);
    updateContent('services_list', u);
  }
  function removeService(idx) { updateContent('services_list', services.filter((_, i) => i !== idx)); }

  function addCard() { updateContent('service_cards', [...cards, { image_url: '', title: '', description: '' }]); }
  function updateCard(idx, field, value) {
    const u = cards.map((c, i) => i === idx ? { ...c, [field]: value } : c);
    updateContent('service_cards', u);
  }
  function removeCard(idx) { updateContent('service_cards', cards.filter((_, i) => i !== idx)); }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Heading</label>
          <input type="text" value={data?.heading || ''} onChange={(e) => onChange({ ...data, heading: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Subheading</label>
          <input type="text" value={data?.subheading || ''} onChange={(e) => onChange({ ...data, subheading: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Intro Paragraph</label>
        <textarea value={content.intro || ''} onChange={(e) => updateContent('intro', e.target.value)} rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Left Column Heading</label>
          <input type="text" value={content.left_heading || ''} onChange={(e) => updateContent('left_heading', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">CTA Button Text</label>
          <input type="text" value={content.cta_text || ''} onChange={(e) => updateContent('cta_text', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Left Column Description</label>
        <textarea value={content.left_description || ''} onChange={(e) => updateContent('left_description', e.target.value)} rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ImageUploader value={content.left_image_url} onChange={(v) => updateContent('left_image_url', v)} label="Left Column Image" />
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">CTA Link</label>
          <input type="text" value={content.cta_link || '#'} onChange={(e) => updateContent('cta_link', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700">Services List (3 items)</h4>
          <Button type="button" onClick={addService} variant="link-add" size="sm"><FiPlus className="w-4 h-4" /> Add Service</Button>
        </div>
        <div className="space-y-3">
          {services.map((s, i) => (
            <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Service {i + 1}</span>
                <button type="button" onClick={() => removeService(i)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                  <input type="text" value={s.title || ''} onChange={(e) => updateService(i, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Icon (Fi* name)</label>
                  <input type="text" value={s.icon_name || 'FiBriefcase'} onChange={(e) => updateService(i, 'icon_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" placeholder="FiBriefcase" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <input type="text" value={s.description || ''} onChange={(e) => updateService(i, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700">Service Cards (4 items)</h4>
          <Button type="button" onClick={addCard} variant="link-add" size="sm"><FiPlus className="w-4 h-4" /> Add Card</Button>
        </div>
        <div className="space-y-3">
          {cards.map((c, i) => (
            <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Card {i + 1}</span>
                <button type="button" onClick={() => removeCard(i)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                    <input type="text" value={c.title || ''} onChange={(e) => updateCard(i, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                    <input type="text" value={c.description || ''} onChange={(e) => updateCard(i, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                  </div>
                </div>
                <ImageUploader value={c.image_url} onChange={(v) => updateCard(i, 'image_url', v)} label="Image" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionEditor({ def, data, onChange }) {
  if (def.isFeatureCards) {
    return <FeatureCardsEditor data={data} onChange={onChange} />;
  }
  if (def.isServices) {
    return <ServicesEditor data={data} onChange={onChange} />;
  }
  if (def.isList) {
    return <SimpleListEditor def={def} data={data} onChange={onChange} />;
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
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Heading</label>
          <input type="text" value={heading} onChange={(e) => onChange({ ...data, heading: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" placeholder="Section heading" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Subheading</label>
          <input type="text" value={subheading} onChange={(e) => onChange({ ...data, subheading: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" placeholder="Section subheading" />
        </div>
      </div>
      {def.fields.map((f) => (
        <RenderField key={f.name} field={f} value={content[f.name]} onChange={(v) => updateContent(f.name, v)} />
      ))}
      {def.hasList && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">{def.listLabel || 'List Items'}</h4>
          <ListEditor def={{ ...def, listKey: def.listKey || 'stats' }} data={data} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

function SimpleListEditor({ def, data, onChange }) {
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
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Heading</label>
          <input type="text" value={heading} onChange={(e) => onChange({ ...data, heading: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Subheading</label>
          <input type="text" value={subheading} onChange={(e) => onChange({ ...data, subheading: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
        </div>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{(def.label || 'Item').slice(0, -1)} {i + 1}</span>
              <button type="button" onClick={() => removeItem(i)}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {def.itemFields.map((f) => (
                <div key={f.name}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea value={item[f.name] || ''} onChange={(e) => updateItem(i, f.name, e.target.value)} rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all" />
                  ) : (
                    <input type="text" value={item[f.name] || ''} onChange={(e) => updateItem(i, f.name, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        <Button type="button" onClick={addItem} variant="link-add" size="sm">
          <FiPlus className="w-4 h-4" /> Add {def.label ? def.label.slice(0, -1) : 'Item'}
        </Button>
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
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">{field.label}</label>
        <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all" />
      </div>
    );
  }
  if (field.type === 'multiline') {
    return (
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">{field.label}</label>
        <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all font-mono text-xs"
          placeholder={`Enter one per line`} />
      </div>
    );
  }
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">{field.label}</label>
      <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all" />
    </div>
  );
}

export default function HomePageEditor() {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [openKey, setOpenKey] = useState('hero');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const savingRef = useRef(false);

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
    if (savingRef.current) return;
    savingRef.current = true;
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
    navigate('/admin');
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
