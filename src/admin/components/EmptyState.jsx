import { Link } from "react-router-dom";
import { FiInbox } from "react-icons/fi";

export default function EmptyState({ icon: Icon = FiInbox, title = "Nothing here yet", description = "", action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-14 h-14 rounded-full bg-admin-100 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-admin-400" />
      </div>
      <p className="text-sm font-medium text-admin-900 mb-1">{title}</p>
      {description && <p className="text-sm text-admin-500 mb-4 text-center max-w-sm">{description}</p>}
      {action && (
        action.to ? (
          <Link to={action.to} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-admin-600 text-white hover:bg-admin-700 transition-colors">
            {action.icon}{action.label}
          </Link>
        ) : (
          <button onClick={action.onClick} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-admin-600 text-white hover:bg-admin-700 transition-colors">
            {action.icon}{action.label}
          </button>
        )
      )}
    </div>
  );
}
