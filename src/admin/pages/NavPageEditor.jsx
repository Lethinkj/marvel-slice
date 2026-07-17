import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { useNavPage } from '../../hooks/useSupabase';
import AdminButton from '../components/AdminButton';
import { FiPlus, FiTrash2, FiChevronUp, FiChevronDown, FiArrowLeft, FiUpload, FiExternalLink, FiSave, FiCheck, FiFileText, FiSearch, FiBookOpen } from 'react-icons/fi';

const sectionTypes = [
  { value: 'text', label: 'Text Block' },
  { value: 'image', label: 'Image' },
  { value: 'cards', label: 'Card Grid' },
  { value: 'features', label: 'Feature List' },
  { value: 'cta', label: 'Call to Action' },
];

function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function ImageUploader({ value, onChange, label }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `nav/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
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
      <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="flex gap-2">
        <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
          placeholder="Paste image URL or upload..." />
        <label className="cursor-pointer flex items-center gap-1.5 px-4 py-2 border-2 border-dashed border-neutral-300 rounded-lg text-sm text-neutral-500 hover:border-accent-500 hover:text-accent-600 transition-colors">
          {uploading ? (
            <span className="w-4 h-4 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <FiUpload className="w-4 h-4" />
          )}
          <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>
      {value && (
        <div className="mt-2 relative group rounded-lg overflow-hidden border border-neutral-200">
          <img src={value} alt="" className="h-32 w-full object-cover" />
          <button type="button" onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1.5 bg-destructive-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            <FiTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function NavPageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: page, isLoading } = useNavPage(id);
  const [navItem, setNavItem] = useState(null);
  const [heading, setHeading] = useState('');
  const [subheading, setSubheading] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [sections, setSections] = useState([]);
  const [saving, setSaving] = useState(false);
  const [generatedPath, setGeneratedPath] = useState('');
  const savingRef = useRef(false);
  const [linkedCourseIds, setLinkedCourseIds] = useState(new Set());
  const [allCourses, setAllCourses] = useState([]);
  const [courseSearch, setCourseSearch] = useState('');
  const [courseChanges, setCourseChanges] = useState(false);

  useEffect(() => {
    supabase.from('nav_items').select('label,path').eq('id', id).maybeSingle().then(({ data }) => {
      if (data) {
        setNavItem(data);
        if (!data.path) {
          setGeneratedPath('/' + slugify(data.label));
        }
      }
    });
  }, [id]);

  useEffect(() => {
    if (page) {
      setHeading(page.heading || '');
      setSubheading(page.subheading || '');
      setHeroImage(page.hero_image || '');
      setSections(page.sections || []);
    }
  }, [page]);

  const fetchLinkedCourses = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase.from('courses').select('id').eq('nav_item_id', id);
    setLinkedCourseIds(new Set((data || []).map(c => c.id)));
  }, [id]);

  const fetchAllCourses = useCallback(async () => {
    const { data } = await supabase.from('courses').select('id, title, slug').eq('is_published', true).order('title');
    setAllCourses(data || []);
  }, []);

  useEffect(() => { fetchLinkedCourses(); fetchAllCourses(); }, [fetchLinkedCourses, fetchAllCourses]);

  function toggleCourse(courseId) {
    setLinkedCourseIds((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return next;
    });
    setCourseChanges(true);
  }

  function addSection() {
    setSections([...sections, { section_type: 'text', heading: '', content: '', image_url: '', sort_order: sections.length }]);
  }

  function updateSection(idx, field, value) {
    const updated = [...sections];
    updated[idx] = { ...updated[idx], [field]: value };
    setSections(updated);
  }

  function removeSection(idx) {
    setSections(sections.filter((_, i) => i !== idx));
  }

  function moveSection(idx, dir) {
    const to = idx + dir;
    if (to < 0 || to >= sections.length) return;
    const updated = [...sections];
    [updated[idx], updated[to]] = [updated[to], updated[idx]];
    setSections(updated);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);

    const path = navItem?.path || generatedPath;
    if (!navItem?.path && generatedPath) {
      await supabase.from('nav_items').update({ path }).eq('id', id);
    }

    const payload = {
      nav_item_id: id,
      heading,
      subheading,
      hero_image: heroImage || null,
      sections,
      is_published: true,
    };
    if (page?.id) {
      await supabase.from('nav_pages').update(payload).eq('id', page.id);
    } else {
      await supabase.from('nav_pages').insert(payload);
    }

    if (courseChanges) {
      const { data: currentLinked } = await supabase.from('courses').select('id').eq('nav_item_id', id);
      const currentIds = new Set((currentLinked || []).map(c => c.id));
      const toAdd = [...linkedCourseIds].filter(cid => !currentIds.has(cid));
      const toRemove = [...currentIds].filter(cid => !linkedCourseIds.has(cid));
      const updates = [];
      toAdd.forEach(cid => updates.push(supabase.from('courses').update({ nav_item_id: id }).eq('id', cid)));
      toRemove.forEach(cid => updates.push(supabase.from('courses').update({ nav_item_id: null }).eq('id', cid)));
      if (updates.length > 0) await Promise.all(updates);
      setCourseChanges(false);
    }

    queryClient.invalidateQueries({ queryKey: ['navPage', id] });
    queryClient.invalidateQueries({ queryKey: ['navPageData'] });
    queryClient.invalidateQueries({ queryKey: ['topNavItems'] });
    navigate('/admin/nav-menu');
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pageUrl = navItem?.path || generatedPath;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/nav-menu"
          className="p-2 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors">
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white shrink-0">
              <FiFileText className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">{navItem ? navItem.label : 'Page Editor'}</h1>
              {pageUrl ? (
                <Link to={pageUrl} target="_blank"
                  className="text-sm text-accent-600 hover:underline inline-flex items-center gap-1 mt-0.5">
                  <FiExternalLink className="w-3.5 h-3.5" />
                  {pageUrl}
                </Link>
              ) : (
                <p className="text-sm text-warning-600 mt-0.5">Set a path on this nav item for the page to be public.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="font-semibold text-neutral-900 mb-4">Hero Section</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">Heading</label>
              <input type="text" value={heading} onChange={(e) => setHeading(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                placeholder="Main heading" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">Subheading</label>
              <input type="text" value={subheading} onChange={(e) => setSubheading(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                placeholder="Supporting text" />
            </div>
          </div>
          <div className="mt-4">
            <ImageUploader value={heroImage} onChange={setHeroImage} label="Hero Image" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-neutral-900">Content Sections</h2>
            <AdminButton type="button" onClick={addSection} variant="ghost" size="sm">
              <FiPlus className="w-4 h-4" />
              Add Section
            </AdminButton>
          </div>

          {sections.length === 0 && (
            <p className="text-sm text-neutral-400 italic py-8 text-center border-2 border-dashed border-neutral-200 rounded-lg">
              No sections yet. Click "Add Section" to add content.
            </p>
          )}

          <div className="space-y-3">
            {sections.map((sec, idx) => (
              <div key={idx} className="border border-neutral-200 rounded-lg p-5 hover:border-neutral-300 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Section {idx + 1}</span>
                    <select value={sec.section_type} onChange={(e) => updateSection(idx, 'section_type', e.target.value)}
                      className="text-xs border border-neutral-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent-500 bg-white">
                      {sectionTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => moveSection(idx, -1)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
                      <FiChevronUp className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => moveSection(idx, 1)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
                      <FiChevronDown className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => removeSection(idx)}
                      className="p-1.5 text-destructive-400 hover:text-destructive-600 hover:bg-destructive-50 rounded-lg transition-colors">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">Heading</label>
                    <input type="text" value={sec.heading || ''} onChange={(e) => updateSection(idx, 'heading', e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      placeholder="Section heading" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">Content</label>
                    <textarea value={sec.content || ''} onChange={(e) => updateSection(idx, 'content', e.target.value)} rows={3}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      placeholder="Section content" />
                  </div>
                  {(sec.section_type === 'image' || sec.section_type === 'cards') && (
                    <ImageUploader value={sec.image_url} onChange={(v) => updateSection(idx, 'image_url', v)} label="Image" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-neutral-900">Linked Courses</h2>
            {courseChanges && <span className="text-xs text-warning-600 font-medium">Unsaved changes</span>}
          </div>
          <p className="text-sm text-neutral-500 mb-4">Select courses to display on this page.</p>
          <div className="relative mb-4">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input type="text" value={courseSearch} onChange={(e) => setCourseSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all" />
          </div>
          {allCourses.length === 0 ? (
            <p className="text-sm text-neutral-400 italic py-6 text-center border-2 border-dashed border-neutral-200 rounded-lg">
              <FiBookOpen className="w-5 h-5 mx-auto mb-2 opacity-50" />
              No courses available. Create courses in the Courses section first.
            </p>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-1 -mx-2 px-2">
              {allCourses
                .filter((c) => !courseSearch || c.title.toLowerCase().includes(courseSearch.toLowerCase()))
                .map((course) => (
                  <label key={course.id}
                    className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                      linkedCourseIds.has(course.id) ? 'bg-accent-50 border border-accent-200' : 'hover:bg-neutral-50 border border-transparent'
                    }`}>
                    <div className={`relative w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      linkedCourseIds.has(course.id) ? 'bg-accent-600 border-accent-600' : 'border-neutral-300'
                    }`}>
                      {linkedCourseIds.has(course.id) && <FiCheck className="w-3.5 h-3.5 text-white" />}
                      <input type="checkbox" checked={linkedCourseIds.has(course.id)} onChange={() => toggleCourse(course.id)} className="sr-only" />
                    </div>
                    <Link to={`/admin/courses/${course.id}`} className="text-sm text-neutral-900 font-medium hover:text-accent-600 truncate"
                      onClick={(e) => e.stopPropagation()}>
                      {course.title}
                    </Link>
                  </label>
                ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-neutral-100 mt-6">
          <AdminButton type="submit" disabled={saving} variant="primary" size="md">
            <FiSave className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Page'}
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
