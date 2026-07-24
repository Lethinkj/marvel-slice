import { FiSave, FiCheck, FiAlertCircle } from 'react-icons/fi';
import AdminButton from './AdminButton';

export default function SaveBar({ saving, saved, saveError, onSave, label = 'Save', top = false, dirty }) {
  if (top) {
    return (
      <>
        {saveError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-sm shadow-sm">
            <FiAlertCircle className="w-4 h-4 shrink-0" /> {saveError}
          </div>
        )}
        {saved && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-sm shadow-sm">
            <FiCheck className="w-4 h-4 shrink-0" /> {label} saved successfully!
          </div>
        )}
      </>
    );
  }

  if (!dirty) return null;

  return (
    <div className="fixed bottom-6 right-6 z-10">
      <div className="backdrop-blur-lg bg-slate-900/90 text-white rounded-xl shadow-2xl px-5 py-2.5 border border-slate-700 inline-flex items-center gap-3">
        <span className="text-xs text-slate-300 hidden sm:block">Unsaved changes</span>
        <AdminButton onClick={onSave} disabled={saving} variant="primary" size="sm" className="!bg-white !text-slate-900 hover:!bg-slate-100 !shadow-lg">
          <FiSave className="w-3.5 h-3.5" /> {saving ? 'Saving...' : label}
        </AdminButton>
      </div>
    </div>
  );
}
