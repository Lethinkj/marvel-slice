import { FiSave, FiCheck, FiAlertCircle } from 'react-icons/fi';
import AdminButton from './AdminButton';

export default function SaveBar({ saving, saved, saveError, onSave, label = 'Save', top = false }) {
  if (top) {
    return (
      <>
        {saveError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <FiAlertCircle className="w-4 h-4 shrink-0" /> {saveError}
          </div>
        )}
        {saved && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
            <FiCheck className="w-4 h-4 shrink-0" /> {label} saved successfully!
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex justify-end pt-4 border-t border-neutral-100 mt-6">
      <AdminButton onClick={onSave} disabled={saving} variant="primary" size="md">
        <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : saved ? 'Saved!' : label}
      </AdminButton>
    </div>
  );
}
