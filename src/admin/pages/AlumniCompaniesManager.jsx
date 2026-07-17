import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import AdminButton from '../components/AdminButton';
import EmptyState from '../components/EmptyState';
import { FiPlus, FiBriefcase } from 'react-icons/fi';

export default function AlumniCompaniesManager() {
  const queryClient = useQueryClient();
  const [companies, setCompanies] = useState([]);
  const [name, setName] = useState('');

  useEffect(() => {
    supabase
      .from('alumni_companies')
      .select('*')
      .order('sort_order')
      .then(({ data }) => setCompanies(data || []));
  }, []);

  async function addCompany() {
    if (!name.trim()) return;
    const { data, error } = await supabase
      .from('alumni_companies')
      .insert({ name: name.trim(), sort_order: companies.length })
      .select()
      .single();
    if (!error) {
      setCompanies([...companies, data]);
      setName('');
    }
    queryClient.invalidateQueries({ queryKey: ['alumniCompanies'] });
  }

  async function deleteCompany(id) {
    if (!window.confirm('Delete this company?')) return;
    await supabase.from('alumni_companies').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['alumniCompanies'] });
    setCompanies(companies.filter((c) => c.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">Alumni / Hiring Partners</h1>
          <p className="text-sm text-neutral-500">Manage partner companies</p>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-5">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Company name"
            className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
            onKeyDown={(e) => e.key === 'Enter' && addCompany()}
          />
          <AdminButton onClick={addCompany} size="md">
            <FiPlus className="w-4 h-4" />
            Add
          </AdminButton>
        </div>

        {companies.length === 0 ? (
          <EmptyState
            icon={FiBriefcase}
            title="No companies added yet"
            description="Add your first company above"
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {companies.map((company) => (
              <div
                key={company.id}
                className="inline-flex items-center gap-2 bg-neutral-100 px-3 py-1.5 rounded-full text-sm"
              >
                <span className="font-medium text-neutral-900">{company.name}</span>
                <button
                  onClick={() => deleteCompany(company.id)}
                  className="text-xs font-medium text-destructive-600 bg-destructive-50 hover:bg-destructive-100 rounded px-2 py-0.5 transition-colors"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
