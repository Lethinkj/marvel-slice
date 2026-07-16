import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import Button from "../../components/ui/Button";
import ImageUploader from "../components/ImageUploader";
import {
  FiPlus,
  FiTrash2,
  FiArrowLeft,
  FiCheck,
  FiChevronRight,
  FiChevronLeft,
  FiClock,
  FiMonitor,
  FiUsers,
  FiAward,
  FiBookOpen,
  FiLayers,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const STEPS = [
  { label: "Basics", icon: FiBookOpen },
  { label: "Media & Content", icon: FiMonitor },
  { label: "Curriculum & Pricing", icon: FiLayers },
  { label: "FAQs & Tags", icon: FiAward },
];

const DURATIONS = ["1 month", "2 months", "3 months", "4 months", "6 months", "8 months", "12 months"];
const MODES = ["Online", "Offline", "Both"];

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export default function CourseWizard() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  if (currentUser?.role !== "admin" && currentUser?.role !== "editor" && currentUser?.role !== "master_admin") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <h1 className="text-2xl font-bold text-dark-navy mb-4">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [allTags, setAllTags] = useState([]);
  const [courseTags, setCourseTags] = useState([]);
  const [navItemId, setNavItemId] = useState("");
  const [availablePaths, setAvailablePaths] = useState([]);
  const [catL1, setCatL1] = useState("");
  const [catL2, setCatL2] = useState("");
  const [catL3, setCatL3] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);

  const [c, setC] = useState({
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    hero_image_url: "",
    video_thumbnail_url: "",
    video_url: "",
    cta_left: "",
    cta_right: "",
    is_published: true,
    status: "Active",
    duration: "3 months",
    mode: "Both",
    checklist_items: [],
    tabs: [],
    highlights: [],
    overview_faqs: [],
    course_fees: [],
    projects: [],
    certifications: [{ description: "", image_url: "", certificate_image_url: "", recognized_companies: [] }],
    faqs: [],
    curriculum: [],
  });

  useEffect(() => {
    supabase.from("tags").select("*").order("name").then(({ data }) => setAllTags(data || []));
  }, []);

  useEffect(() => {
    if (!navItemId) return;
    supabase.from("nav_items").select("id, label, path, parent_label").eq("id", navItemId).single().then(({ data }) => {
      if (data?.parent_label) setFilterSection(data.parent_label);
    });
  }, [navItemId]);

  const [filterSection, setFilterSection] = useState("");

  function resetCategoryPath() {
    setCatL1(""); setCatL2(""); setCatL3(""); setNavItemId("");
  }

  useEffect(() => {
    resetCategoryPath();
  }, [filterSection]);

  useEffect(() => {
    if (!catL1) { setCatL2(""); setCatL3(""); setNavItemId(""); return; }
    const kids = getChildren(catL1);
    if (kids.length === 0) { setCatL2(""); setCatL3(""); setNavItemId(catL1); return; }
    setNavItemId("");
  }, [catL1]);

  useEffect(() => {
    if (!catL2) { setCatL3(""); setNavItemId(""); return; }
    const kids = getChildren(catL2);
    if (kids.length === 0) { setCatL3(""); setNavItemId(catL2); return; }
    setNavItemId("");
  }, [catL2]);

  useEffect(() => {
    if (catL3) setNavItemId(catL3);
  }, [catL3]);

  useEffect(() => {
    supabase
      .from("nav_items")
      .select("id, label, path, parent_label, parent_id")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        const items = data || [];
        setAvailablePaths(items);
      });
  }, []);

  const categories = [...new Set(availablePaths.map((p) => p.parent_label).filter(Boolean))];

  function u(field, val) {
    setC((prev) => ({ ...prev, [field]: val }));
  }

  function canNext() {
    if (step === 0) return c.title.trim() !== "" && c.slug.trim() !== "" && navItemId !== "";
    return true;
  }

  function getChildren(pid) {
    return availablePaths.filter((p) => p.parent_id === pid);
  }

  function findItem(id) {
    return availablePaths.find((p) => p.id === id);
  }

  function addModule() {
    u("curriculum", [...c.curriculum, { title: "", topics: [] }]);
  }

  function updateModule(i, field, val) {
    const next = [...c.curriculum];
    next[i] = { ...next[i], [field]: val };
    u("curriculum", next);
  }

  function addTopic(moduleIdx) {
    const next = [...c.curriculum];
    next[moduleIdx] = { ...next[moduleIdx], topics: [...(next[moduleIdx].topics || []), ""] };
    u("curriculum", next);
  }

  function updateTopic(moduleIdx, topicIdx, val) {
    const next = [...c.curriculum];
    const topics = [...(next[moduleIdx].topics || [])];
    topics[topicIdx] = val;
    next[moduleIdx] = { ...next[moduleIdx], topics };
    u("curriculum", next);
  }

  function removeTopic(moduleIdx, topicIdx) {
    const next = [...c.curriculum];
    next[moduleIdx] = { ...next[moduleIdx], topics: next[moduleIdx].topics.filter((_, j) => j !== topicIdx) };
    u("curriculum", next);
  }

  function removeModule(i) {
    u("curriculum", c.curriculum.filter((_, j) => j !== i));
  }

  function handleTitleChange(value) {
    u("title", value);
    if (!c.slug || c.slug === slugify(c.title)) {
      u("slug", slugify(value));
    }
  }

  async function handleCreateTag() {
    const name = newTagName.trim();
    if (!name) return;
    setCreatingTag(true);
    const { data, error } = await supabase.from("tags").insert({ name }).select().single();
    if (!error && data) {
      setAllTags((prev) => [...prev, data]);
      setCourseTags((prev) => [...prev, data.id]);
      setNewTagName("");
    }
    setCreatingTag(false);
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const pathItem = availablePaths.find((p) => p.id === navItemId);
      const payload = {
        title: c.title,
        slug: c.slug,
        subtitle: c.subtitle,
        description: c.description,
        hero_image_url: c.hero_image_url,
        video_thumbnail_url: c.video_thumbnail_url,
        video_url: c.video_url,
        cta_left: c.cta_left,
        cta_right: c.cta_right,
        is_published: c.is_published,
        status: c.status,
        duration: c.duration,
        mode: c.mode,
        checklist_items: c.checklist_items,
        curriculum: c.curriculum,
        nav_item_id: navItemId || null,
      };

      const { data: newCourse, error } = await supabase.from("courses").insert(payload).select().single();
      if (error) throw error;

      const cid = newCourse.id;
      const inserts = [];

      if (c.tabs.length > 0)
        inserts.push(supabase.from("course_tabs").insert(c.tabs.map((t, i) => ({ ...t, course_id: cid, sort_order: i }))));
      if (c.highlights.length > 0)
        inserts.push(supabase.from("highlights").insert(c.highlights.map((h, i) => ({ ...h, course_id: cid, sort_order: i }))));
      if (c.overview_faqs.length > 0)
        inserts.push(supabase.from("overview_faqs").insert(c.overview_faqs.map((f, i) => ({ ...f, course_id: cid, sort_order: i }))));
      if (c.course_fees.length > 0)
        inserts.push(supabase.from("course_fees").insert(c.course_fees.map((f, i) => ({ ...f, course_id: cid, sort_order: i }))));
      if (c.projects.length > 0)
        inserts.push(supabase.from("projects").insert(c.projects.map((p, i) => ({ ...p, course_id: cid, sort_order: i }))));
      if (c.certifications.length > 0)
        inserts.push(supabase.from("certifications").insert(c.certifications.map((x) => ({ ...x, course_id: cid }))));
      if (c.faqs.length > 0)
        inserts.push(supabase.from("faqs").insert(c.faqs.map((f, i) => ({ ...f, course_id: cid, sort_order: i }))));
      if (courseTags.length > 0)
        inserts.push(supabase.from("course_tags").insert(courseTags.map((tid) => ({ course_id: cid, tag_id: tid }))));

      const results = await Promise.all(inserts);
      for (const r of results) {
        if (r.error) throw new Error(r.error.message);
      }
      navigate("/admin/courses");
    } catch (err) {
      setMessage(err.message);
    }
    setSaving(false);
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/admin/courses" className="p-2 text-gray-400 hover:text-dark-navy rounded-lg hover:bg-gray-100 transition-colors">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-dark-navy">Create New Course</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/admin/courses")} variant="ghost" size="md">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !c.title.trim() || !c.slug.trim() || !navItemId || courseTags.length === 0} variant="accent" size="md">
            {saving ? "Saving..." : "Save Course"}
          </Button>
        </div>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
          <span>{message}</span>
        </div>
      )}

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => setStep(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  i === step
                    ? "bg-brand-accent text-white shadow-lg shadow-brand-accent/25"
                    : i < step
                    ? "bg-brand-accent/10 text-brand-accent"
                    : "bg-gray-100 text-gray-400 hover:text-gray-600"
                }`}
              >
                {i < step ? (
                  <FiCheck className="w-4 h-4" />
                ) : (
                  <s.icon className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 rounded-full ${i < step ? "bg-brand-accent" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        {/* Step 0: Basics */}
        {step === 0 && (
          <div className="space-y-6">
            {categories.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-dark-navy mb-3">Category *</label>
                <div className="flex flex-wrap gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setFilterSection(cat);
                        resetCategoryPath();
                      }}
                      className={`px-5 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        filterSection === cat
                          ? "border-brand-accent bg-brand-accent/5 text-brand-accent shadow-sm"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filterSection && (() => {
              const topLevel = availablePaths.filter((p) => p.parent_label === filterSection && !p.parent_id);
              const kids1 = catL1 ? getChildren(catL1) : [];
              const kids2 = catL2 ? getChildren(catL2) : [];
              function dd(label, items, val, setter) {
                return (
                  <div>
                    <label className="block text-sm font-semibold text-dark-navy mb-1">{label}</label>
                    <select
                      value={val}
                      onChange={(e) => setter(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent bg-white"
                    >
                      <option value="">— Select —</option>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>{item.label}</option>
                      ))}
                    </select>
                  </div>
                );
              }
              return (
                <div className="space-y-3">
                  {dd(`Topic under ${filterSection}`, topLevel, catL1, setCatL1)}
                  {catL1 && kids1.length > 0 && dd(`Sub-topic under ${findItem(catL1)?.label || ''}`, kids1, catL2, setCatL2)}
                  {catL2 && kids2.length > 0 && dd(`Sub-topic under ${findItem(catL2)?.label || ''}`, kids2, catL3, setCatL3)}
                </div>
              );
            })()}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-dark-navy mb-1">Course Title *</label>
                <input
                  value={c.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all"
                  placeholder="e.g. Full Stack Web Development"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark-navy mb-1">Slug *</label>
                <input
                  value={c.slug}
                  onChange={(e) => u("slug", slugify(e.target.value))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent font-mono text-sm transition-all"
                  placeholder="full-stack-web-development"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-navy mb-1">Subtitle</label>
              <input
                value={c.subtitle || ""}
                onChange={(e) => u("subtitle", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all"
                placeholder="A short tagline for the course"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-navy mb-1">Description</label>
              <textarea
                value={c.description || ""}
                onChange={(e) => u("description", e.target.value)}
                rows={4}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all"
                placeholder="Detailed course description..."
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-dark-navy mb-1">Duration</label>
                <select
                  value={c.duration}
                  onChange={(e) => u("duration", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent bg-white"
                >
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark-navy mb-1">Mode</label>
                <select
                  value={c.mode}
                  onChange={(e) => u("mode", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent bg-white"
                >
                  {MODES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark-navy mb-1">Status</label>
                <select
                  value={c.status}
                  onChange={(e) => u("status", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Coming Soon">Coming Soon</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <input type="checkbox" id="published" checked={c.is_published} onChange={(e) => u("is_published", e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent" />
              <label htmlFor="published" className="text-sm font-medium text-dark-navy cursor-pointer">Published (visible on site)</label>
            </div>
          </div>
        )}

        {/* Step 1: Media & Content */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-dark-navy flex items-center gap-2"><FiMonitor className="w-5 h-5 text-brand-accent" /> Media</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-dark-navy mb-1">Hero / Banner Image</label>
                <ImageUploader value={c.hero_image_url} onChange={(url) => u("hero_image_url", url)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark-navy mb-1">Video Thumbnail</label>
                <ImageUploader value={c.video_thumbnail_url} onChange={(url) => u("video_thumbnail_url", url)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark-navy mb-1">Course Video (YouTube URL)</label>
              <input
                value={c.video_url || ""}
                onChange={(e) => u("video_url", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent text-sm transition-all"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            <hr className="border-gray-200" />

            <h2 className="text-lg font-semibold text-dark-navy flex items-center gap-2"><FiBookOpen className="w-5 h-5 text-brand-accent" /> Content</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-dark-navy mb-1">CTA Left</label>
                <input value={c.cta_left || ""} onChange={(e) => u("cta_left", e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent text-sm transition-all" placeholder="Enroll Now" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark-navy mb-1">CTA Right</label>
                <input value={c.cta_right || ""} onChange={(e) => u("cta_right", e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent text-sm transition-all" placeholder="Download Brochure" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-navy mb-1">What You'll Learn (one per line)</label>
              <textarea
                value={(c.checklist_items || []).join("\n")}
                onChange={(e) => u("checklist_items", e.target.value.split("\n").filter(Boolean))}
                rows={4}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all"
                placeholder="Live classes&#10;Industry mentors&#10;Placement assistance"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-dark-navy">Course Tabs</h3>
                <Button onClick={() => u("tabs", [...c.tabs, { label: "New Tab", content_type: "overview", content: {} }])} variant="link-add" size="sm">
                  <FiPlus className="w-4 h-4" /> Add Tab
                </Button>
              </div>
              <div className="space-y-3">
                {c.tabs.map((t, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 relative">
                    <button onClick={() => u("tabs", c.tabs.filter((_, j) => j !== i))} className="absolute top-3 right-3 p-1 text-red-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                        <input value={t.label || ""} onChange={(e) => { const n = [...c.tabs]; n[i] = { ...n[i], label: e.target.value }; u("tabs", n); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                        <select value={t.content_type || "overview"} onChange={(e) => { const n = [...c.tabs]; n[i] = { ...n[i], content_type: e.target.value }; u("tabs", n); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent bg-white">
                          <option value="overview">Overview</option>
                          <option value="syllabus">Syllabus</option>
                          <option value="pricing">Pricing</option>
                          <option value="apply_now">Apply Now</option>
                        </select>
                      </div>
                    </div>
                    {(t.content_type === "overview" ||
                      t.content_type === "syllabus") && (
                      <div className="mt-3 space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Heading (centered)</label>
                          <input value={t.content?.heading || ""} onChange={(e) => { const n = [...c.tabs]; n[i] = { ...n[i], content: { ...n[i].content, heading: e.target.value } }; u("tabs", n); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" placeholder="Main heading" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Paragraph</label>
                          <textarea value={t.content?.paragraph || ""} onChange={(e) => { const n = [...c.tabs]; n[i] = { ...n[i], content: { ...n[i].content, paragraph: e.target.value } }; u("tabs", n); }} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" placeholder="Paragraph text" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Sub Heading</label>
                          <input value={t.content?.subheading || ""} onChange={(e) => { const n = [...c.tabs]; n[i] = { ...n[i], content: { ...n[i].content, subheading: e.target.value } }; u("tabs", n); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" placeholder="Sub heading" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium text-gray-600">Q&A Items</label>
                            <button onClick={() => { const n = [...c.tabs]; const qa = [...(n[i].content?.qa || []), { question: "", answers: [""] }]; n[i] = { ...n[i], content: { ...n[i].content, qa } }; u("tabs", n); }} className="text-xs text-brand-accent font-semibold hover:underline">+ Add Question</button>
                          </div>
                          <div className="space-y-3">
                            {(t.content?.qa || []).map((qa, qi) => (
                              <div key={qi} className="border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-semibold text-gray-500">Question {qi + 1}</span>
                                  <button onClick={() => { const n = [...c.tabs]; const qa = n[i].content.qa.filter((_, j) => j !== qi); n[i] = { ...n[i], content: { ...n[i].content, qa } }; u("tabs", n); }} className="text-xs text-red-500 hover:underline">Remove</button>
                                </div>
                                <input value={qa.question} onChange={(e) => { const n = [...c.tabs]; const qa = [...n[i].content.qa]; qa[qi] = { ...qa[qi], question: e.target.value }; n[i] = { ...n[i], content: { ...n[i].content, qa } }; u("tabs", n); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent mb-2" placeholder="Question" />
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-500">Answers (one per line)</span>
                                    <button onClick={() => { const n = [...c.tabs]; const qa = [...n[i].content.qa]; qa[qi] = { ...qa[qi], answers: [...qa[qi].answers, ""] }; n[i] = { ...n[i], content: { ...n[i].content, qa } }; u("tabs", n); }} className="text-xs text-brand-accent hover:underline">+ Add bullet</button>
                                  </div>
                                  {qa.answers.map((ans, ai) => (
                                    <div key={ai} className="flex items-center gap-2 mb-1">
                                      <span className="text-xs text-gray-400">•</span>
                                      <input value={ans} onChange={(e) => { const n = [...c.tabs]; const qa = [...n[i].content.qa]; const an = [...qa[qi].answers]; an[ai] = e.target.value; qa[qi] = { ...qa[qi], answers: an }; n[i] = { ...n[i], content: { ...n[i].content, qa } }; u("tabs", n); }} className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" placeholder="Answer bullet" />
                                      <button onClick={() => { const n = [...c.tabs]; const qa = [...n[i].content.qa]; qa[qi] = { ...qa[qi], answers: qa[qi].answers.filter((_, j) => j !== ai) }; n[i] = { ...n[i], content: { ...n[i].content, qa } }; u("tabs", n); }} className="text-xs text-red-400 hover:text-red-600">×</button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Curriculum & Pricing */}
        {step === 2 && (
          <div className="space-y-8">
            {/* Curriculum */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-dark-navy flex items-center gap-2"><FiLayers className="w-5 h-5 text-brand-accent" /> Curriculum / Modules</h2>
                <Button onClick={addModule} variant="link-add" size="sm"><FiPlus className="w-4 h-4" /> Add Module</Button>
              </div>
              <div className="space-y-3">
                {c.curriculum.map((mod, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Module {i + 1}</span>
                      <button onClick={() => removeModule(i)} className="p-1 text-red-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      value={mod.title}
                      onChange={(e) => updateModule(i, "title", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-accent mb-3"
                      placeholder="Module title (e.g. Introduction to HTML)"
                    />
                    <div className="space-y-2">
                      {mod.topics?.map((topic, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-5 text-right">{j + 1}.</span>
                          <input
                            value={topic}
                            onChange={(e) => updateTopic(i, j, e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                            placeholder="Topic"
                          />
                          <button onClick={() => removeTopic(i, j)} className="p-1 text-red-300 hover:text-red-500 transition-colors">
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <Button onClick={() => addTopic(i)} variant="link-add" size="xs"><FiPlus className="w-3 h-3" /> Add Topic</Button>
                    </div>
                  </div>
                ))}
                {c.curriculum.length === 0 && (
                  <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <FiLayers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No modules yet. Click "Add Module" to build your curriculum.</p>
                  </div>
                )}
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Highlights */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-dark-navy">Key Highlights</h3>
                <Button onClick={() => u("highlights", [...c.highlights, { icon: "", label: "" }])} variant="link-add" size="sm"><FiPlus className="w-4 h-4" /> Add</Button>
              </div>
              <div className="space-y-3">
                {c.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-3 border border-gray-200 rounded-xl p-3">
                    <input value={h.icon || ""} onChange={(e) => { const n = [...c.highlights]; n[i] = { ...n[i], icon: e.target.value }; u("highlights", n); }} className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" placeholder="Icon (FiClock)" />
                    <input value={h.label || ""} onChange={(e) => { const n = [...c.highlights]; n[i] = { ...n[i], label: e.target.value }; u("highlights", n); }} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" placeholder="Label" />
                    <button onClick={() => u("highlights", c.highlights.filter((_, j) => j !== i))} className="p-1 text-red-400 hover:text-red-600"><FiTrash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-dark-navy">Pricing Plans</h3>
                <Button onClick={() => u("course_fees", [...c.course_fees, { plan_name: "", price: null, currency: "INR", cta_label: "" }])} variant="link-add" size="sm"><FiPlus className="w-4 h-4" /> Add</Button>
              </div>
              <div className="space-y-3">
                {c.course_fees.map((f, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 relative">
                    <button onClick={() => u("course_fees", c.course_fees.filter((_, j) => j !== i))} className="absolute top-3 right-3 p-1 text-red-400 hover:text-red-600"><FiTrash2 className="w-4 h-4" /></button>
                    <div className="grid sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Plan</label>
                        <input value={f.plan_name || ""} onChange={(e) => { const n = [...c.course_fees]; n[i] = { ...n[i], plan_name: e.target.value }; u("course_fees", n); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" placeholder="Basic" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Price</label>
                        <input type="number" value={f.price ?? ""} onChange={(e) => { const n = [...c.course_fees]; n[i] = { ...n[i], price: e.target.value ? Number(e.target.value) : null }; u("course_fees", n); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" placeholder="999" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
                        <input value={f.currency || "INR"} onChange={(e) => { const n = [...c.course_fees]; n[i] = { ...n[i], currency: e.target.value }; u("course_fees", n); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">CTA</label>
                        <input value={f.cta_label || ""} onChange={(e) => { const n = [...c.course_fees]; n[i] = { ...n[i], cta_label: e.target.value }; u("course_fees", n); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" placeholder="Enroll Now" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-dark-navy">Projects</h3>
                <Button onClick={() => u("projects", [...c.projects, { title: "", description: "" }])} variant="link-add" size="sm"><FiPlus className="w-4 h-4" /> Add</Button>
              </div>
              <div className="space-y-3">
                {c.projects.map((p, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 relative">
                    <button onClick={() => u("projects", c.projects.filter((_, j) => j !== i))} className="absolute top-3 right-3 p-1 text-red-400 hover:text-red-600"><FiTrash2 className="w-4 h-4" /></button>
                    <input value={p.title || ""} onChange={(e) => { const n = [...c.projects]; n[i] = { ...n[i], title: e.target.value }; u("projects", n); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent mb-2" placeholder="Project title" />
                    <textarea value={p.description || ""} onChange={(e) => { const n = [...c.projects]; n[i] = { ...n[i], description: e.target.value }; u("projects", n); }} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" placeholder="Description..." />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: FAQs & Tags */}
        {step === 3 && (
          <div className="space-y-8">
            {/* FAQs */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-dark-navy">General FAQs</h3>
                <Button onClick={() => u("faqs", [...c.faqs, { question: "", answer: "" }])} variant="link-add" size="sm"><FiPlus className="w-4 h-4" /> Add FAQ</Button>
              </div>
              <div className="space-y-3">
                {c.faqs.map((f, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 relative">
                    <button onClick={() => u("faqs", c.faqs.filter((_, j) => j !== i))} className="absolute top-3 right-3 p-1 text-red-400 hover:text-red-600"><FiTrash2 className="w-4 h-4" /></button>
                    <input value={f.question || ""} onChange={(e) => { const n = [...c.faqs]; n[i] = { ...n[i], question: e.target.value }; u("faqs", n); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent mb-2" placeholder="Question" />
                    <textarea value={f.answer || ""} onChange={(e) => { const n = [...c.faqs]; n[i] = { ...n[i], answer: e.target.value }; u("faqs", n); }} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" placeholder="Answer..." />
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-sm font-semibold text-dark-navy mb-3">Tags *</h3>
              {courseTags.length === 0 && (
                <p className="text-xs text-red-500 mb-2">Select at least one tag to enable saving</p>
              )}
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const sel = courseTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => setCourseTags(sel ? courseTags.filter((t) => t !== tag.id) : [...courseTags, tag.id])}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                        sel ? "bg-brand-accent text-white border-brand-accent shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-brand-accent hover:text-brand-accent"
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
                {allTags.length === 0 && <p className="text-sm text-gray-400">No tags yet. Create some in the Tags page.</p>}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  placeholder="New tag name..."
                />
                <Button onClick={handleCreateTag} disabled={creatingTag || !newTagName.trim()} variant="accent" size="sm">
                  {creatingTag ? "..." : "Create"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <Button onClick={() => setStep((s) => s - 1)} disabled={step === 0} variant="ghost" size="md">
          <FiChevronLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">Step {step + 1} of {STEPS.length}</span>
          <div className="hidden sm:flex gap-1">
            {STEPS.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i <= step ? 'bg-brand-accent' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()} variant="accent" size="md">
            Next <FiChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleSave} disabled={saving} variant="accent" size="md" className="min-w-[120px]">
            {saving ? "Saving..." : "Save Course"}
          </Button>
        )}
      </div>
    </div>
  );
}
