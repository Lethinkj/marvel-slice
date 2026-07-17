import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdminButton from '../components/AdminButton';
import { FiDownload, FiLoader, FiCheck, FiSearch, FiX } from 'react-icons/fi';

const categories = [
  'Software Learning',
  'Competitive Exam',
  'Services',
  'Training',
  'Career',
];

export default function CourseReports() {
  const [courses, setCourses] = useState([]);
  const [navItems, setNavItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const [coursesRes, navRes] = await Promise.all([
        supabase
          .from('courses')
          .select('*, highlights(*), overview_faqs(*), course_fees(*), projects(*), certifications(*), course_tabs(*)')
          .order('id', { ascending: false }),
        supabase.from('nav_items').select('id, label, parent_label').eq('is_active', true).order('sort_order'),
      ]);
      setCourses(coursesRes.data || []);
      setNavItems(navRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  function getCourseCategory(course) {
    if (!course.nav_item_id) return null;
    const item = navItems.find((n) => n.id === course.nav_item_id);
    return item?.parent_label || null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col items-center justify-center text-center mb-8 pt-12">
        <h1 className="text-2xl font-bold text-neutral-900">Course Reports</h1>
        <p className="text-sm text-neutral-500 mt-1 mb-5">Generate combined brochure PDFs</p>
        <AdminButton onClick={() => setOpen(true)} variant="primary" size="md">
          <FiDownload className="w-4 h-4" />
          Download
        </AdminButton>
      </div>

      {open && (
        <GenerateDialog
          courses={courses}
          navItems={navItems}
          getCourseCategory={getCourseCategory}
          onClose={() => setOpen(false)}
        />
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

function GenerateDialog({ courses, navItems, getCourseCategory, onClose }) {
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedCourses, setSelectedCourses] = useState(new Set());
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [generating, setGenerating] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const coursesByCategory = useMemo(() => {
    const map = {};
    for (const c of courses) {
      const cat = getCourseCategory(c) || 'Uncategorized';
      if (!map[cat]) map[cat] = [];
      map[cat].push(c);
    }
    return map;
  }, [courses, getCourseCategory]);

  function toggleCategory(cat) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
        return next;
      }
      next.add(cat);
      return next;
    });
    setSelectedCourses(new Set());
  }

  function toggleCourse(id) {
    setSelectedCourses((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSelectedCategories(new Set());
  }

  function selectAll() {
    if (selectedCourses.size === courses.length) {
      setSelectedCourses(new Set());
    } else {
      setSelectedCourses(new Set(courses.map((c) => c.id)));
    }
    setSelectedCategories(new Set());
  }

  const searchedCourses = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return courses.filter((c) => c.title.toLowerCase().includes(q));
  }, [search, courses]);

  const hasSelection = selectedCategories.size > 0 || selectedCourses.size > 0;

  function getSelectedCoursesList() {
    if (selectedCategories.size > 0) {
      return courses.filter((c) => selectedCategories.has(getCourseCategory(c)));
    }
    if (selectedCourses.size > 0) {
      return courses.filter((c) => selectedCourses.has(c.id));
    }
    return [];
  }

  async function generate() {
    const target = getSelectedCoursesList();
    if (target.length === 0) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 100));

    const { default: html2canvas } = await import('html2canvas');
    const { default: jsPDF } = await import('jspdf');

    const courseBlocks = target.map((course, ci) => {
      const tabsHTML = (course.course_tabs || []).map((tab) => `
        <div style="margin-bottom:12px;">
          <h3 style="font-size:14px;font-weight:700;color:#1e293b;margin:0 0 4px;">${tab.label || tab.tab_label || ''}</h3>
          <p style="font-size:12px;color:#475569;margin:0;line-height:1.6;">${(tab.content || '').replace(/\n/g, '<br/>')}</p>
        </div>
      `).join('');

      const highlightsHTML = (course.highlights || []).map((h) => `
        <span style="display:inline-block;background:#eff6ff;color:#2563eb;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;margin:2px;">${h.label || ''}</span>
      `).join('');

      const faqsHTML = (course.overview_faqs || []).map((faq, i) => `
        <div style="margin-bottom:8px;">
          <p style="font-size:12px;font-weight:700;color:#1e293b;margin:0 0 2px;">${i + 1}. ${faq.question || ''}</p>
          <p style="font-size:11px;color:#475569;margin:0;line-height:1.5;">${(faq.answer || '').replace(/\n/g, '<br/>')}</p>
        </div>
      `).join('');

      const feesHTML = (course.course_fees || []).map((plan) => `
        <div style="border:1px solid #e2e8f0;border-radius:8px;padding:10px;margin-bottom:6px;display:inline-block;width:170px;margin-right:6px;vertical-align:top;">
          <p style="font-size:11px;font-weight:700;color:#1e293b;margin:0 0 3px;">${plan.plan_name || ''}</p>
          <p style="font-size:16px;font-weight:800;color:#2563eb;margin:0;">₹${plan.price || ''}</p>
          <p style="font-size:10px;color:#64748b;margin:3px 0 0;">${plan.duration || ''}</p>
        </div>
      `).join('');

      const projectsHTML = (course.projects || []).map((p) => `
        <div style="margin-bottom:6px;">
          <p style="font-size:12px;font-weight:600;color:#1e293b;margin:0 0 2px;">${p.title || p.name || ''}</p>
          <p style="font-size:11px;color:#475569;margin:0;line-height:1.5;">${(p.description || '').replace(/\n/g, '<br/>')}</p>
        </div>
      `).join('');

      const certsHTML = (course.certifications || []).map((c) => `
        <div style="margin-bottom:4px;">
          <p style="font-size:11px;font-weight:600;color:#1e293b;margin:0;">${c.title || c.name || ''}</p>
          ${c.description ? `<p style="font-size:10px;color:#475569;margin:2px 0 0;">${c.description}</p>` : ''}
        </div>
      `).join('');

      const checklist = (course.checklist_items || []).map((item) => {
        const text = typeof item === 'string' ? item : (item.text || item.label || '');
        return `<li style="font-size:11px;color:#475569;margin-bottom:3px;">${text}</li>`;
      }).join('');

      return `
        <div style="${ci > 0 ? 'page-break-before:always;' : ''}padding:20px 0;">
          <div style="text-align:center;padding-bottom:14px;border-bottom:2px solid #2563eb;margin-bottom:18px;">
            <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 4px;">${course.title || ''}</h1>
            ${course.subtitle ? `<p style="font-size:13px;color:#475569;margin:0;">${course.subtitle}</p>` : ''}
          </div>
          ${course.description ? `
            <div style="margin-bottom:18px;">
              <h2 style="font-size:15px;font-weight:700;color:#0f172a;margin:0 0 6px;padding-bottom:3px;border-bottom:1px solid #e2e8f0;">About the Course</h2>
              <p style="font-size:12px;color:#475569;margin:0;line-height:1.6;">${course.description.replace(/\n/g, '<br/>')}</p>
            </div>
          ` : ''}
          ${checklist ? `
            <div style="margin-bottom:18px;">
              <h2 style="font-size:15px;font-weight:700;color:#0f172a;margin:0 0 6px;padding-bottom:3px;border-bottom:1px solid #e2e8f0;">Key Highlights</h2>
              <ul style="margin:0;padding-left:18px;">${checklist}</ul>
            </div>
          ` : ''}
          ${highlightsHTML ? `
            <div style="margin-bottom:18px;">
              <h2 style="font-size:15px;font-weight:700;color:#0f172a;margin:0 0 6px;padding-bottom:3px;border-bottom:1px solid #e2e8f0;">Highlights</h2>
              <div>${highlightsHTML}</div>
            </div>
          ` : ''}
          ${tabsHTML ? `
            <div style="margin-bottom:18px;">
              <h2 style="font-size:15px;font-weight:700;color:#0f172a;margin:0 0 8px;padding-bottom:3px;border-bottom:1px solid #e2e8f0;">Course Content</h2>
              ${tabsHTML}
            </div>
          ` : ''}
          ${projectsHTML ? `
            <div style="margin-bottom:18px;">
              <h2 style="font-size:15px;font-weight:700;color:#0f172a;margin:0 0 6px;padding-bottom:3px;border-bottom:1px solid #e2e8f0;">Projects</h2>
              ${projectsHTML}
            </div>
          ` : ''}
          ${feesHTML ? `
            <div style="margin-bottom:18px;">
              <h2 style="font-size:15px;font-weight:700;color:#0f172a;margin:0 0 8px;padding-bottom:3px;border-bottom:1px solid #e2e8f0;">Pricing Plans</h2>
              <div>${feesHTML}</div>
            </div>
          ` : ''}
          ${certsHTML ? `
            <div style="margin-bottom:18px;">
              <h2 style="font-size:15px;font-weight:700;color:#0f172a;margin:0 0 6px;padding-bottom:3px;border-bottom:1px solid #e2e8f0;">Certifications</h2>
              ${certsHTML}
            </div>
          ` : ''}
          ${faqsHTML ? `
            <div style="margin-bottom:18px;">
              <h2 style="font-size:15px;font-weight:700;color:#0f172a;margin:0 0 6px;padding-bottom:3px;border-bottom:1px solid #e2e8f0;">FAQs</h2>
              ${faqsHTML}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    const html = `
      <div style="max-width:720px;margin:0 auto;padding:20px 0;">
        <div style="text-align:center;padding:30px 20px;margin-bottom:20px;background:linear-gradient(135deg,#1e40af,#2563eb);border-radius:12px;color:#fff;">
          <h1 style="font-size:32px;font-weight:800;margin:0 0 6px;">Course Brochure</h1>
          <p style="font-size:14px;margin:0;opacity:0.9;">${target.length} course${target.length > 1 ? 's' : ''} · Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        ${courseBlocks}
        <div style="text-align:center;padding-top:16px;border-top:1px solid #e2e8f0;margin-top:16px;">
          <p style="font-size:10px;color:#94a3b8;margin:0;">Marvel Slice · Admin Portal</p>
        </div>
      </div>
    `;

    const el = document.createElement('div');
    el.innerHTML = html;
    el.style.position = 'fixed';
    el.style.left = '-9999px';
    el.style.top = '0';
    el.style.width = '800px';
    el.style.background = '#fff';
    el.style.fontFamily = 'Roboto, Montserrat, system-ui, sans-serif';
    el.style.color = '#111';
    document.body.appendChild(el);

    const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false, width: 800 });
    document.body.removeChild(el);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfW = 210;
    const pdfH = 297;
    const imgW = pdfW - 20;
    const imgH = (canvas.height * imgW) / canvas.width;
    let heightLeft = imgH;
    let position = 10;

    pdf.addImage(imgData, 'PNG', 10, position, imgW, imgH);
    heightLeft -= pdfH - 20;
    while (heightLeft > 0) {
      position = heightLeft - imgH + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgW, imgH);
      heightLeft -= pdfH - 20;
    }

    let label = 'course-brochure';
    if (selectedCategories.size > 0) {
      label = Array.from(selectedCategories).join('-').toLowerCase().replace(/\s+/g, '-');
    } else if (selectedCourses.size === courses.length) {
      label = 'all-courses';
    } else if (selectedCourses.size > 0) {
      label = `selected-${selectedCourses.size}-courses`;
    }
    pdf.save(`${label}.pdf`);
    setGenerating(false);
    onClose();
  }

  const selectedCount = selectedCategories.size > 0
    ? courses.filter((c) => selectedCategories.has(getCourseCategory(c))).length
    : selectedCourses.size;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg border border-neutral-200 w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Generate Report</h2>
            <p className="text-xs text-neutral-400">Select courses to include in the PDF</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-lg transition-colors">
            <FiX className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">By Category</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const active = selectedCategories.has(cat);
                const count = coursesByCategory[cat]?.length || 0;
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                      active
                        ? 'bg-accent-600 text-white border-accent-600'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    {cat}
                    <span className={`ml-1.5 text-xs ${active ? 'text-white/70' : 'text-neutral-400'}`}>({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-xs text-neutral-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Select Courses</p>
              <button
                onClick={selectAll}
                className="text-xs text-accent-600 font-medium hover:underline"
              >
                {selectedCourses.size === courses.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="relative mb-3">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                ref={searchRef}
                value={search}
                placeholder="Search courses..."
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm outline-none ring-0 focus:ring-2 focus:ring-accent-500 bg-white"
              />
            </div>
            <div className="max-h-52 overflow-y-auto border border-neutral-100 rounded-lg divide-y divide-neutral-50">
              {(() => {
                const displayCourses = search.trim() ? searchedCourses : courses;
                const totalPages = Math.ceil(displayCourses.length / 5);
                const safePage = Math.min(page, totalPages);
                const paginated = displayCourses.slice((safePage - 1) * 5, safePage * 5);

                return paginated.length === 0 ? (
                  <p className="text-sm text-neutral-400 text-center py-4">No courses found.</p>
                ) : (
                  paginated.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => toggleCourse(course.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-neutral-50 transition-colors ${
                        selectedCourses.has(course.id) ? 'bg-accent-50' : ''
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                        selectedCourses.has(course.id) ? 'bg-accent-600 border-accent-600' : 'border-neutral-300'
                      }`}>
                        {selectedCourses.has(course.id) && <FiCheck className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className="text-sm text-neutral-900 truncate">{course.title}</span>
                      <span className="text-xs text-neutral-400 ml-auto shrink-0">{getCourseCategory(course) || 'Uncategorized'}</span>
                    </button>
                  ))
                );
              })()}
            </div>
            {(() => {
              const total = search.trim() ? searchedCourses.length : courses.length;
              const pages = Math.ceil(total / 5);
              if (pages <= 1) return null;
              return (
                <div className="flex items-center justify-center gap-1 pt-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-2 py-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                        p === page ? 'bg-accent-600 text-white' : 'text-neutral-500 hover:bg-neutral-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page >= pages}
                    className="px-2 py-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-neutral-400">
            {selectedCount > 0 ? `${selectedCount} course${selectedCount > 1 ? 's' : ''} selected` : 'No courses selected'}
          </span>
          <AdminButton
            onClick={generate}
            disabled={!hasSelection || generating}
            variant="primary"
            size="md"
          >
            {generating ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiDownload className="w-4 h-4" />}
            {generating ? 'Generating...' : 'Generate PDF'}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
