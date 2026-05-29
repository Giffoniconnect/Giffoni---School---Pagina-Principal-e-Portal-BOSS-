import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CtaSection() {
  const handleScrollToCursos = () => {
    const el = document.getElementById('cursos-disponiveis');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToFaq = () => {
    const el = document.getElementById('faq-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-32 px-6 bg-black relative overflow-hidden border-t border-white/5">
      {/* Visual Glowing Frame background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-5xl mx-auto text-center space-y-10 relative z-10">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/20 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-[0.2em]">
          <Sparkles size={10} />
          <span>GARANTA SUA VAGA NA PRÓXIMA TURMA</span>
        </div>

        <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase text-white leading-none">
          Pare de perder tempo com teorias. <br />
          <span className="text-red-600">Assuma as rédeas da execução.</span>
        </h2>

        <p className="max-w-2xl mx-auto text-slate-400 text-xs sm:text-base font-semibold uppercase tracking-wider leading-relaxed">
          O mercado jurídico está mudando em velocidade recorde. 
          Quem se recusa a otimizar processos, programar comissões e operar com IA será superado. 
          Una-se à elite da Giffoni School hoje.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <button
            onClick={handleScrollToCursos}
            className="w-full sm:w-auto group relative bg-red-600 text-white hover:bg-white hover:text-black px-10 py-5 rounded-full font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_40px_rgba(220,38,38,0.3)] active:scale-95"
          >
            Começar Agora <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={handleScrollToCursos}
            className="w-full sm:w-auto bg-zinc-900 border border-zinc-800 text-white hover:border-white px-10 py-5 rounded-full font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300 active:scale-95"
          >
            Conhecer Cursos
          </button>

          <button
            onClick={handleScrollToFaq}
            className="w-full sm:w-auto bg-transparent border border-zinc-800 text-slate-400 hover:text-white px-10 py-5 rounded-full font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300"
          >
            Falar com a Equipe
          </button>
        </div>

      </div>
    </section>
  );
}
