import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Button from '../../components/ui/Button';
import { FiPlus, FiEdit2, FiTrash2, FiBookOpen, FiChevronRight } from 'react-icons/fi';

export default function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setCourses(data || []);
        setLoading(false);
      });
  }, []);

  async function togglePublish(id, current) {
    await supabase.from('courses').update({ is_published: !current }).eq('id', id);
    setCourses(courses.map((c) => (c.id === id ? { ...c, is_published: !current } : c)));
  }

  async function handleDelete(id, title) {
    if (!window.confirm(`Delete course "${title}"? This action cannot be undone.`)) return;
    await supabase.from('courses').delete().eq('id', id);
    setCourses(courses.filter((c) => c.id !== id));
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
        <div>
          <h1 className="text-2xl font-bold text-dark-navy">Courses</h1>
          <p className="text-sm text-gray-500 mt-1">{courses.length} course{courses.length !== 1 ? 's' : ''} total</p>
        </div>
        <Button to="/admin/courses/new" variant="accent" size="sm">
          <FiPlus className="w-4 h-4" />
          Add Course
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FiBookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-sm text-gray-400 mb-4">No courses yet.</p>
          <Button to="/admin/courses/new" variant="accent" size="sm">
            <FiPlus className="w-4 h-4" />
            Create your first course
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {courses.map((course) => (
            <div key={course.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-accent/10 rounded-xl flex items-center justify-center shrink-0">
                  <FiBookOpen className="w-5 h-5 text-brand-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/admin/courses/${course.id}`}
                    className="font-semibold text-dark-navy hover:text-brand-accent transition-colors">
                    {course.title}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">/{course.slug}</p>
                </div>
                <button
                  onClick={() => togglePublish(course.id, course.is_published)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    course.is_published
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${course.is_published ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  {course.is_published ? 'Published' : 'Draft'}
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to={`/admin/courses/${course.id}`}
                    className="p-2 text-gray-400 hover:text-brand-accent hover:bg-brand-accent/10 rounded-lg transition-colors"
                    title="Edit">
                    <FiEdit2 className="w-4 h-4" />
                  </Link>
                  <button onClick={() => handleDelete(course.id, course.title)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
                <FiChevronRight className="w-4 h-4 text-gray-200 group-hover:text-brand-accent transition-colors shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
