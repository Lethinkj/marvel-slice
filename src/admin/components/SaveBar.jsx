import { FiSave, FiCheck, FiAlertCircle } from 'react-icons/fi';
import AdminButton from './AdminButton';

export default function SaveBar({ saving, saved, saveError, onSave, onDiscard, label = 'Save', top = false, dirty }) {
  if (top) {
    return (
      <>
        {saveError && (
          <div className="mb-6 p-4 bg-destructive-50 border border-destructive-500 rounded-xl flex items-center gap-2 text-destructive-700 text-sm shadow-sm">
            <FiAlertCircle className="w-4 h-4 shrink-0" /> {saveError}
          </div>
        )}
        {saved && (
          <div className="mb-6 p-4 bg-success-50 border border-success-500 rounded-xl flex items-center gap-2 text-success-700 text-sm shadow-sm">
            <FiCheck className="w-4 h-4 shrink-0" /> {label} saved successfully!
          </div>
        )}
      </>
    );
  }

  if (!dirty) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="backdrop-blur-lg bg-admin-900/90 text-white rounded-xl shadow-2xl px-5 py-2.5 border border-admin-700 inline-flex items-center gap-4">
        <span className="text-xs text-neutral-300 hidden sm:block font-medium">Unsaved changes</span>
        <div className="flex items-center gap-2">
          {onDiscard && (
            <button 
              type="button"
              onClick={onDiscard} 
              disabled={saving} 
              className="px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
            >
              Discard
            </button>
          )}
          <AdminButton onClick={onSave} disabled={saving} variant="primary" size="sm" className="!shadow-lg">
            <FiSave className="w-3.5 h-3.5" /> {saving ? 'Saving...' : label}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
