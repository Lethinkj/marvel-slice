import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import DataTable from '../components/ui/DataTable';
import EmptyState from '../components/EmptyState';
import { FiTrash2, FiTag, FiArrowLeft } from 'react-icons/fi';
import PageShell from "../components/ui/PageShell";
import useConfirm from '../hooks/useConfirm';

export default function TagsList() {
  const [confirm, confirmDialog] = useConfirm();
  const queryClient = useQueryClient();
const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase
      .from('tags')
      .select('*')
      .order('name');
    if (data) setTags(data);
    setLoading(false);
  }

  async function deleteTag(id) {
    if (await confirm('Delete Tag', 'Are you sure you want to delete this tag?', 'Delete', 'destructive')) {
      await supabase.from('tags').delete().eq('id', id);
      queryClient.invalidateQueries({ queryKey: ['popularTags'] });
      loadData();
    }
  }

  const columns = [
    { header: 'SL NO', accessor: 'slno', cell: (_, i) => <span className="text-neutral-500 font-medium">{i + 1}</span> },
    { header: 'Tag Name', accessor: 'name', cell: (row) => <span className="font-medium text-black">{row.name}</span> },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button onClick={() => deleteTag(row.id)} className="p-1.5 text-red-500 hover:text-white hover:bg-red-600 rounded transition-colors" title="Delete">
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <PageShell backTo="/admin" 
      title="View Tags" 
      subtitle="Manage your content tags"
    >
      <div className="bg-white shadow-sm border border-admin-200 overflow-hidden">
        {tags.length > 0 ? (
          <DataTable 
            data={tags} 
            columns={columns} 
            searchPlaceholder="Search tags..."
          />
        ) : (
          <EmptyState 
            icon={FiTag} 
            title="No tags found" 
            description="You haven't created any tags yet." 
          />
        )}
      </div>
      {confirmDialog}
    </PageShell>
  );
}
