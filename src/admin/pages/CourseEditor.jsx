import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import ImageUploader from "../components/ImageUploader";
import Button from "../../components/ui/Button";
import { FiPlus, FiTrash2, FiMove, FiArrowLeft } from "react-icons/fi";
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
          className="border border-gray-200 rounded-lg p-4 space-y-3 relative"
        >
          <div className="flex items-center gap-2 absolute top-3 right-3">
            <FiMove className="w-4 h-4 text-gray-300 cursor-move" />
            <button
              onClick={() => removeItem(i)}
              className="text-red-400 hover:text-red-600"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {f.label}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  value={item[f.key] || ""}
                  onChange={(e) => updateItem(i, f.key, e.target.value)}
                  rows={f.rows || 3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                />
              ) : f.type === "number" ? (
                <input
                  type="number"
                  value={item[f.key] ?? ""}
                  onChange={(e) =>
                    updateItem(i, f.key, e.target.valueAsNumber ?? null)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                />
              ) : (
                <input
                  value={item[f.key] || ""}
                  onChange={(e) => updateItem(i, f.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                />
              )}
            </div>
          ))}
        </div>
      ))}
      <Button onClick={addItem} variant="link-add" size="sm">
        <FiPlus className="w-4 h-4" /> Add {labelKey}
      </Button>
    </div>
  );
}

const ICON_OPTIONS = [
  "FiClock",
  "FiVideo",
  "FiCode",
  "FiAward",
  "FiCalendar",
  "FiRefreshCw",
  "FiMessageCircle",
];

export default function CourseEditor() {
  const { user: currentUser } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  // Redirect or show error if user is not an editor or admin
  if (currentUser?.role !== "admin" && currentUser?.role !== "editor") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <h1 className="text-2xl font-bold text-dark-navy mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  const isNew = id === "new";
  const [tab, setTab] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [allTags, setAllTags] = useState([]);
  const [courseTags, setCourseTags] = useState([]);
  const [navItems, setNavItems] = useState([]);
  const [course, setCourse] = useState({
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    hero_image_url: "",
    video_thumbnail_url: "",
    video_url: "",
    nav_item_id: "",
    is_published: true,
    checklist_items: [],
    highlights: [],
    overview_faqs: [],
    course_fees: [],
    projects: [],
    certifications: [],
    faqs: [],
    tabs: [],
  });

  useEffect(() => {
    supabase
      .from("tags")
      .select("*")
      .order("name")
      .then(({ data }) => setAllTags(data || []));
    supabase
      .from("nav_items")
      .select("*")
      .order("sort_order")
      .then(({ data }) => setNavItems(data || []));
    if (isNew) return;
    supabase
      .from("courses")
      .select(
        `*, highlights(*), overview_faqs(*), course_fees(*), projects(*), certifications(*)`,
      )
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (data && !error) setCourse((p) => ({ ...p, ...data }));
      });
    supabase
      .from("course_tabs")
      .select("*")
      .eq("course_id", id)
      .order("sort_order")
      .then(({ data }) => {
        if (data) update("tabs", data);
      });
    supabase
      .from("faqs")
      .select("*")
      .eq("course_id", id)
      .order("sort_order")
      .then(({ data }) => {
        if (data) update("faqs", data);
      });
    supabase
      .from("course_tags")
      .select("tag_id")
      .eq("course_id", id)
      .then(({ data }) => setCourseTags(data?.map((t) => t.tag_id) || []));
  }, [id]);

  function update(field, value) {
    setCourse((prev) => ({ ...prev, [field]: value }));
  }

  async function saveRelated(table, records) {
    await supabase.from(table).delete().eq("course_id", id);
    if (records.length > 0) {
      await supabase.from(table).insert(
        records.map((r, i) => ({
          ...r,
          course_id: id,
          sort_order: i,
          id: undefined,
        })),
      );
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        title: course.title,
        slug: course.slug,
        subtitle: course.subtitle,
        description: course.description,
        hero_image_url: course.hero_image_url,
        video_thumbnail_url: course.video_thumbnail_url,
        video_url: course.video_url,
        nav_item_id: course.nav_item_id || null,
        is_published: course.is_published,
        checklist_items: course.checklist_items,
      };
      if (isNew) {
        const { data, error } = await supabase
          .from("courses")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        navigate(`/admin/courses/${data.id}`, { replace: true });
      } else {
        const { error } = await supabase
          .from("courses")
          .update(payload)
          .eq("id", id);
        if (error) throw error;
        await saveRelated("highlights", course.highlights);
        await saveRelated("overview_faqs", course.overview_faqs);
        await saveRelated("course_fees", course.course_fees);
        await saveRelated("projects", course.projects);
        await supabase.from("certifications").delete().eq("course_id", id);
        if (course.certifications.length > 0) {
          await supabase.from("certifications").insert(
            course.certifications.map((c) => ({
              ...c,
              course_id: id,
              id: undefined,
            })),
          );
        }
        await supabase.from("faqs").delete().eq("course_id", id);
        if (course.faqs.length > 0) {
          await supabase.from("faqs").insert(
            course.faqs.map((f, i) => ({
              ...f,
              course_id: id,
              sort_order: i,
              id: undefined,
            })),
          );
        }
        await supabase.from("course_tags").delete().eq("course_id", id);
        if (courseTags.length > 0) {
          await supabase
            .from("course_tags")
            .insert(
              courseTags.map((tagId) => ({ course_id: id, tag_id: tagId })),
            );
        }
      }
      setMessage("Course saved successfully.");
    } catch (err) {
      setMessage(err.message);
    }
    setSaving(false);
  }

  const editorTabs = [
    "basic",
    "hero",
    "tabs",
    "highlights",
    "overview-faqs",
    "fees",
    "projects",
    "certification",
    "faqs",
    "tags",
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/courses"
            className="p-2 text-gray-400 hover:text-dark-navy rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-dark-navy">
            {isNew ? "New Course" : `Edit: ${course.title || "Untitled"}`}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate("/admin/courses")}
            variant="ghost"
            size="md"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="accent"
            size="md"
          >
            {saving ? "Saving..." : "Save Course"}
          </Button>
        </div>
      </div>

      {message && (
        <p
          className={`mb-4 text-sm ${message.includes("success") ? "text-green-600" : "text-red-600"}`}
        >
          {message}
        </p>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        {editorTabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t ? "bg-brand-purple text-white" : "bg-white text-text-gray hover:bg-gray-100"}`}
          >
            {t === "overview-faqs"
              ? "Overview FAQs"
              : t.charAt(0).toUpperCase() + t.slice(1).replace("-", " ")}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {tab === "basic" && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                value={course.title}
                onChange={(e) => update("title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <input
                value={course.slug}
                onChange={(e) => update("slug", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtitle
              </label>
              <input
                value={course.subtitle || ""}
                onChange={(e) => update("subtitle", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={course.description || ""}
                onChange={(e) => update("description", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category (Nav Item)
              </label>
              <select
                value={course.nav_item_id || ""}
                onChange={(e) => update("nav_item_id", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent bg-white"
              >
                <option value="">No category</option>
                {navItems
                  .filter((n) => !n.path || n.parent_id)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.parent_label ? `${item.parent_label} › ` : ""}
                      {item.label}
                    </option>
                  ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={course.is_published}
                onChange={(e) => update("is_published", e.target.checked)}
                className="rounded"
              />
              Published
            </label>
          </div>
        )}

        {tab === "hero" && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hero Image
              </label>
              <ImageUploader
                bucket="hero-images"
                value={course.hero_image_url}
                onChange={(url) => update("hero_image_url", url)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video Thumbnail
              </label>
              <ImageUploader
                bucket="hero-images"
                value={course.video_thumbnail_url}
                onChange={(url) => update("video_thumbnail_url", url)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Introduction Video URL (YouTube)
              </label>
              <input
                value={course.video_url || ""}
                onChange={(e) => update("video_url", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CTA Left Button
              </label>
              <input
                value={course.cta_left || ""}
                onChange={(e) => update("cta_left", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CTA Right Button
              </label>
              <input
                value={course.cta_right || ""}
                onChange={(e) => update("cta_right", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Checklist Items (one per line)
              </label>
              <textarea
                value={(course.checklist_items || []).join("\n")}
                onChange={(e) =>
                  update(
                    "checklist_items",
                    e.target.value.split("\n").filter(Boolean),
                  )
                }
                rows={7}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
          </div>
        )}

        {tab === "tabs" && !isNew && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="font-semibold text-dark-navy mb-3">Course Tabs</h3>
            <p className="text-sm text-text-gray mb-4">
              Content types: overview, syllabus, pricing, apply_now
            </p>
            {course.tabs.map((t, i) => (
              <div
                key={t.id || i}
                className="border border-gray-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Label
                    </label>
                    <input
                      value={t.label}
                      onChange={(e) => {
                        const n = [...course.tabs];
                        n[i] = { ...n[i], label: e.target.value };
                        update("tabs", n);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Content Type
                    </label>
                    <select
                      value={t.content_type}
                      onChange={(e) => {
                        const n = [...course.tabs];
                        n[i] = { ...n[i], content_type: e.target.value };
                        update("tabs", n);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    >
                      <option value="overview">Overview</option>
                      <option value="syllabus">Syllabus</option>
                      <option value="pricing">Pricing</option>
                      <option value="apply_now">Apply Now</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={async () => {
                        await supabase
                          .from("course_tabs")
                          .delete()
                          .eq("id", t.id);
                        update(
                          "tabs",
                          course.tabs.filter((_, j) => j !== i),
                        );
                      }}
                      className="text-red-500 hover:text-red-700 text-sm px-3 py-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {(t.content_type === "overview" ||
                  t.content_type === "syllabus") && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Content Text
                    </label>
                    <textarea
                      value={t.content?.text || ""}
                      onChange={(e) => {
                        const n = [...course.tabs];
                        n[i] = {
                          ...n[i],
                          content: { ...n[i].content, text: e.target.value },
                        };
                        update("tabs", n);
                      }}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>
                )}
                {t.content_type === "overview" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      List Items (one per line)
                    </label>
                    <textarea
                      value={(t.content?.list_items || []).join("\n")}
                      onChange={(e) => {
                        const n = [...course.tabs];
                        n[i] = {
                          ...n[i],
                          content: {
                            ...n[i].content,
                            list_items: e.target.value
                              .split("\n")
                              .filter(Boolean),
                          },
                        };
                        update("tabs", n);
                      }}
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={async () => {
                const { data } = await supabase
                  .from("course_tabs")
                  .insert({
                    course_id: id,
                    label: "New Tab",
                    content_type: "overview",
                    content: {},
                    sort_order: course.tabs.length,
                  })
                  .select()
                  .single();
                if (data) update("tabs", [...course.tabs, data]);
              }}
              className="bg-brand-accent text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-brand-blue transition-colors"
            >
              Add Tab
            </button>
          </div>
        )}

        {tab === "highlights" && !isNew && (
          <div className="max-w-2xl">
            <h3 className="font-semibold text-dark-navy mb-4">
              Key Highlights
            </h3>
            <div className="space-y-4">
              {course.highlights.map((h, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg p-4 space-y-3 relative"
                >
                  <button
                    onClick={() =>
                      update(
                        "highlights",
                        course.highlights.filter((_, j) => j !== i),
                      )
                    }
                    className="absolute top-3 right-3 text-red-400 hover:text-red-600"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Icon
                    </label>
                    <select
                      value={h.icon || ""}
                      onChange={(e) => {
                        const n = [...course.highlights];
                        n[i] = { ...n[i], icon: e.target.value };
                        update("highlights", n);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    >
                      <option value="">Select icon</option>
                      {ICON_OPTIONS.map((ico) => (
                        <option key={ico} value={ico}>
                          {ico.replace("Fi", "")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Label
                    </label>
                    <input
                      value={h.label || ""}
                      onChange={(e) => {
                        const n = [...course.highlights];
                        n[i] = { ...n[i], label: e.target.value };
                        update("highlights", n);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>
                </div>
              ))}
              <Button
                onClick={() =>
                  update("highlights", [
                    ...course.highlights,
                    { icon: "", label: "" },
                  ])
                }
                variant="link-add"
                size="sm"
              >
                <FiPlus className="w-4 h-4" /> Add Highlight
              </Button>
            </div>
          </div>
        )}

        {tab === "overview-faqs" && !isNew && (
          <div className="max-w-2xl">
            <h3 className="font-semibold text-dark-navy mb-4">
              Overview FAQs (Accordion)
            </h3>
            <div className="space-y-4">
              {course.overview_faqs.map((faq, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg p-4 space-y-3 relative"
                >
                  <button
                    onClick={() =>
                      update(
                        "overview_faqs",
                        course.overview_faqs.filter((_, j) => j !== i),
                      )
                    }
                    className="absolute top-3 right-3 text-red-400 hover:text-red-600"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Question
                    </label>
                    <input
                      value={faq.question || ""}
                      onChange={(e) => {
                        const n = [...course.overview_faqs];
                        n[i] = { ...n[i], question: e.target.value };
                        update("overview_faqs", n);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Answer
                    </label>
                    <textarea
                      value={faq.answer || ""}
                      onChange={(e) => {
                        const n = [...course.overview_faqs];
                        n[i] = { ...n[i], answer: e.target.value };
                        update("overview_faqs", n);
                      }}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      List Items (one per line)
                    </label>
                    <textarea
                      value={(faq.list_items || []).join("\n")}
                      onChange={(e) => {
                        const n = [...course.overview_faqs];
                        n[i] = {
                          ...n[i],
                          list_items: e.target.value
                            .split("\n")
                            .filter(Boolean),
                        };
                        update("overview_faqs", n);
                      }}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>
                </div>
              ))}
              <Button
                onClick={() =>
                  update("overview_faqs", [
                    ...course.overview_faqs,
                    { question: "", answer: "", list_items: [] },
                  ])
                }
                variant="link-add"
                size="sm"
              >
                <FiPlus className="w-4 h-4" /> Add Overview FAQ
              </Button>
            </div>
          </div>
        )}

        {tab === "fees" && !isNew && (
          <div className="max-w-2xl">
            <h3 className="font-semibold text-dark-navy mb-4">
              Course Fees / Pricing Plans
            </h3>
            <div className="space-y-4">
              {course.course_fees.map((plan, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg p-4 space-y-3 relative"
                >
                  <button
                    onClick={() =>
                      update(
                        "course_fees",
                        course.course_fees.filter((_, j) => j !== i),
                      )
                    }
                    className="absolute top-3 right-3 text-red-400 hover:text-red-600"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Plan Name
                      </label>
                      <input
                        value={plan.plan_name || ""}
                        onChange={(e) => {
                          const n = [...course.course_fees];
                          n[i] = { ...n[i], plan_name: e.target.value };
                          update("course_fees", n);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        value={plan.price ?? ""}
                        onChange={(e) => {
                          const n = [...course.course_fees];
                          n[i] = { ...n[i], price: e.target.valueAsNumber };
                          update("course_fees", n);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Currency
                      </label>
                      <select
                        value={plan.currency || "INR"}
                        onChange={(e) => {
                          const n = [...course.course_fees];
                          n[i] = { ...n[i], currency: e.target.value };
                          update("course_fees", n);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                      >
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        CTA Label
                      </label>
                      <input
                        value={plan.cta_label || ""}
                        onChange={(e) => {
                          const n = [...course.course_fees];
                          n[i] = { ...n[i], cta_label: e.target.value };
                          update("course_fees", n);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Features (one per line)
                    </label>
                    <textarea
                      value={(plan.features || []).join("\n")}
                      onChange={(e) => {
                        const n = [...course.course_fees];
                        n[i] = {
                          ...n[i],
                          features: e.target.value.split("\n").filter(Boolean),
                        };
                        update("course_fees", n);
                      }}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>
                </div>
              ))}
              <Button
                onClick={() =>
                  update("course_fees", [
                    ...course.course_fees,
                    {
                      plan_name: "",
                      price: null,
                      currency: "INR",
                      cta_label: "",
                      features: [],
                    },
                  ])
                }
                variant="link-add"
                size="sm"
              >
                <FiPlus className="w-4 h-4" /> Add Pricing Plan
              </Button>
            </div>
          </div>
        )}

        {tab === "projects" && !isNew && (
          <div className="max-w-2xl">
            <h3 className="font-semibold text-dark-navy mb-4">Projects</h3>
            <div className="space-y-4">
              {course.projects.map((p, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg p-4 space-y-3 relative"
                >
                  <button
                    onClick={() =>
                      update(
                        "projects",
                        course.projects.filter((_, j) => j !== i),
                      )
                    }
                    className="absolute top-3 right-3 text-red-400 hover:text-red-600"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Title
                    </label>
                    <input
                      value={p.title || ""}
                      onChange={(e) => {
                        const n = [...course.projects];
                        n[i] = { ...n[i], title: e.target.value };
                        update("projects", n);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Description
                    </label>
                    <textarea
                      value={p.description || ""}
                      onChange={(e) => {
                        const n = [...course.projects];
                        n[i] = { ...n[i], description: e.target.value };
                        update("projects", n);
                      }}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>
                </div>
              ))}
              <Button
                onClick={() =>
                  update("projects", [
                    ...course.projects,
                    { title: "", description: "" },
                  ])
                }
                variant="link-add"
                size="sm"
              >
                <FiPlus className="w-4 h-4" /> Add Project
              </Button>
            </div>
          </div>
        )}

        {tab === "certification" && !isNew && (
          <div className="max-w-2xl space-y-4">
            <h3 className="font-semibold text-dark-navy mb-4">Certification</h3>
            {(course.certifications.length === 0
              ? [
                  {
                    description: "",
                    image_url: "",
                    certificate_image_url: "",
                    recognized_companies: [],
                  },
                ]
              : course.certifications
            ).map((cert, i) => (
              <div key={i} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={cert.description || ""}
                    onChange={(e) => {
                      const n = [
                        ...(course.certifications.length
                          ? course.certifications
                          : [{ ...cert }]),
                      ];
                      n[i] = { ...n[i], description: e.target.value };
                      update("certifications", n);
                    }}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Classroom Image
                  </label>
                  <ImageUploader
                    bucket="certificates"
                    value={cert.image_url || ""}
                    onChange={(url) => {
                      const n = [
                        ...(course.certifications.length
                          ? course.certifications
                          : [{ ...cert }]),
                      ];
                      n[i] = { ...n[i], image_url: url };
                      update("certifications", n);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certificate Image
                  </label>
                  <ImageUploader
                    bucket="certificates"
                    value={cert.certificate_image_url || ""}
                    onChange={(url) => {
                      const n = [
                        ...(course.certifications.length
                          ? course.certifications
                          : [{ ...cert }]),
                      ];
                      n[i] = { ...n[i], certificate_image_url: url };
                      update("certifications", n);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recognized Companies (one per line)
                  </label>
                  <textarea
                    value={(cert.recognized_companies || []).join("\n")}
                    onChange={(e) => {
                      const n = [
                        ...(course.certifications.length
                          ? course.certifications
                          : [{ ...cert }]),
                      ];
                      n[i] = {
                        ...n[i],
                        recognized_companies: e.target.value
                          .split("\n")
                          .filter(Boolean),
                      };
                      update("certifications", n);
                    }}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "faqs" && !isNew && (
          <div className="max-w-2xl">
            <h3 className="font-semibold text-dark-navy mb-4">General FAQs</h3>
            <div className="space-y-4">
              {course.faqs.map((faq, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg p-4 space-y-3 relative"
                >
                  <button
                    onClick={() =>
                      update(
                        "faqs",
                        course.faqs.filter((_, j) => j !== i),
                      )
                    }
                    className="absolute top-3 right-3 text-red-400 hover:text-red-600"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Question
                    </label>
                    <input
                      value={faq.question || ""}
                      onChange={(e) => {
                        const n = [...course.faqs];
                        n[i] = { ...n[i], question: e.target.value };
                        update("faqs", n);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Answer
                    </label>
                    <textarea
                      value={faq.answer || ""}
                      onChange={(e) => {
                        const n = [...course.faqs];
                        n[i] = { ...n[i], answer: e.target.value };
                        update("faqs", n);
                      }}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>
                </div>
              ))}
              <Button
                onClick={() =>
                  update("faqs", [...course.faqs, { question: "", answer: "" }])
                }
                variant="link-add"
                size="sm"
              >
                <FiPlus className="w-4 h-4" /> Add FAQ
              </Button>
            </div>
          </div>
        )}

        {tab === "tags" && !isNew && (
          <div className="max-w-2xl">
            <h3 className="font-semibold text-dark-navy mb-4">Tags</h3>
            <p className="text-sm text-text-gray mb-4">
              Select tags that apply to this course.
            </p>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const selected = courseTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() =>
                      setCourseTags(
                        selected
                          ? courseTags.filter((t) => t !== tag.id)
                          : [...courseTags, tag.id],
                      )
                    }
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${selected ? "bg-brand-accent text-white border-brand-accent" : "bg-white text-gray-600 border-gray-200 hover:border-brand-accent"}`}
                  >
                    {tag.name}
                  </button>
                );
              })}
              {allTags.length === 0 && (
                <p className="text-sm text-text-gray">
                  No tags created yet. Go to Tags page to add some.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
