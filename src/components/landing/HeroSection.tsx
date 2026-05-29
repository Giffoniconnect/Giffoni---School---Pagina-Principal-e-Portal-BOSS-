import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  const handleScrollToCursos = () => {
    const el = document.getElementById('cursos-disponiveis');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToContact = () => {
    const el = document.getElementById('faq-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-36 pb-20 bg-radial from-slate-900 via-black to-black">
      {/* Visual glowing grids in background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -z-10 w-[600px] h-[300px] bg-red-600/10 rounded-full blur-[120px]" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/40 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-[0.25em]"
        >
          <Sparkles size={12} className="animate-pulse" />
          <span>GIFFONI SCHOOL — PORTAL BOSS</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-8xl font-black italic tracking-tighter leading-[0.9] uppercase text-white"
        >
          O futuro da advocacia <br />
          é da <span className="text-red-600">gestão</span> e da <span className="text-slate-400">execução</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl mx-auto text-slate-400 text-sm md:text-lg font-medium leading-relaxed uppercase tracking-wider"
        >
          Basta de teoria improdutiva. Domine os métodos de automação operacional, 
          inteligência de processos jurídicos e escalabilidade real que impulsionam o seu escritório ao topo.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
        >
          <button
            onClick={handleScrollToCursos}
            className="w-full sm:w-auto group relative bg-red-600 text-white hover:bg-white hover:text-black px-8 py-4 rounded-full font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_30px_rgba(220,38,38,0.25)] active:scale-95"
          >
            Conhecer Cursos <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <Link
            to="/login"
            className="w-full sm:w-auto bg-zinc-900 border border-zinc-800 text-white hover:border-white px-8 py-4 rounded-full font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300 active:scale-95"
          >
            Área do Aluno
          </Link>

          <button
            onClick={handleScrollToContact}
            className="w-full sm:w-auto bg-transparent border border-zinc-800 text-slate-400 hover:text-white px-8 py-4 rounded-full font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300"
          >
            Falar com a Equipe
          </button>
        </motion.div>
      </div>
    </section>
  );
}
