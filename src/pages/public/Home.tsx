import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Link } from 'react-router-dom';

// Import Modular Landing Page Sections
import HeroSection from '../../components/landing/HeroSection';
import ProblemSection from '../../components/landing/ProblemSection';
import MethodSection from '../../components/landing/MethodSection';
import WhoWeAreSection from '../../components/landing/WhoWeAreSection';
import MissionSection from '../../components/landing/MissionSection';
import VisionSection from '../../components/landing/VisionSection';
import ValuesSection from '../../components/landing/ValuesSection';
import CoursesSection from '../../components/landing/CoursesSection';
import ActionPlanSection from '../../components/landing/ActionPlanSection';
import EcosystemSection from '../../components/landing/EcosystemSection';
import TeachersSection from '../../components/landing/TeachersSection';
import TestimonialsSection from '../../components/landing/TestimonialsSection';
import StatsSection from '../../components/landing/StatsSection';
import FaqSection from '../../components/landing/FaqSection';
import CtaSection from '../../components/landing/CtaSection';

interface SectionConfig {
  id: string;
  title: string;
  order: number;
  isActive: boolean;
}

const defaultSectionMetadata: SectionConfig[] = [
  { id: 'hero', title: 'Seção 1 — Hero Principal', order: 1, isActive: true },
  { id: 'problem', title: 'Seção 2 — O Problema', order: 2, isActive: true },
  { id: 'method', title: 'Seção 3 — O Método Giffoni', order: 3, isActive: true },
  { id: 'who-we-are', title: 'Seção 4 — Quem Somos', order: 4, isActive: true },
  { id: 'mission', title: 'Seção 5 — Missão', order: 5, isActive: true },
  { id: 'vision', title: 'Seção 6 — Visão', order: 6, isActive: true },
  { id: 'values', title: 'Seção 7 — Valores', order: 7, isActive: true },
  { id: 'courses', title: 'Seção 8 — Conheça Nossos Cursos', order: 8, isActive: true },
  { id: 'action-plan', title: 'Seção 9 — Plano de Ação', order: 9, isActive: true },
  { id: 'ecosystem', title: 'Seção 10 — Ecossistema Giffoni', order: 10, isActive: true },
  { id: 'teachers', title: 'Seção 11 — Professores', order: 11, isActive: true },
  { id: 'testimonials', title: 'Seção 12 — Depoimentos', order: 12, isActive: true },
  { id: 'stats', title: 'Seção 13 — Números da Escola', order: 13, isActive: true },
  { id: 'faq', title: 'Seção 14 — FAQ', order: 14, isActive: true },
  { id: 'cta', title: 'Seção 15 — CTA Final', order: 15, isActive: true }
];

export default function Home() {
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'home_sections'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbSections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      // Merge base metadata layout with database overrides for order and visibility toggling
      const merged = defaultSectionMetadata.map(def => {
        const dbMatch = dbSections.find(sec => sec.id === def.id);
        if (dbMatch) {
          return {
            ...def,
            isActive: dbMatch.isActive !== undefined ? dbMatch.isActive : def.isActive,
            order: dbMatch.order !== undefined ? Number(dbMatch.order) : def.order
          };
        }
        return def;
      });

      // Filter is active and sort by order index
      const activeAndSorted = merged
        .filter(s => s.isActive)
        .sort((a, b) => a.order - b.order);

      setSections(activeAndSorted);
      setLoading(false);
    }, (error) => {
      console.warn("Firestore 'home_sections' collection lookup warned (might not be created yet). Loading standard structural fallback layout:", error);
      // Fallback on permission/existence issues
      setSections(defaultSectionMetadata.filter(s => s.isActive));
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const renderSectionComponent = (id: string) => {
    switch (id) {
      case 'hero': return <HeroSection />;
      case 'problem': return <ProblemSection />;
      case 'method': return <MethodSection />;
      case 'who-we-are': return <WhoWeAreSection />;
      case 'mission': return <MissionSection />;
      case 'vision': return <VisionSection />;
      case 'values': return <ValuesSection />;
      case 'courses': return <CoursesSection />;
      case 'action-plan': return <ActionPlanSection />;
      case 'ecosystem': return <EcosystemSection />;
      case 'teachers': return <TeachersSection />;
      case 'testimonials': return <TestimonialsSection />;
      case 'stats': return <StatsSection />;
      case 'faq': return <FaqSection />;
      case 'cta': return <CtaSection />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="text-white text-3xl font-black italic tracking-tighter animate-pulse">
          GIFFONI <span className="text-red-600">SCHOOL</span>
        </div>
        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em]">Carregando Ecossistema...</span>
      </div>
    );
  }

  return (
    <div className="bg-black text-white selection:bg-red-600 selection:text-white min-h-screen flex flex-col justify-between">
      
      {/* Header / Brand Nav */}
      <nav className="fixed top-0 w-full z-50 p-6 flex justify-between items-center backdrop-blur-md bg-black/60 border-b border-white/5">
        <Link to="/" className="text-xl md:text-2xl font-black tracking-tighter italic text-white hover:text-red-500 transition-colors">
          GIFFONI <span className="text-red-600">SCHOOL</span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <a href="#metodo" className="hover:text-white transition-colors hidden sm:inline-block">O Método</a>
          <a href="#cursos-disponiveis" className="hover:text-white transition-colors">Formações</a>
          <Link 
            to="/login" 
            className="bg-white text-black px-5 py-2.5 rounded-full hover:bg-red-600 hover:text-white transition-all font-black text-[9px] uppercase tracking-widest"
          >
            Área do Aluno
          </Link>
        </div>
      </nav>

      {/* Structured Sections Mapping */}
      <main className="flex-grow">
        {sections.map((sec) => (
          <div key={sec.id}>
            {renderSectionComponent(sec.id)}
          </div>
        ))}

        {sections.length === 0 && (
          <div className="py-40 text-center text-slate-500 font-bold uppercase tracking-widest">
            Nenhuma seção ativa no momento.
          </div>
        )}
      </main>

      {/* Institutional Footer */}
      <footer className="bg-zinc-950 py-20 px-6 border-t border-white/5 text-center relative overflow-hidden">
        <div className="text-3xl font-black tracking-tighter italic mb-4 text-white">
          GIFFONI <span className="text-red-600">SCHOOL</span>
        </div>
        <p className="text-slate-500 text-xs max-w-md mx-auto mb-10 font-bold uppercase tracking-wider">
          Aceleração, mentoria e infraestrutura de alta performance jurídica integrada ao Giffoni Connect.
        </p>
        <div className="flex justify-center">
          <Link 
            to="/boss" 
            className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700 hover:text-red-600 transition-all border border-zinc-900 px-6 py-3 rounded-full hover:border-red-600/20"
          >
            Acesso Restrito Portal BOSS
          </Link>
        </div>
        <p className="text-zinc-800 text-[8px] font-black uppercase tracking-widest mt-12 select-none">
          © {new Date().getFullYear()} Giffoni Group. Todos os direitos reservados.
        </p>
      </footer>

    </div>
  );
}
