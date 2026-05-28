import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Home, BookOpen, GraduationCap, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/firebase';
import { useState } from 'react';

export default function StudentLayout({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Navbar Aluno */}
      <nav className="border-b border-white/5 bg-black/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/aluno" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="font-black italic tracking-tighter text-xl uppercase">PORTAL DO ALUNO</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/aluno" className="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Meus Cursos</Link>
            <Link to="/cursos" className="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Catálogo</Link>
            <Link to="/" className="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors flex items-center gap-2">
              <Home size={14} /> Site Principal
            </Link>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
            >
              Sair
            </button>
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-zinc-900 p-6 flex flex-col gap-6 font-bold uppercase text-sm tracking-widest border-t border-white/5">
            <Link to="/aluno" onClick={() => setIsMenuOpen(false)}>Meus Cursos</Link>
            <Link to="/cursos" onClick={() => setIsMenuOpen(false)}>Catálogo</Link>
            <Link to="/" onClick={() => setIsMenuOpen(false)}>Site Principal</Link>
            <button onClick={handleLogout} className="text-red-500 text-left">Sair</button>
          </div>
        )}
      </nav>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
