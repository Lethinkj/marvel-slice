import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from "../../lib/supabaseClient";
import ImageUploader from "../components/ImageUploader";
import AdminButton from "../components/AdminButton";
import { FiPlus, FiTrash2, FiMove, FiArrowLeft, FiLayers, FiCheck, FiClock, FiVideo, FiCode, FiAward, FiCalendar, FiRefreshCw, FiMessageCircle, FiUsers, FiStar, FiBarChart2, FiBookOpen, FiBriefcase, FiTarget, FiGlobe, FiCpu, FiDatabase, FiZap, FiShield, FiTrendingUp, FiChevronUp, FiSettings, FiFileText, FiTag, FiImage, FiHeart, FiAlertCircle, FiSave } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

function ListEditor({ items, onChange, fields, labelKey = "label" }) {
  const addItem = () =>
    onChange([
      ...items,
      Object.fromEntries(fields.map((f) => [f.key, f.default || ""])),
    ]);
  const updateItem = (i, key, value) => {
    const next = items.map((item, j) =>
      j === i ? { ...item, [key]: value } : item,
    );
    onChange(next);
  };
  const removeItem = (i) => onChange(items.filter((_, j) => j !== i));

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="border border-neutral-200 rounded-lg p-4 space-y-3 relative"
        >
          <div className="flex items-center gap-2 absolute top-3 right-3">
            <FiMove className="w-4 h-4 text-neutral-300 cursor-move" />
            <button
              onClick={() => removeItem(i)}
              className="text-destructive-400 hover:text-destructive-600"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                {f.label}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  value={item[f.key] || ""}
                  onChange={(e) => updateItem(i, f.key, e.target.value)}
                  rows={f.rows || 3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                />
              ) : f.type === "number" ? (
                <input
                  type="number"
                  value={item[f.key] ?? ""}
                  onChange={(e) =>
                    updateItem(i, f.key, e.target.valueAsNumber ?? null)
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                />
              ) : (
                <input
                  value={item[f.key] || ""}
                  onChange={(e) => updateItem(i, f.key, e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                />
              )}
            </div>
          ))}
        </div>
      ))}
      <AdminButton onClick={addItem} variant="ghost" size="sm">
        <FiPlus className="w-4 h-4" /> Add {labelKey}
      </AdminButton>
    </div>
  );
}

function IconPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);
  const selected = ICON_OPTIONS.find((o) => o.key === value);
  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-medium text-neutral-600 mb-1">Icon</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white text-left"
      >
        {selected ? (
          <>
            <selected.Icon className="w-4 h-4 text-accent-600 shrink-0" />
            <span>{selected.label}</span>
          </>
        ) : (
          <span className="text-neutral-400">Select icon</span>
        )}
        <FiChevronUp className={`w-4 h-4 ml-auto text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 z-50 bg-white border border-neutral-200 rounded-lg max-h-60 overflow-y-auto">
          {ICON_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => { onChange(opt.key); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                value === opt.key
                  ? "bg-accent-50 text-accent-600"
                  : "hover:bg-neutral-50 text-neutral-700"
              }`}
            >
              <opt.Icon className="w-4 h-4 shrink-0" />
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const ICON_OPTIONS = [
  { key: "code", label: "Code", Icon: FiCode },
  { key: "star", label: "Star", Icon: FiStar },
  { key: "award", label: "Award", Icon: FiAward },
  { key: "users", label: "Users", Icon: FiUsers },
  { key: "clock", label: "Clock", Icon: FiClock },
  { key: "target", label: "Target", Icon: FiBarChart2 },
  { key: "book", label: "Book", Icon: FiBookOpen },
  { key: "video", label: "Video", Icon: FiVideo },
  { key: "calendar", label: "Calendar", Icon: FiCalendar },
  { key: "refresh", label: "Refresh", Icon: FiRefreshCw },
  { key: "message", label: "Message", Icon: FiMessageCircle },
  { key: "briefcase", label: "Briefcase", Icon: FiBriefcase },
  { key: "globe", label: "Globe", Icon: FiGlobe },
  { key: "cpu", label: "CPU", Icon: FiCpu },
  { key: "database", label: "Database", Icon: FiDatabase },
  { key: "layers", label: "Layers", Icon: FiLayers },
  { key: "zap", label: "Zap", Icon: FiZap },
  { key: "shield", label: "Shield", Icon: FiShield },
  { key: "trending", label: "Trending", Icon: FiTrendingUp },
];

const tabMeta = {
  basic: { label: "Basic", Icon: FiSettings },
  description: { label: "Description", Icon: FiFileText },
  media: { label: "Media", Icon: FiImage },
  details: { label: "Details", Icon: FiLayers },
  modules: { label: "Modules", Icon: FiBookOpen },
  skills: { label: "Skills", Icon: FiZap },
  benefits: { label: "Benefits", Icon: FiHeart },
  faqs: { label: "FAQs", Icon: FiMessageCircle },
  testimonials: { label: "Testimonials", Icon: FiStar },
  gallery: { label: "Gallery", Icon: FiVideo },
  statistics: { label: "Stats", Icon: FiBarChart2 },
  seo: { label: "SEO", Icon: FiGlobe },
};

const editorTabs = Object.keys(tabMeta);

export default function TrainingEditor() {
  const { user: currentUser } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isNew = id === "new";
  const [tab, setTab] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [training, setTraining] = useState({
    title: "",
    slug: "",
    category_id: "",
    icon: "",
    short_description: "",
    full_description: "",
    duration: "",
    mode: "Online",
    difficulty: "Beginner",
    price: null,
    discount: null,
    badge: "none",
    status: "draft",
    sort_order: 0,
    featured: false,
    popular: false,
    trending: false,
    certificate: false,
    thumbnail_url: "",
    banner_url: "",
    meta_image_url: "",
    eligibility: "",
    learning_outcomes: [],
    modules: [],
    skills: [],
    benefits: [],
    placement_support: "",
    assessment: "",
    seo_title: "",
    seo_description: "",
    seo_keywords: "",
    canonical_url: "",
    trainingModules: [],
    trainingSkills: [],
    trainingBenefits: [],
    faqs: [],
    testimonials: [],
    gallery: [],
    statistics: [],
  });

  const initialLoadRef = useRef(false);
  const savingRef = useRef(false);
  const slugEditedRef = useRef(false);

  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function update(field, value) {
    setTraining((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "title" && !slugEditedRef.current) {
        next.slug = slugify(value);
      }
      return next;
    });
    if (initialLoadRef.current) setIsDirty(true);
  }

  useEffect(() => {
    supabase
      .from("training_categories")
      .select("*")
      .order("sort_order")
      .then(({ data }) => setCategories(data || []));

    if (isNew) return;

    supabase
      .from("training_programs")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (data && !error) {
          setTraining((p) => ({ ...p, ...data }));
          slugEditedRef.current = true;
          initialLoadRef.current = true;
        }
      });

    const related = [
      ["trainingModules", "training_modules"],
      ["trainingSkills", "training_skills"],
      ["trainingBenefits", "training_benefits"],
      ["faqs", "training_faqs"],
      ["testimonials", "training_testimonials"],
      ["gallery", "training_gallery"],
      ["statistics", "training_statistics"],
    ];
    related.forEach(([key, table]) => {
      supabase
        .from(table)
        .select("*")
        .eq("training_program_id", id)
        .order("sort_order")
        .then(({ data }) => {
          if (data) setTraining((prev) => ({ ...prev, [key]: data }));
        });
    });
  }, [id]);

  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;

  useEffect(() => {
    function handler(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSaveRef.current();
      }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  if (currentUser?.role !== "admin" && currentUser?.role !== "editor" && currentUser?.role !== "master_admin") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">
            Access Denied
          </h1>
          <p className="text-neutral-600">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  async function saveRelated(table, records) {
    const { error: delErr } = await supabase.from(table).delete().eq("training_program_id", id);
    if (delErr) throw new Error(delErr.message);
    if (records.length > 0) {
      const clean = records.map((r, i) => {
        const { id: _, ...rest } = r;
        return { ...rest, training_program_id: id, sort_order: i };
      });
      const { error: insErr } = await supabase.from(table).insert(clean);
      if (insErr) throw new Error(insErr.message);
    }
  }

  async function insertRelated(table, records, trainingProgramId) {
    if (records.length > 0) {
      const clean = records.map((r, i) => {
        const { id: _, ...rest } = r;
        return { ...rest, training_program_id: trainingProgramId, sort_order: i };
      });
      const { error } = await supabase.from(table).insert(clean);
      if (error) throw new Error(error.message);
    }
  }

  async function handleSave() {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        title: training.title,
        slug: training.slug,
        category_id: training.category_id || null,
        icon: training.icon,
        short_description: training.short_description,
        full_description: training.full_description,
        duration: training.duration,
        mode: training.mode,
        difficulty: training.difficulty,
        price: training.price,
        discount: training.discount,
        badge: training.badge,
        status: training.status,
        sort_order: training.sort_order,
        featured: training.featured,
        popular: training.popular,
        trending: training.trending,
        certificate: training.certificate,
        thumbnail_url: training.thumbnail_url,
        banner_url: training.banner_url,
        meta_image_url: training.meta_image_url,
        eligibility: training.eligibility,
        learning_outcomes: training.learning_outcomes || [],
        modules: training.modules || [],
        skills: training.skills || [],
        benefits: training.benefits || [],
        placement_support: training.placement_support,
        assessment: training.assessment,
        seo_title: training.seo_title,
        seo_description: training.seo_description,
        seo_keywords: training.seo_keywords,
        canonical_url: training.canonical_url,
      };

      if (isNew) {
        const { data, error } = await supabase
          .from("training_programs")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        await insertRelated("training_modules", training.trainingModules, data.id);
        await insertRelated("training_skills", training.trainingSkills, data.id);
        await insertRelated("training_benefits", training.trainingBenefits, data.id);
        await insertRelated("training_faqs", training.faqs, data.id);
        await insertRelated("training_testimonials", training.testimonials, data.id);
        await insertRelated("training_gallery", training.gallery, data.id);
        await insertRelated("training_statistics", training.statistics, data.id);
        navigate(`/admin/training/${data.id}`, { replace: true });
      } else {
        const { error } = await supabase
          .from("training_programs")
          .update(payload)
          .eq("id", id);
        if (error) throw error;
        await saveRelated("training_modules", training.trainingModules);
        await saveRelated("training_skills", training.trainingSkills);
        await saveRelated("training_benefits", training.trainingBenefits);
        await saveRelated("training_faqs", training.faqs);
        await saveRelated("training_testimonials", training.testimonials);
        await saveRelated("training_gallery", training.gallery);
        await saveRelated("training_statistics", training.statistics);
      }

      queryClient.invalidateQueries({ queryKey: ['trainingPrograms'] });
      queryClient.invalidateQueries({ queryKey: ['trainingProgram', training.slug] });
      queryClient.invalidateQueries({ queryKey: ['trainingProgram', id] });
      setMessage("Training program saved successfully.");
      setIsDirty(false);
    } catch (err) {
      setMessage(err.message);
    }
    setSaving(false);
    savingRef.current = false;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/training"
            className="p-2 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">
            {isNew ? "New Training Program" : `Edit: ${training.title || "Untitled"}`}
            {isDirty && <span className="inline-block w-2.5 h-2.5 bg-amber-400 rounded-full ml-2 align-middle" title="Unsaved changes" />}
          </h1>
        </div>
        <div className="flex gap-2 items-center">
          {isDirty && <span className="text-xs text-amber-600 font-medium">Unsaved</span>}
          <AdminButton
            onClick={() => navigate("/admin/training")}
            variant="secondary"
            size="md"
          >
            Cancel
          </AdminButton>
          <div className="relative">
            <AdminButton
              onClick={handleSave}
              disabled={saving}
              variant="primary"
              size="md"
            >
              {saving ? "Saving..." : "Save Training"}
            </AdminButton>
            {isDirty && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white" />}
          </div>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 text-sm ${
          message.includes("successfully")
            ? "bg-green-50 border border-green-200 text-green-700"
            : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          {message.includes("successfully") ? (
            <FiCheck className="w-4 h-4 shrink-0" />
          ) : (
            <FiAlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message}</span>
        </div>
      )}

      <div className="flex gap-6">
        <div className="w-44 shrink-0 space-y-1">
          {editorTabs.map((t) => {
            const meta = tabMeta[t];
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex flex-col items-center gap-1 w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  tab === t
                    ? "bg-accent-50 text-accent-600 border-l-2 border-accent-500"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                <meta.Icon className="w-5 h-5" />
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 min-w-0 bg-white rounded-lg border border-neutral-200 p-6">
          {tab === "basic" && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Title *
                </label>
                <input
                  value={training.title}
                  onChange={(e) => update("title", e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Slug *
                </label>
                <input
                  value={training.slug}
                  onChange={(e) => {
                    slugEditedRef.current = true;
                    update("slug", e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Category
                </label>
                <select
                  value={training.category_id}
                  onChange={(e) => update("category_id", e.target.value)}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 bg-white"
                >
                  <option value="">— Select Category —</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <IconPicker
                value={training.icon}
                onChange={(val) => update("icon", val)}
              />
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Duration
                </label>
                <input
                  value={training.duration || ""}
                  onChange={(e) => update("duration", e.target.value)}
                  placeholder="e.g. 3 months"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Mode
                  </label>
                  <select
                    value={training.mode}
                    onChange={(e) => update("mode", e.target.value)}
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 bg-white"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={training.difficulty}
                    onChange={(e) => update("difficulty", e.target.value)}
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    value={training.price ?? ""}
                    onChange={(e) => update("price", e.target.value ? e.target.valueAsNumber : null)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Discount
                  </label>
                  <input
                    type="number"
                    value={training.discount ?? ""}
                    onChange={(e) => update("discount", e.target.value ? e.target.valueAsNumber : null)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Badge
                  </label>
                  <select
                    value={training.badge}
                    onChange={(e) => update("badge", e.target.value)}
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 bg-white"
                  >
                    <option value="none">None</option>
                    <option value="Trending">Trending</option>
                    <option value="New">New</option>
                    <option value="Popular">Popular</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Status
                  </label>
                  <select
                    value={training.status}
                    onChange={(e) => update("status", e.target.value)}
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 bg-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={training.sort_order ?? 0}
                  onChange={(e) => update("sort_order", e.target.valueAsNumber ?? 0)}
                  className="w-32 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                />
              </div>
              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={training.certificate}
                    onChange={(e) => update("certificate", e.target.checked)}
                    className="rounded"
                  />
                  Certificate
                </label>
              </div>
              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={training.featured}
                    onChange={(e) => update("featured", e.target.checked)}
                    className="rounded"
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={training.popular}
                    onChange={(e) => update("popular", e.target.checked)}
                    className="rounded"
                  />
                  Popular
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={training.trending}
                    onChange={(e) => update("trending", e.target.checked)}
                    className="rounded"
                  />
                  Trending
                </label>
              </div>
            </div>
          )}

          {tab === "description" && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Short Description
                </label>
                <textarea
                  value={training.short_description || ""}
                  onChange={(e) => update("short_description", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Full Description
                </label>
                <textarea
                  value={training.full_description || ""}
                  onChange={(e) => update("full_description", e.target.value)}
                  rows={16}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 font-mono"
                />
              </div>
            </div>
          )}

          {tab === "media" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Thumbnail
                </label>
                <ImageUploader
                  bucket="training-images"
                  value={training.thumbnail_url}
                  onChange={(url) => update("thumbnail_url", url)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Banner / Hero Image
                </label>
                <ImageUploader
                  bucket="training-images"
                  value={training.banner_url}
                  onChange={(url) => update("banner_url", url)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Meta Image (OG)
                </label>
                <ImageUploader
                  bucket="training-images"
                  value={training.meta_image_url}
                  onChange={(url) => update("meta_image_url", url)}
                />
              </div>
            </div>
          )}

          {tab === "details" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Eligibility
                </label>
                <textarea
                  value={training.eligibility || ""}
                  onChange={(e) => update("eligibility", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  placeholder="Describe who this training is for..."
                />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-2">Learning Outcomes</h4>
                <ListEditor
                  items={training.learning_outcomes || []}
                  onChange={(val) => update("learning_outcomes", val)}
                  fields={[{ key: "item", label: "Outcome" }]}
                  labelKey="Outcome"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-neutral-700">Modules (JSON)</h4>
                  <AdminButton
                    onClick={() => update("modules", [...training.modules, { title: "", duration: "", topics: [], outcomes: [] }])}
                    variant="ghost"
                    size="sm"
                  >
                    <FiPlus className="w-4 h-4" /> Add Module
                  </AdminButton>
                </div>
                {training.modules.length === 0 && (
                  <div className="text-center py-8 text-neutral-400 bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-200">
                    <FiBookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No modules yet.</p>
                  </div>
                )}
                <div className="space-y-3">
                  {training.modules.map((mod, i) => (
                    <div key={i} className="border border-neutral-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Module {i + 1}</span>
                        <button
                          onClick={() => update("modules", training.modules.filter((_, j) => j !== i))}
                          className="p-1 text-destructive-400 hover:text-destructive-600 rounded hover:bg-red-50 transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-neutral-600 mb-1">Title</label>
                          <input
                            value={mod.title || ""}
                            onChange={(e) => {
                              const n = [...training.modules];
                              n[i] = { ...n[i], title: e.target.value };
                              update("modules", n);
                            }}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                            placeholder="Module title"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-neutral-600 mb-1">Duration</label>
                          <input
                            value={mod.duration || ""}
                            onChange={(e) => {
                              const n = [...training.modules];
                              n[i] = { ...n[i], duration: e.target.value };
                              update("modules", n);
                            }}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                            placeholder="e.g. 2 weeks"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">Topics</label>
                        <div className="space-y-1.5">
                          {(mod.topics || []).map((topic, j) => (
                            <div key={j} className="flex items-center gap-2">
                              <input
                                value={topic}
                                onChange={(e) => {
                                  const n = [...training.modules];
                                  const topics = [...(n[i].topics || [])];
                                  topics[j] = e.target.value;
                                  n[i] = { ...n[i], topics };
                                  update("modules", n);
                                }}
                                className="flex-1 px-3 py-1.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                                placeholder="Topic"
                              />
                              <button
                                onClick={() => {
                                  const n = [...training.modules];
                                  n[i] = { ...n[i], topics: n[i].topics.filter((_, k) => k !== j) };
                                  update("modules", n);
                                }}
                                className="p-1 text-destructive-300 hover:text-destructive-500"
                              >
                                <FiTrash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          <AdminButton
                            onClick={() => {
                              const n = [...training.modules];
                              n[i] = { ...n[i], topics: [...(n[i].topics || []), ""] };
                              update("modules", n);
                            }}
                            variant="ghost"
                            size="xs"
                          >
                            <FiPlus className="w-3 h-3" /> Add Topic
                          </AdminButton>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">Outcomes</label>
                        <div className="space-y-1.5">
                          {(mod.outcomes || []).map((outcome, j) => (
                            <div key={j} className="flex items-center gap-2">
                              <input
                                value={outcome}
                                onChange={(e) => {
                                  const n = [...training.modules];
                                  const outcomes = [...(n[i].outcomes || [])];
                                  outcomes[j] = e.target.value;
                                  n[i] = { ...n[i], outcomes };
                                  update("modules", n);
                                }}
                                className="flex-1 px-3 py-1.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                                placeholder="Outcome"
                              />
                              <button
                                onClick={() => {
                                  const n = [...training.modules];
                                  n[i] = { ...n[i], outcomes: n[i].outcomes.filter((_, k) => k !== j) };
                                  update("modules", n);
                                }}
                                className="p-1 text-destructive-300 hover:text-destructive-500"
                              >
                                <FiTrash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          <AdminButton
                            onClick={() => {
                              const n = [...training.modules];
                              n[i] = { ...n[i], outcomes: [...(n[i].outcomes || []), ""] };
                              update("modules", n);
                            }}
                            variant="ghost"
                            size="xs"
                          >
                            <FiPlus className="w-3 h-3" /> Add Outcome
                          </AdminButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-2">Skills (JSON)</h4>
                <ListEditor
                  items={training.skills || []}
                  onChange={(val) => update("skills", val)}
                  fields={[{ key: "item", label: "Skill" }]}
                  labelKey="Skill"
                />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-2">Benefits (JSON)</h4>
                <ListEditor
                  items={training.benefits || []}
                  onChange={(val) => update("benefits", val)}
                  fields={[{ key: "item", label: "Benefit" }]}
                  labelKey="Benefit"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Placement Support
                </label>
                <textarea
                  value={training.placement_support || ""}
                  onChange={(e) => update("placement_support", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  placeholder="Describe placement support offered..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Assessment
                </label>
                <textarea
                  value={training.assessment || ""}
                  onChange={(e) => update("assessment", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  placeholder="Describe assessment methods..."
                />
              </div>
            </div>
          )}

          {tab === "modules" && (
            <div className="max-w-2xl">
              <h3 className="font-semibold text-neutral-900 mb-4">Modules</h3>
              <div className="space-y-4">
                {training.trainingModules.map((mod, i) => (
                  <div key={i} className="border border-neutral-200 rounded-lg p-4 space-y-3 relative">
                    <button
                      onClick={() => update("trainingModules", training.trainingModules.filter((_, j) => j !== i))}
                      className="absolute top-3 right-3 text-destructive-400 hover:text-destructive-600"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">Title</label>
                        <input
                          value={mod.title || ""}
                          onChange={(e) => {
                            const n = [...training.trainingModules];
                            n[i] = { ...n[i], title: e.target.value };
                            update("trainingModules", n);
                          }}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">Duration</label>
                        <input
                          value={mod.duration || ""}
                          onChange={(e) => {
                            const n = [...training.trainingModules];
                            n[i] = { ...n[i], duration: e.target.value };
                            update("trainingModules", n);
                          }}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                          placeholder="e.g. 2 weeks"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Topics</label>
                      <div className="space-y-1.5">
                        {(mod.topics || []).map((topic, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <input
                              value={typeof topic === "string" ? topic : ""}
                              onChange={(e) => {
                                const n = [...training.trainingModules];
                                const topics = [...(n[i].topics || [])];
                                topics[j] = e.target.value;
                                n[i] = { ...n[i], topics };
                                update("trainingModules", n);
                              }}
                              className="flex-1 px-3 py-1.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                              placeholder="Topic"
                            />
                            <button
                              onClick={() => {
                                const n = [...training.trainingModules];
                                n[i] = { ...n[i], topics: n[i].topics.filter((_, k) => k !== j) };
                                update("trainingModules", n);
                              }}
                              className="p-1 text-destructive-300 hover:text-destructive-500"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <AdminButton
                          onClick={() => {
                            const n = [...training.trainingModules];
                            n[i] = { ...n[i], topics: [...(n[i].topics || []), ""] };
                            update("trainingModules", n);
                          }}
                          variant="ghost"
                          size="xs"
                        >
                          <FiPlus className="w-3 h-3" /> Add Topic
                        </AdminButton>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Outcomes</label>
                      <div className="space-y-1.5">
                        {(mod.outcomes || []).map((outcome, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <input
                              value={typeof outcome === "string" ? outcome : ""}
                              onChange={(e) => {
                                const n = [...training.trainingModules];
                                const outcomes = [...(n[i].outcomes || [])];
                                outcomes[j] = e.target.value;
                                n[i] = { ...n[i], outcomes };
                                update("trainingModules", n);
                              }}
                              className="flex-1 px-3 py-1.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                              placeholder="Outcome"
                            />
                            <button
                              onClick={() => {
                                const n = [...training.trainingModules];
                                n[i] = { ...n[i], outcomes: n[i].outcomes.filter((_, k) => k !== j) };
                                update("trainingModules", n);
                              }}
                              className="p-1 text-destructive-300 hover:text-destructive-500"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <AdminButton
                          onClick={() => {
                            const n = [...training.trainingModules];
                            n[i] = { ...n[i], outcomes: [...(n[i].outcomes || []), ""] };
                            update("trainingModules", n);
                          }}
                          variant="ghost"
                          size="xs"
                        >
                          <FiPlus className="w-3 h-3" /> Add Outcome
                        </AdminButton>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Sort Order</label>
                      <input
                        type="number"
                        value={mod.sort_order ?? i}
                        onChange={(e) => {
                          const n = [...training.trainingModules];
                          n[i] = { ...n[i], sort_order: e.target.valueAsNumber ?? i };
                          update("trainingModules", n);
                        }}
                        className="w-24 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      />
                    </div>
                  </div>
                ))}
                <AdminButton
                  onClick={() => update("trainingModules", [...training.trainingModules, { title: "", duration: "", topics: [], outcomes: [], sort_order: training.trainingModules.length }])}
                  variant="ghost"
                  size="sm"
                >
                  <FiPlus className="w-4 h-4" /> Add Module
                </AdminButton>
              </div>
            </div>
          )}

          {tab === "skills" && (
            <div className="max-w-2xl">
              <h3 className="font-semibold text-neutral-900 mb-4">Skills</h3>
              <div className="space-y-4">
                {training.trainingSkills.map((s, i) => (
                  <div key={i} className="border border-neutral-200 rounded-lg p-4 space-y-3 relative">
                    <button
                      onClick={() => update("trainingSkills", training.trainingSkills.filter((_, j) => j !== i))}
                      className="absolute top-3 right-3 text-destructive-400 hover:text-destructive-600"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                    <IconPicker
                      value={s.icon || ""}
                      onChange={(val) => {
                        const n = [...training.trainingSkills];
                        n[i] = { ...n[i], icon: val };
                        update("trainingSkills", n);
                      }}
                    />
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Title</label>
                      <input
                        value={s.title || ""}
                        onChange={(e) => {
                          const n = [...training.trainingSkills];
                          n[i] = { ...n[i], title: e.target.value };
                          update("trainingSkills", n);
                        }}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Description</label>
                      <textarea
                        value={s.description || ""}
                        onChange={(e) => {
                          const n = [...training.trainingSkills];
                          n[i] = { ...n[i], description: e.target.value };
                          update("trainingSkills", n);
                        }}
                        rows={2}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Sort Order</label>
                      <input
                        type="number"
                        value={s.sort_order ?? i}
                        onChange={(e) => {
                          const n = [...training.trainingSkills];
                          n[i] = { ...n[i], sort_order: e.target.valueAsNumber ?? i };
                          update("trainingSkills", n);
                        }}
                        className="w-24 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      />
                    </div>
                  </div>
                ))}
                <AdminButton
                  onClick={() => update("trainingSkills", [...training.trainingSkills, { icon: "", title: "", description: "", sort_order: training.trainingSkills.length }])}
                  variant="ghost"
                  size="sm"
                >
                  <FiPlus className="w-4 h-4" /> Add Skill
                </AdminButton>
              </div>
            </div>
          )}

          {tab === "benefits" && (
            <div className="max-w-2xl">
              <h3 className="font-semibold text-neutral-900 mb-4">Benefits</h3>
              <div className="space-y-4">
                {training.trainingBenefits.map((b, i) => (
                  <div key={i} className="border border-neutral-200 rounded-lg p-4 space-y-3 relative">
                    <button
                      onClick={() => update("trainingBenefits", training.trainingBenefits.filter((_, j) => j !== i))}
                      className="absolute top-3 right-3 text-destructive-400 hover:text-destructive-600"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                    <IconPicker
                      value={b.icon || ""}
                      onChange={(val) => {
                        const n = [...training.trainingBenefits];
                        n[i] = { ...n[i], icon: val };
                        update("trainingBenefits", n);
                      }}
                    />
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Title</label>
                      <input
                        value={b.title || ""}
                        onChange={(e) => {
                          const n = [...training.trainingBenefits];
                          n[i] = { ...n[i], title: e.target.value };
                          update("trainingBenefits", n);
                        }}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Description</label>
                      <textarea
                        value={b.description || ""}
                        onChange={(e) => {
                          const n = [...training.trainingBenefits];
                          n[i] = { ...n[i], description: e.target.value };
                          update("trainingBenefits", n);
                        }}
                        rows={2}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Sort Order</label>
                      <input
                        type="number"
                        value={b.sort_order ?? i}
                        onChange={(e) => {
                          const n = [...training.trainingBenefits];
                          n[i] = { ...n[i], sort_order: e.target.valueAsNumber ?? i };
                          update("trainingBenefits", n);
                        }}
                        className="w-24 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      />
                    </div>
                  </div>
                ))}
                <AdminButton
                  onClick={() => update("trainingBenefits", [...training.trainingBenefits, { icon: "", title: "", description: "", sort_order: training.trainingBenefits.length }])}
                  variant="ghost"
                  size="sm"
                >
                  <FiPlus className="w-4 h-4" /> Add Benefit
                </AdminButton>
              </div>
            </div>
          )}

          {tab === "faqs" && (
            <div className="max-w-2xl">
              <h3 className="font-semibold text-neutral-900 mb-4">FAQs</h3>
              <div className="space-y-4">
                {training.faqs.map((faq, i) => (
                  <div key={i} className="border border-neutral-200 rounded-lg p-4 space-y-3 relative">
                    <button
                      onClick={() => update("faqs", training.faqs.filter((_, j) => j !== i))}
                      className="absolute top-3 right-3 text-destructive-400 hover:text-destructive-600"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Question</label>
                      <input
                        value={faq.question || ""}
                        onChange={(e) => {
                          const n = [...training.faqs];
                          n[i] = { ...n[i], question: e.target.value };
                          update("faqs", n);
                        }}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Answer</label>
                      <textarea
                        value={faq.answer || ""}
                        onChange={(e) => {
                          const n = [...training.faqs];
                          n[i] = { ...n[i], answer: e.target.value };
                          update("faqs", n);
                        }}
                        rows={3}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">Category</label>
                        <input
                          value={faq.category || ""}
                          onChange={(e) => {
                            const n = [...training.faqs];
                            n[i] = { ...n[i], category: e.target.value };
                            update("faqs", n);
                          }}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                          placeholder="e.g. Pricing, General"
                        />
                      </div>
                      <div className="flex items-end pb-2">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={faq.is_active !== false}
                            onChange={(e) => {
                              const n = [...training.faqs];
                              n[i] = { ...n[i], is_active: e.target.checked };
                              update("faqs", n);
                            }}
                            className="rounded"
                          />
                          Active
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                <AdminButton
                  onClick={() => update("faqs", [...training.faqs, { question: "", answer: "", category: "", is_active: true }])}
                  variant="ghost"
                  size="sm"
                >
                  <FiPlus className="w-4 h-4" /> Add FAQ
                </AdminButton>
              </div>
            </div>
          )}

          {tab === "testimonials" && (
            <div className="max-w-2xl">
              <h3 className="font-semibold text-neutral-900 mb-4">Testimonials</h3>
              <div className="space-y-4">
                {training.testimonials.map((t, i) => (
                  <div key={i} className="border border-neutral-200 rounded-lg p-4 space-y-3 relative">
                    <button
                      onClick={() => update("testimonials", training.testimonials.filter((_, j) => j !== i))}
                      className="absolute top-3 right-3 text-destructive-400 hover:text-destructive-600"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Student Name</label>
                      <input
                        value={t.student_name || ""}
                        onChange={(e) => {
                          const n = [...training.testimonials];
                          n[i] = { ...n[i], student_name: e.target.value };
                          update("testimonials", n);
                        }}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Photo</label>
                      <ImageUploader
                        bucket="training-images"
                        value={t.photo || ""}
                        onChange={(url) => {
                          const n = [...training.testimonials];
                          n[i] = { ...n[i], photo: url };
                          update("testimonials", n);
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">College</label>
                        <input
                          value={t.college || ""}
                          onChange={(e) => {
                            const n = [...training.testimonials];
                            n[i] = { ...n[i], college: e.target.value };
                            update("testimonials", n);
                          }}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">Company</label>
                        <input
                          value={t.company || ""}
                          onChange={(e) => {
                            const n = [...training.testimonials];
                            n[i] = { ...n[i], company: e.target.value };
                            update("testimonials", n);
                          }}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Rating</label>
                      <select
                        value={t.rating ?? 5}
                        onChange={(e) => {
                          const n = [...training.testimonials];
                          n[i] = { ...n[i], rating: Number(e.target.value) };
                          update("testimonials", n);
                        }}
                        className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 bg-white"
                      >
                        {[1, 2, 3, 4, 5].map((r) => (
                          <option key={r} value={r}>{r} Star{r > 1 ? "s" : ""}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Review</label>
                      <textarea
                        value={t.review || ""}
                        onChange={(e) => {
                          const n = [...training.testimonials];
                          n[i] = { ...n[i], review: e.target.value };
                          update("testimonials", n);
                        }}
                        rows={3}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      />
                    </div>
                  </div>
                ))}
                <AdminButton
                  onClick={() => update("testimonials", [...training.testimonials, { student_name: "", photo: "", college: "", company: "", rating: 5, review: "" }])}
                  variant="ghost"
                  size="sm"
                >
                  <FiPlus className="w-4 h-4" /> Add Testimonial
                </AdminButton>
              </div>
            </div>
          )}

          {tab === "gallery" && (
            <div className="max-w-2xl">
              <h3 className="font-semibold text-neutral-900 mb-4">Gallery</h3>
              <div className="space-y-4">
                {training.gallery.map((g, i) => (
                  <div key={i} className="border border-neutral-200 rounded-lg p-4 space-y-3 relative">
                    <button
                      onClick={() => update("gallery", training.gallery.filter((_, j) => j !== i))}
                      className="absolute top-3 right-3 text-destructive-400 hover:text-destructive-600"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Image</label>
                      <ImageUploader
                        bucket="training-images"
                        value={g.image || ""}
                        onChange={(url) => {
                          const n = [...training.gallery];
                          n[i] = { ...n[i], image: url };
                          update("gallery", n);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Caption</label>
                      <input
                        value={g.caption || ""}
                        onChange={(e) => {
                          const n = [...training.gallery];
                          n[i] = { ...n[i], caption: e.target.value };
                          update("gallery", n);
                        }}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Type</label>
                      <select
                        value={g.type || "image"}
                        onChange={(e) => {
                          const n = [...training.gallery];
                          n[i] = { ...n[i], type: e.target.value };
                          update("gallery", n);
                        }}
                        className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 bg-white"
                      >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                  </div>
                ))}
                <AdminButton
                  onClick={() => update("gallery", [...training.gallery, { image: "", caption: "", type: "image" }])}
                  variant="ghost"
                  size="sm"
                >
                  <FiPlus className="w-4 h-4" /> Add Gallery Item
                </AdminButton>
              </div>
            </div>
          )}

          {tab === "statistics" && (
            <div className="max-w-2xl">
              <h3 className="font-semibold text-neutral-900 mb-4">Statistics</h3>
              <div className="space-y-4">
                {training.statistics.map((s, i) => (
                  <div key={i} className="border border-neutral-200 rounded-lg p-4 space-y-3 relative">
                    <button
                      onClick={() => update("statistics", training.statistics.filter((_, j) => j !== i))}
                      className="absolute top-3 right-3 text-destructive-400 hover:text-destructive-600"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                    <IconPicker
                      value={s.icon || ""}
                      onChange={(val) => {
                        const n = [...training.statistics];
                        n[i] = { ...n[i], icon: val };
                        update("statistics", n);
                      }}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">Title</label>
                        <input
                          value={s.title || ""}
                          onChange={(e) => {
                            const n = [...training.statistics];
                            n[i] = { ...n[i], title: e.target.value };
                            update("statistics", n);
                          }}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                          placeholder="e.g. Students Trained"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">Value</label>
                        <input
                          value={s.value || ""}
                          onChange={(e) => {
                            const n = [...training.statistics];
                            n[i] = { ...n[i], value: e.target.value };
                            update("statistics", n);
                          }}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                          placeholder="e.g. 10,000+"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <AdminButton
                  onClick={() => update("statistics", [...training.statistics, { title: "", value: "", icon: "" }])}
                  variant="ghost"
                  size="sm"
                >
                  <FiPlus className="w-4 h-4" /> Add Statistic
                </AdminButton>
              </div>
            </div>
          )}

          {tab === "seo" && (
            <div className="space-y-4 max-w-2xl">
              <h3 className="font-semibold text-neutral-900 mb-4">SEO Settings</h3>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  SEO Title
                </label>
                <input
                  value={training.seo_title || ""}
                  onChange={(e) => update("seo_title", e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  SEO Description
                </label>
                <textarea
                  value={training.seo_description || ""}
                  onChange={(e) => update("seo_description", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  SEO Keywords
                </label>
                <input
                  value={training.seo_keywords || ""}
                  onChange={(e) => update("seo_keywords", e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Canonical URL
                </label>
                <input
                  value={training.canonical_url || ""}
                  onChange={(e) => update("canonical_url", e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  placeholder="https://..."
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-neutral-100 mt-6">
            <AdminButton onClick={handleSave} disabled={saving} variant="primary" size="md">
              <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
            </AdminButton>
          </div>
        </div>
      </div>
    </div>
  );
}
