import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, ShieldAlert, ArrowRight, Lock, Mail } from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export default function BossAccess() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Preencha todos os campos!');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Validar se o usuário existe no Firestore e tem papel do BOSS
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        const profile = userDoc.data();
        const bossRoles = ['SUPER_BOSS', 'BOSS_ADMIN', 'BOSS_FINANCEIRO', 'BOSS_RH', 'BOSS_MKT'];
        if (bossRoles.includes(profile.role)) {
          toast.success(`Acesso concedido: ${profile.role}`);
          navigate('/boss/visao-geral');
          return;
        }
      }
      toast.error('Acesso negado: Perfil de BOSS não identificado.');
      await auth.signOut();
    } catch (error: any) {
      console.error(error);
      toast.error('Credenciais inválidas ou erro no acesso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Botão de Voltar ao Início no topo */}
      <div className="absolute top-8 left-8">
        <Link 
          to="/" 
          className="text-slate-500 hover:text-white text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 transition-colors group"
        >
          <Home size={14} className="group-hover:-translate-x-1 transition-transform" /> Voltar ao Início
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10 transition-all duration-300">
        <div className="text-center mb-10">
          <span className="text-red-600 font-bold tracking-[0.4em] uppercase text-[10px] bg-red-600/10 px-4 py-1.5 rounded-full border border-red-600/20">
            Acesso Reservado BOSS
          </span>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase mt-6 leading-none">
            Giffoni <span className="text-zinc-800">School</span>
          </h1>
          <p className="text-slate-500 font-mono tracking-widest text-[10px] uppercase mt-2">
            Etapa 1.0 — Gestão Corporativa
          </p>
        </div>

        <div className="bg-zinc-900/60 border border-white/5 p-8 rounded-3xl backdrop-blur-md shadow-2xl relative">
          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div>
              <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-2">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="boss@giffonishool.com"
                  className="w-full bg-zinc-950/80 border border-white/5 rounded-full py-4 pl-12 pr-6 text-sm font-bold tracking-widest focus:ring-2 focus:ring-red-600 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Assinatura Digital (Senha)</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-950/80 border border-white/5 rounded-full py-4 pl-12 pr-6 text-sm font-bold tracking-widest focus:ring-2 focus:ring-red-600 transition-all outline-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-4 rounded-full font-black uppercase text-xs tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? 'AUTENTICANDO...' : 'ENTRAR NO PORTAL BOSS'} <ArrowRight size={14} />
            </button>
          </form>

          {/* Login Google desabilitado nesta fase de deploy */}
          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <button 
              disabled 
              className="w-full bg-zinc-950 text-slate-500 py-4 rounded-full font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 border border-white/5 opacity-60 cursor-not-allowed"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale" alt="Google" />
              Entrar com Google (Deploy Futuro)
            </button>
            <div className="mt-4 flex items-center justify-center gap-2 px-2 py-1.5 bg-red-950/20 rounded-lg border border-red-950/40">
              <ShieldAlert size={12} className="text-red-500 shrink-0" />
              <p className="text-[9px] text-red-400 font-bold uppercase tracking-wider text-left leading-normal">
                Regra 1.0.2: O login Google institucional será ativado automaticamente na fase de deploy final.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
