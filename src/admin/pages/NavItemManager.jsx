import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { FiBookOpen, FiChevronDown, FiList, FiCheck } from 'react-icons/fi';

export default function NavItemManager() {
  const [items, setItems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseDropdown, setCourseDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    async function load() {
      const { data: navData } = await supabase.from('nav_items').select('*').order('sort_order');
      const { data: courseData } = await supabase.from('courses').select('id, title, slug, nav_item_id').order('title');
      if (navData) setItems(navData);
      if (courseData) setCourses(courseData);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCourseDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const sections = [...new Set(items.filter(i => i.parent_label).map(i => i.parent_label))].sort();

  function getChildren(pid) {
    return items.filter(i => i.parent_id === pid);
  }

  function linkedCourses(item) {
    return courses.filter(c => c.nav_item_id === item.id);
  }

  async function toggleCourseLink(courseId, itemId) {
    const course = courses.find(c => c.id === courseId);
    const newNavItemId = course.nav_item_id === itemId ? null : itemId;
    await supabase.from('courses').update({ nav_item_id: newNavItemId }).eq('id', courseId);
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, nav_item_id: newNavItemId } : c));
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Nav Item Manager</h1>

      {sections.length === 0 ? (
        <div className="text-center py-16 text-neutral-400 text-sm border rounded-xl bg-white">No nav items found.</div>
      ) : (
        <div className="space-y-6">
          {sections.map(section => {
            const sectionItems = items.filter(i => i.parent_label === section);
            return (
              <div key={section} className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
                <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-100">
                  <h2 className="text-sm font-bold text-neutral-900">{section}</h2>
                </div>
                <div className="divide-y divide-neutral-100">
                  {sectionItems.map(item => {
                    const children = getChildren(item.id);
                    const itemCourses = linkedCourses(item);
                    return (
                      <div key={item.id} className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-neutral-900 flex-1 truncate">{item.label}</span>
                          {item.path && (
                            <span className="text-[11px] text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded-full truncate max-w-[120px] hidden sm:inline">{item.path}</span>
                          )}
                          <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${item.is_active !== false ? 'bg-success-50 text-success-700' : 'bg-destructive-50 text-destructive-700'}`}>
                            {item.is_active !== false ? 'On' : 'Off'}
                          </span>
                          {itemCourses.length > 0 && (
                            <div className="flex gap-1">
                              {itemCourses.map(c => (
                                <Link key={c.id} to={`/admin/courses/${c.id}`}
                                  className="text-[11px] text-accent-700 bg-accent-50 px-2 py-0.5 rounded-full truncate max-w-[120px] hover:bg-accent-100 transition-colors flex items-center gap-1">
                                  <FiBookOpen className="w-3 h-3" /> {c.title}
                                </Link>
                              ))}
                            </div>
                          )}
                          <Link to={`/admin/nav-menu/children/${item.id}`}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-500 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors shrink-0">
                            <FiList className="w-3.5 h-3.5" /> Sub-items
                          </Link>
                          <div className="relative shrink-0" ref={courseDropdown === item.id ? dropdownRef : null}>
                            <button onClick={() => setCourseDropdown(courseDropdown === item.id ? null : item.id)}
                              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${courseDropdown === item.id ? 'bg-accent-100 text-accent-700' : 'bg-accent-50 text-accent-600 hover:bg-accent-100'}`}>
                              <FiBookOpen className="w-3.5 h-3.5" /> Linked Courses
                            </button>
                            {courseDropdown === item.id && (
                              <div className="absolute top-full right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 min-w-[220px] max-h-[280px] flex flex-col">
                                <div className="overflow-y-auto">
                                  {courses.length === 0 ? (
                                    <p className="px-3 py-4 text-xs text-neutral-400 text-center">No courses available.</p>
                                  ) : (
                                    courses.map(c => {
                                      const checked = itemCourses.some(lc => lc.id === c.id);
                                      return (
                                        <label key={c.id}
                                          className="flex items-center gap-2.5 px-3 py-2 hover:bg-neutral-50 cursor-pointer text-sm border-b border-neutral-50 last:border-b-0">
                                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${checked ? 'bg-accent-600 border-accent-600' : 'border-neutral-300'}`}>
                                            {checked && <FiCheck className="w-3 h-3 text-white" />}
                                          </div>
                                          <input type="checkbox" checked={checked} onChange={() => toggleCourseLink(c.id, item.id)} className="sr-only" />
                                          <span className="truncate text-neutral-700">{c.title}</span>
                                        </label>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {children.length > 0 && (
                          <div className="ml-5 mt-2 space-y-1">
                            {children.map(child => {
                              const childCourses = linkedCourses(child);
                              return (
                                <div key={child.id} className="flex items-center gap-2 text-xs text-neutral-500 pl-3 border-l-2 border-accent-200 py-1">
                                  <FiChevronDown className="w-3 h-3 text-neutral-300 -rotate-90" />
                                  <span className="text-neutral-700">{child.label}</span>
                                  {child.path && <span className="text-neutral-400">{child.path}</span>}
                                  {childCourses.length > 0 && (
                                    <div className="flex gap-1 ml-auto">
                                      {childCourses.map(c => (
                                        <Link key={c.id} to={`/admin/courses/${c.id}`} className="text-accent-600 hover:underline">
                                          {c.title}
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
