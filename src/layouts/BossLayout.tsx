import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Home, BookOpen, User, Shield, Menu, X, UserPlus, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/firebase';
import { useState } from 'react';

export default function BossLayout({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { label: 'Visão Geral', href: '/boss/visao-geral', icon: Shield },
    { label: 'Cadastros', href: '/boss/cadastro', icon: UserPlus },
    { label: 'Cursos', href: '/boss/cursos', icon: BookOpen },
    { label: 'Alunos', href: '/boss/alunos', icon: User },
    { label: 'Configurações', href: '/boss/configuracoes-gerais', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white p-4">
        <div className="mb-8 p-2">
          <h1 className="text-xl font-bold tracking-tighter">BOSS SCHOOL</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">{profile?.role?.replace('_', ' ') || 'BOSS'}</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-semibold uppercase tracking-wider ${
                  isActive 
                    ? 'bg-red-600 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          <div className="pt-4 mt-4 border-t border-slate-800">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white transition-colors text-sm font-semibold uppercase tracking-wider"
            >
              <Home size={18} />
              <span>Ver Site Inicial</span>
            </Link>
          </div>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors text-sm font-semibold uppercase tracking-wider"
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center">
        <h1 className="text-lg font-bold">BOSS SCHOOL</h1>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Sidebar overlay */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-800 text-white p-4 space-y-2 border-b border-slate-705">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-700 text-xs font-bold uppercase tracking-widest"
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </Link>
          ))}
          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:underline text-xs font-bold uppercase tracking-widest"
          >
            <Home size={16} />
            <span>Ver Site Inicial</span>
          </Link>
          <button
            onClick={() => {
              setIsMenuOpen(false);
              handleLogout();
            }}
            className="flex items-center gap-3 px-3 py-2.5 text-red-400 w-full text-left text-xs font-bold uppercase tracking-widest"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
