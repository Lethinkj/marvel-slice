import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "./Breadcrumbs";

export default function PageShell({ title, subtitle, actions, children, maxWidth = '', className = '', breadcrumb = true, backTo = '' }) {
  const navigate = useNavigate();
  return (
    <div className={`relative min-h-[calc(100vh-4rem)] bg-white p-6 lg:p-8 space-y-6 ${maxWidth} ${className}`}>
      <div className="flex items-center gap-3">
        {backTo && (
          <button 
            onClick={() => navigate(backTo)} 
            className="flex items-center text-xs font-medium text-neutral-500 hover:text-neutral-700 hover:underline transition-colors"
          >
            &larr; Back
          </button>
        )}
        {backTo && breadcrumb && <div className="h-3 w-px bg-neutral-300" />}
        {breadcrumb && <Breadcrumbs />}
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-admin-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">{title}</h1>
          {subtitle && <p className="text-sm text-neutral-700 mt-1">{subtitle}</p>}
        </div>
        {actions && (
          <div className="flex items-center gap-3 self-start sm:self-auto">
            {actions}
          </div>
        )}
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}
