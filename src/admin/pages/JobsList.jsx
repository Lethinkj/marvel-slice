import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import AdminButton from '../components/AdminButton';
import DataTable from '../components/ui/DataTable';
import EmptyState from '../components/EmptyState';
import { FiPlus, FiEdit3, FiEdit2, FiTrash2, FiBriefcase } from 'react-icons/fi';
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
    { header: 'SL NO', accessor: 'slno', cell: (_, i) => <span className="text-neutral-500 font-medium">{i + 1}</span> },
    { header: 'Job Title', accessor: 'title', cell: (row) => <span className="font-semibold text-black">{row.title}</span> },
    { header: 'Category', accessor: 'role_categories', cell: (row) => row.role_categories?.name || <span className="text-neutral-400 italic">Uncategorized</span> },
    { header: 'Location', accessor: 'location', cell: (row) => row.location || '-' },
    { header: 'Type', accessor: 'type', cell: (row) => row.type || '-' },
    { header: 'Status', accessor: 'is_active', cell: (row) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${row.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ) 
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button onClick={() => navigate(`/admin/jobs/${row.id}`)} className="p-1.5 text-blue-500 hover:text-white hover:bg-blue-600 rounded transition-colors" title="Edit">
            <FiEdit3 className="w-4 h-4" />
          </button>
          <button onClick={() => deleteJob(row.id)} className="p-1.5 text-red-500 hover:text-white hover:bg-red-600 rounded transition-colors" title="Delete">
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  

  return (
    <PageShell 
      title="Job Openings" 
      description="Manage your company's career opportunities"
      
    >
      <div className="bg-white rounded-xl shadow-sm border border-admin-200 overflow-hidden">
        {jobs.length > 0 ? (
          <DataTable data={jobs} columns={columns} headerRowClass="bg-gray-100" headerCellClass="text-gray-700" />
        ) : (
          <EmptyState icon={FiBriefcase} title="No jobs added" description="Get started by creating your first job opening."
            
          />
        )}
      </div>
      {confirmDialog}
    </PageShell>
  );
}
