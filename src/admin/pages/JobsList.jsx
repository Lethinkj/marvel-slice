import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import AdminButton from '../components/AdminButton';
import DataTable from '../components/ui/DataTable';
import EmptyState from '../components/EmptyState';
import { FiPlus, FiEdit2, FiTrash2, FiBriefcase } from 'react-icons/fi';
import PageShell from '../components/ui/PageShell';
import useConfirm from '../hooks/useConfirm';

export default function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, confirmDialog] = useConfirm();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase.from('job_openings').select('*, role_categories(name)').order('sort_order', { ascending: true }).order('created_at', { ascending: false });
    if (data) setJobs(data);
    setLoading(false);
  }

  async function deleteJob(id) {
    if (await confirmDialog('Delete Job', 'Are you sure you want to delete this job opening?', 'Delete', 'destructive')) {
      await supabase.from('job_openings').delete().eq('id', id);
      loadData();
    }
  }

  const columns = [
    { header: 'SL NO', key: 'slno', render: (_, __, i) => <span className="text-neutral-500 font-medium">{i + 1}</span>, width: '80px' },
    { header: 'Job Title', key: 'title', render: (val) => <span className="font-semibold text-black">{val}</span> },
    { header: 'Category', key: 'role_categories', render: (val) => val?.name || <span className="text-neutral-400 italic">Uncategorized</span> },
    { header: 'Location', key: 'location', render: (val) => val || '-' },
    { header: 'Type', key: 'type', render: (val) => val || '-' },
    { header: 'Status', key: 'is_active', render: (val) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${val ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
          {val ? 'Active' : 'Inactive'}
        </span>
      ) 
    },
  ];

  const actions = [
    { icon: <FiEdit2 className="w-4 h-4" />, onClick: (job) => navigate(`/admin/jobs/${job.id}`), variant: 'primary', className: 'text-blue-500 hover:text-blue-600 hover:bg-blue-50' },
    { icon: <FiTrash2 className="w-4 h-4" />, onClick: (job) => deleteJob(job.id), variant: 'ghost', className: 'text-red-500 hover:text-red-600 hover:bg-red-50' }
  ];

  return (
    <PageShell 
      title="Job Openings" 
      description="Manage your company's career opportunities"
      actions={
        <AdminButton onClick={() => navigate('/admin/jobs/new')} variant="primary" size="md">
          <FiPlus className="w-4 h-4" /> Add Job
        </AdminButton>
      }
    >
      <div className="bg-white rounded-xl shadow-sm border border-admin-200 overflow-hidden">
        {jobs.length > 0 ? (
          <DataTable data={jobs} columns={columns} actions={actions} />
        ) : (
          <EmptyState icon={FiBriefcase} title="No jobs added" description="Get started by creating your first job opening."
            action={{ onClick: () => navigate('/admin/jobs/new'), icon: <FiPlus className="w-4 h-4" />, label: 'Add Job' }}
          />
        )}
      </div>
      {confirm}
    </PageShell>
  );
}
