import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import DataTable from '../components/ui/DataTable';
import EmptyState from '../components/EmptyState';
import Badge from '../components/Badge';
import { FiCalendar, FiCheck, FiEdit3, FiTrash2, FiPlusCircle } from 'react-icons/fi';
import PageShell from '../components/ui/PageShell';
import useConfirm from '../hooks/useConfirm';
import { formatDateTime } from '../../lib/datetime';

export default function UpcomingCoursesManager() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, confirmDialog] = useConfirm();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase
      .from('upcoming_classes')
      .select('*')
      .order('is_active', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    setClasses(data || []);
    setLoading(false);
  }

  async function toggleActive(row) {
    if (!row?.id) return;
    await supabase.from('upcoming_classes').update({ is_active: !row.is_active }).eq('id', row.id);
    loadData();
  }

  async function deleteClass(id) {
    if (!id) return;
    if (!(await confirm('Delete this class? This cannot be undone.'))) return;
    await supabase.from('upcoming_classes').delete().eq('id', id);
    loadData();
  }

  const columns = [
    { header: 'SL NO', accessor: 'slno', cell: (_, i) => <span className="text-neutral-500 font-medium">{i + 1}</span>, width: '80px' },
    { header: 'Course Name', accessor: 'course_name', cell: (row) => <span className="font-semibold text-black">{row.course_name}</span> },
    { header: 'Date & Time', accessor: 'date_time', cell: (row) => row.date_time ? formatDateTime(row.date_time) : <span className="text-neutral-400 italic">Not set</span> },
    { header: 'Status', accessor: 'is_active', cell: (row) => row.is_active ? <Badge variant="active">Active</Badge> : <Badge variant="inactive">Inactive</Badge> },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button onClick={() => toggleActive(row)} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors" title={row.is_active ? 'Hide from home page' : 'Show on home page'}>
            <FiCheck className="w-3.5 h-3.5" /> {row.is_active ? 'Make Inactive' : 'Make Active'}
          </button>
          <button onClick={() => deleteClass(row.id)} className="p-1.5 text-red-500 hover:text-white hover:bg-red-600 rounded transition-colors" title="Delete">
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <PageShell backTo="/admin"
      title="Upcoming Classes"
      description="Classes listed here appear in the home page Upcoming Classes section. They are separate from courses — use 'Make Active' to show a class on the home page."
    >
      <div className="mb-4">
        <button onClick={() => navigate('/admin/upcoming-courses/new')} className="inline-flex items-center gap-2 px-4 py-2 bg-admin-600 text-white text-sm font-medium rounded-lg hover:bg-admin-700 transition-colors">
          <FiPlusCircle className="w-4 h-4" /> Add Upcoming Class
        </button>
      </div>
      <div className="bg-white shadow-sm border border-admin-200 overflow-hidden">
        {classes.length > 0 ? (
          <DataTable data={classes} columns={columns} isLoading={loading} />
        ) : (
          <EmptyState icon={FiCalendar} title="No upcoming classes"
            description="Add a class to list it in the home page Upcoming Classes section." />
        )}
      </div>
      {confirmDialog}
    </PageShell>
  );
}
