import { useState, useEffect, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './lib/firebase';
import { BookOpen, Home as HomeIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';

// Layouts
import BossLayout from './layouts/BossLayout';
import StudentLayout from './layouts/StudentLayout';

// Pages
import Home from './pages/public/Home';
import Courses from './pages/public/Courses';
import BossHomeManager from './pages/boss/BossHomeManager';
import BossCourses from './pages/boss/BossCourses';
import BossAccess from './pages/boss/BossAccess';
import BossRegistration from './pages/boss/BossRegistration';
import BossNewStudent from './pages/boss/BossNewStudent';
import BossExistingStudent from './pages/boss/BossExistingStudent';
import BossEnrollment from './pages/boss/BossEnrollment';
import BossFinance from './pages/boss/BossFinance';
import BossStudents from './pages/boss/BossStudents';
import BossGeneralSettings from './pages/boss/BossGeneralSettings';

const CourseDetails = () => {
  const { slug } = useParams();
  return (
    <div className="min-h-screen bg-black text-white p-20 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4">DETALHES DO CURSO</h1>
      <p className="text-slate-500 font-mono tracking-widest text-xs">SLUG: {slug}</p>
      <Link to="/cursos" className="mt-8 text-red-600 font-bold uppercase tracking-widest text-xs hover:underline decoration-2 underline-offset-4">Voltar ao Catálogo</Link>
    </div>
  );
};

const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/boss'); // Or /aluno depending on role
  }, [user]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Profile creation logic would go here in a real app or triggered by role check
    } catch (e) {
      console.error(e);
      toast.error('Erro ao entrar com Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute top-8 right-8">
        <Link to="/" className="text-slate-500 hover:text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors">
          <HomeIcon size={14} /> Voltar ao Início
        </Link>
      </div>
      <div className="mb-12">
        <h1 className="text-4xl font-black italic tracking-tighter text-white mb-2 uppercase text-shadow-glow">Giffoni School</h1>
        <p className="text-slate-500 font-medium tracking-widest text-xs">ACESSO RESTRITO</p>
      </div>
      <button 
        onClick={handleGoogleLogin}
        disabled={loading}
        className="bg-white text-black px-10 py-5 rounded-full font-black flex items-center gap-4 hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] disabled:opacity-50"
      >
        <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
        ENTRAR COM GOOGLE
      </button>
    </div>
  );
};

const BossOverview = () => <div className="space-y-10">
  <div className="flex justify-between items-center">
    <h1 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">VISÃO GERAL BOSS</h1>
    <Link to="/" className="text-slate-400 hover:text-slate-900 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors">
      <HomeIcon size={14} /> Ver Site Vivo
    </Link>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    {[
      { label: 'Cursos Ativos', val: '0', color: 'bg-white text-slate-900' },
      { label: 'Alunos Matriculados', val: '0', color: 'bg-white text-slate-900' },
      { label: 'Faturamento Mensal', val: 'R$ 0,00', color: 'bg-slate-900 text-white' },
      { label: 'Leads Hoje', val: '0', color: 'bg-white text-slate-900' },
    ].map((item) => (
      <div key={item.label} className={`p-8 rounded-3xl border border-slate-100 shadow-sm ${item.color}`}>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-3">{item.label}</p>
        <p className="text-3xl font-black italic tracking-tighter">{item.val}</p>
      </div>
    ))}
  </div>
</div>;

const StudentDashboard = () => (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <motion.span 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="text-red-600 font-black tracking-[0.3em] uppercase text-[10px] mb-2 block"
          >
            ÁREA DO ESTUDANTE
          </motion.span>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none text-white">BEM-VINDO AO <span className="text-red-600">MOVIMENTO</span></h1>
        </div>
      </header>

      <section>
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-8 flex items-center gap-3">
          <BookOpen size={16} /> MEUS TREINAMENTOS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="aspect-video bg-zinc-900/50 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-slate-600 border-dashed p-10 text-center gap-4">
            <p className="font-bold italic uppercase tracking-tighter text-lg">Você ainda não faz parte de nenhuma formação.</p>
            <Link to="/cursos" className="bg-white text-black px-6 py-2 rounded-full font-black uppercase text-[10px] hover:scale-105 transition-all">Explorar Catálogo</Link>
          </div>
        </div>
      </section>
    </div>
);

// Route Guards
const ProtectedRoute = ({ children, allowedRoles }: { children: ReactNode, allowedRoles?: string[] }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center font-mono animate-pulse">CARREGANDO...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/cursos" element={<Courses />} />
          <Route path="/cursos/:slug" element={<CourseDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/boss/acesso" element={<BossAccess />} />

          {/* BOSS Routes */}
          <Route path="/boss" element={
            <Navigate to="/boss/visao-geral" replace />
          } />

          <Route path="/boss/visao-geral" element={
            <ProtectedRoute allowedRoles={['SUPER_BOSS', 'BOSS_ADMIN', 'BOSS_FINANCEIRO', 'BOSS_RH', 'BOSS_MKT']}>
              <BossLayout>
                <BossOverview />
              </BossLayout>
            </ProtectedRoute>
          } />

          <Route path="/boss/cadastro" element={
            <ProtectedRoute allowedRoles={['SUPER_BOSS', 'BOSS_ADMIN']}>
              <BossLayout>
                <BossRegistration />
              </BossLayout>
            </ProtectedRoute>
          } />

          <Route path="/boss/cadastro/novo-aluno" element={
            <ProtectedRoute allowedRoles={['SUPER_BOSS', 'BOSS_ADMIN']}>
              <BossLayout>
                <BossNewStudent />
              </BossLayout>
            </ProtectedRoute>
          } />

          <Route path="/boss/cadastro/novo-aluno/matricular-curso" element={
            <ProtectedRoute allowedRoles={['SUPER_BOSS', 'BOSS_ADMIN']}>
              <BossLayout>
                <BossEnrollment />
              </BossLayout>
            </ProtectedRoute>
          } />

          <Route path="/boss/cadastro/ja-sou-aluno" element={
            <ProtectedRoute allowedRoles={['SUPER_BOSS', 'BOSS_ADMIN']}>
              <BossLayout>
                <BossExistingStudent />
              </BossLayout>
            </ProtectedRoute>
          } />

          <Route path="/boss/cadastro/ja-sou-aluno/matricular-curso" element={
            <ProtectedRoute allowedRoles={['SUPER_BOSS', 'BOSS_ADMIN']}>
              <BossLayout>
                <BossEnrollment />
              </BossLayout>
            </ProtectedRoute>
          } />

          <Route path="/boss/cadastro/matricula/financeiro" element={
            <ProtectedRoute allowedRoles={['SUPER_BOSS', 'BOSS_ADMIN', 'BOSS_FINANCEIRO']}>
              <BossLayout>
                <BossFinance />
              </BossLayout>
            </ProtectedRoute>
          } />

          <Route path="/boss/cursos" element={
            <ProtectedRoute allowedRoles={['SUPER_BOSS', 'BOSS_ADMIN']}>
              <BossLayout>
                <BossCourses />
              </BossLayout>
            </ProtectedRoute>
          } />

          <Route path="/boss/alunos" element={
            <ProtectedRoute allowedRoles={['SUPER_BOSS', 'BOSS_ADMIN']}>
              <BossLayout>
                <BossStudents />
              </BossLayout>
            </ProtectedRoute>
          } />

          <Route path="/boss/configuracoes-gerais" element={
            <ProtectedRoute allowedRoles={['SUPER_BOSS', 'BOSS_ADMIN', 'BOSS_MKT']}>
              <BossLayout>
                <BossGeneralSettings />
              </BossLayout>
            </ProtectedRoute>
          } />

          <Route path="/boss/configuracoes-gerais/home-publica" element={
            <ProtectedRoute allowedRoles={['SUPER_BOSS', 'BOSS_ADMIN', 'BOSS_MKT']}>
              <BossLayout>
                <BossHomeManager />
              </BossLayout>
            </ProtectedRoute>
          } />

          {/* Student Routes */}
          <Route path="/aluno" element={
            <ProtectedRoute allowedRoles={['ALUNO', 'SUPER_BOSS', 'PROFESSOR']}>
              <StudentLayout>
                <StudentDashboard />
              </StudentLayout>
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
