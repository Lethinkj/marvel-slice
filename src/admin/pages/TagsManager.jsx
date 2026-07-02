import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Button from '../../components/ui/Button';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

export default function TagsManager() {
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
  }

  async function deleteTag(id) {
    if (!window.confirm('Delete this tag?')) return;
    await supabase.from('tags').delete().eq('id', id);
    setTags(tags.filter((t) => t.id !== id));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark-navy mb-6">Tags</h1>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tag name"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-brand-accent"
            onKeyDown={(e) => e.key === 'Enter' && addTag()}
          />
          <Button onClick={addTag} variant="accent" size="md">
            <FiPlus className="w-4 h-4" />
            Add Tag
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm"
            >
              <span>{tag.name}</span>
              <button
                onClick={() => deleteTag(tag.id)}
                className="text-gray-400 hover:text-red-600"
              >
                <FiTrash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          {tags.length === 0 && (
            <p className="text-sm text-text-gray">No tags yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
