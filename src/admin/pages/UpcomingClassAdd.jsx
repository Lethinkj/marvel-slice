import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import PageShell from '../components/ui/PageShell';
import SaveBar from '../components/SaveBar';
import SaveCancelBar from '../components/SaveCancelBar';

export default function UpcomingClassAdd() {
  const navigate = useNavigate();
  const [courseName, setCourseName] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [errors, setErrors] = useState({});

  async function handleSave() {
    const errs = {};
    if (!courseName.trim()) errs.courseName = 'Please enter the course name';
    if (!dateTime) errs.dateTime = 'Please set the date and time';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    setSaveError('');
    try {
      const { error } = await supabase.from('upcoming_classes').insert({
        course_name: courseName.trim(),
        date_time: dateTime,
        is_active: true,
      });
      if (error) throw error;
      setSaved(true);
      setTimeout(() => navigate('/admin/upcoming-courses', { replace: true }), 500);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(err.message);
    }
    setSaving(false);
  }

  return (
    <PageShell backTo="/admin" title="Add Upcoming Class"
      description="Classes listed here appear in the home page Upcoming Classes section. They are separate from courses."
    >
      <SaveBar saving={saving} saved={saved} saveError={saveError} label="Upcoming Class" top />
      <div className="bg-white border border-gray-300 rounded-xl p-6" style={{ boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px' }}>
        <div className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-sm font-semibold text-black mb-1">Course Name <span className="text-destructive-500">*</span></label>
            <input value={courseName} onChange={(e) => { setCourseName(e.target.value); if (errors.courseName) setErrors((p) => ({ ...p, courseName: undefined })); }}
              placeholder="e.g. Full-Stack Web Development"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-500/20 transition-all bg-white ${errors.courseName ? 'border-destructive-500 ring-2 ring-destructive-100' : 'border-admin-200'}`} />
            {errors.courseName && <p className="text-xs text-destructive-500 mt-1.5">{errors.courseName}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-black mb-1">Date & Time <span className="text-destructive-500">*</span></label>
            <input type="datetime-local" value={dateTime}
              onChange={(e) => { setDateTime(e.target.value); if (errors.dateTime) setErrors((p) => ({ ...p, dateTime: undefined })); }}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-500/20 transition-all bg-white ${errors.dateTime ? 'border-destructive-500 ring-2 ring-destructive-100' : 'border-admin-200'}`} />
            {errors.dateTime && <p className="text-xs text-destructive-500 mt-1.5">{errors.dateTime}</p>}
          </div>
        </div>
        <SaveCancelBar saving={saving} saved={saved} saveError={saveError} onSave={handleSave} onDiscard={() => navigate('/admin/upcoming-courses')} submitLabel="Add Upcoming Class" />
      </div>
    </PageShell>
  );
}
