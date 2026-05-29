import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

export default function RegistrationBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex-wrap bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-100 shadow-sm inline-flex">
      <Link to="/boss/visao-geral" className="hover:text-red-600 transition-colors flex items-center gap-1.5">
        <Home size={12} />
        <span>Painel Geral</span>
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight size={12} className="text-slate-300 shrink-0" />
          {item.to ? (
            <Link to={item.to} className="hover:text-red-600 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-800 font-extrabold">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
