import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Button from '../../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiTrash2, FiUsers, FiCheck, FiEye, FiEyeOff, FiEdit2, FiX } from 'react-icons/fi';

const roles = [
  { value: 'admin', label: 'Admin', desc: 'Full access' },
  { value: 'editor', label: 'Editor', desc: 'Manage content' },
  { value: 'manager', label: 'Manager', desc: 'Manage content & users' },
];

export default function AdminUsersManager() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('editor');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    supabase
      .rpc('list_admins', { p_viewer_id: currentUser.id })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          setUsers([]);
        } else {
          setUsers(data || []);
        }
        setLoading(false);
      });
  }, [currentUser]);

  function resetForm() {
    setEmail('');
    setName('');
    setRole('editor');
    setPassword('');
    setShowPw(false);
    setEditingId(null);
  }

  function startEdit(u) {
    setEditingId(u.id);
    setEmail(u.email);
    setName(u.full_name);
    setRole(u.role);
    setPassword('');
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !name.trim()) {
      setError('Name and email are required');
      return;
    }
    if (!editingId && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const { data, error: updateError } = await supabase
          .rpc('update_admin', {
            p_editor_id: currentUser.id,
            p_target_id: editingId,
            p_email: email.trim(),
            p_full_name: name.trim(),
            p_role,
            p_password: password || null,
          });

        if (updateError) {
          setError(updateError.message);
        } else {
          setUsers(users.map((u) => (u.id === editingId ? { ...u, email: data.email, full_name: data.full_name, role: data.role } : u)));
          resetForm();
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
      } else {
        const { data, error: insertError } = await supabase
          .rpc('create_admin', {
            p_creator_id: currentUser.id,
            p_email: email.trim(),
            p_full_name: name.trim(),
            p_role,
            p_password: password,
          });

        if (insertError) {
          setError(insertError.message);
        } else {
          setUsers([data, ...users]);
          resetForm();
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
      }
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  async function deleteUser(id) {
    if (!window.confirm('Remove this admin?')) return;
    await supabase.rpc('delete_admin', { p_creator_id: currentUser.id, p_target_id: id });
    setUsers(users.filter((u) => u.id !== id));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-navy">Admin Users</h1>
        <p className="text-sm text-gray-500 mt-1">Create and manage admin accounts with credentials</p>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm">
          <FiCheck className="w-4 h-4" /> {editingId ? 'Admin updated!' : 'Admin added successfully!'}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          {editingId ? 'Edit Admin' : 'Add New Admin'}
        </h3>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all"
                placeholder="admin@example.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all"
                placeholder="John Doe" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all bg-white appearance-none cursor-pointer">
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                Password {editingId && <span className="text-gray-400 font-normal normal-case">(leave blank to keep)</span>}
              </label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  minLength={editingId ? 0 : 6} required={!editingId}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all"
                  placeholder={editingId ? 'Leave blank to keep' : 'Min 6 characters'} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-dark-navy transition-colors">
                  {showPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="accent" size="md" disabled={saving}>
              {editingId ? <FiEdit2 className="w-4 h-4" /> : <FiPlus className="w-4 h-4" />}
              {saving ? 'Saving...' : editingId ? 'Update Admin' : 'Add Admin'}
            </Button>
            {editingId && (
              <Button type="button" variant="ghost" size="md" onClick={resetForm}>
                <FiX className="w-4 h-4" /> Cancel
              </Button>
            )}
            <Button type="button" variant="ghost" size="md" onClick={resetForm}>Clear</Button>
          </div>
        </div>
      </form>

      {users.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FiUsers className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-sm text-gray-400">No admin users yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group">
                <div className="w-9 h-9 bg-brand-accent/10 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-brand-accent">
                    {(u.full_name || '?')[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-navy">{u.full_name}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  u.role === 'admin'
                    ? 'bg-brand-accent/10 text-brand-accent'
                    : u.role === 'manager'
                    ? 'bg-purple-50 text-purple-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>{u.role}</span>
                {currentUser?.id !== u.id && (
                  <button onClick={() => deleteUser(u.id)}
                    className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => startEdit(u)}
                  className="p-2 text-gray-300 hover:text-brand-accent hover:bg-brand-accent/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Edit">
                  <FiEdit2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
