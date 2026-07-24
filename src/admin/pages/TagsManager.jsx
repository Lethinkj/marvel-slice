import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import AdminButton from '../components/AdminButton';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { FiPlus, FiTag } from 'react-icons/fi';
import PageShell from "../components/ui/PageShell";

export default function TagsManager() {
  const queryClient = useQueryClient();
  const [tags, setTags] = useState([]);
  const [name, setName] = useState('');

  useEffect(() => {
    supabase
      .from('tags')
      .select('*')
      .order('name')
      .then(({ data }) => setTags(data || []));
  }, []);

  async function addTag() {
    if (!name.trim()) return;
    const { data, error } = await supabase
      .from('tags')
      .insert({ name: name.trim() })
      .select()
      .single();
    if (!error) {
      setTags([...tags, data]);
      setName('');
    }
    queryClient.invalidateQueries({ queryKey: ['popularTags'] });
  }

  async function deleteTag(id) {
    if (!window.confirm('Delete this tag?')) return;
    await supabase.from('tags').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['popularTags'] });
    setTags(tags.filter((t) => t.id !== id));
  }

  return (
    <PageShell title="Tags" subtitle="Manage content tags">

      <div className="rounded-lg border border-admin-200 bg-white p-5">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tag name"
            className="flex-1 px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-500/20 focus:border-admin-500"
            onKeyDown={(e) => e.key === 'Enter' && addTag()}
          />
          <AdminButton onClick={addTag} size="md">
            <FiPlus className="w-4 h-4" />
            Add Tag
          </AdminButton>
        </div>

        {tags.length === 0 ? (
          <EmptyState
            icon={FiTag}
            title="No tags yet"
            description="Add your first tag above"
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag.id} variant="default" className="gap-2 pl-3 pr-1.5 py-1">
                <span>{tag.name}</span>
                <button
                  onClick={() => deleteTag(tag.id)}
                  className="text-[11px] font-medium text-destructive-600 bg-destructive-50 hover:bg-destructive-100 rounded px-2 py-0.5 transition-colors ml-1"
                >
                  Delete
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
