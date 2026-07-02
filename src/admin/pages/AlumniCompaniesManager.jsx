import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Button from '../../components/ui/Button';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

export default function AlumniCompaniesManager() {
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
  }

  async function deleteCompany(id) {
    if (!window.confirm('Delete this company?')) return;
    await supabase.from('alumni_companies').delete().eq('id', id);
    setCompanies(companies.filter((c) => c.id !== id));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark-navy mb-6">
        Alumni / Hiring Partners
      </h1>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Company name"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-brand-accent"
            onKeyDown={(e) => e.key === 'Enter' && addCompany()}
          />
          <Button onClick={addCompany} variant="accent" size="md">
            <FiPlus className="w-4 h-4" />
            Add
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {companies.map((company) => (
            <div
              key={company.id}
              className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
            >
              <span className="text-sm font-medium">{company.name}</span>
              <button
                onClick={() => deleteCompany(company.id)}
                className="text-gray-400 hover:text-red-600"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {companies.length === 0 && (
            <p className="text-sm text-text-gray col-span-full">
              No companies added yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
