import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Quote, Star } from 'lucide-react';

export default function TestimonialsSection() {
  const [index, setIndex] = useState(0);

  const list = [
    {
      name: "Dr. Roberto Albuquerque",
      role: "Sócio do Albuquerque Advogados",
      text: "O método Master BOSS de gestão de processos revolucionou nossa controladoria. Em apenas 4 meses eliminamos o retrabalho de controle de prazos e liberamos nossa equipe para novas aquisições de carteiras.",
      origin: "Curitiba - PR",
      stars: 5
    },
    {
      name: "Dra. Carolina Mendes",
      role: "Fundadora do Mendes & Associados",
      text: "A automação de petições e triagem assistida por IA que aprendemos e integramos via Portal Connect reduziu nosso tempo de elaboração de minutas de 2 horas para incríveis 10 minutos por caso.",
      origin: "São Paulo - SP",
      stars: 5
    },
    {
      name: "Dr. Gustavo Vasconcellos",
      role: "Diretor Jurídico da G&V Legal Ops",
      text: "Ter um dashboard analítico me permitiu enxergar o real bônus de performance de cada professor e equipe. Uma verdadeira imersão tecnológica para advogados modernos e faturadores.",
      origin: "Belo Horizonte - MG",
      stars: 5
    }
  ];

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % list.length);
  };

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + list.length) % list.length);
  };

  const active = list[index];

  return (
    <section className="py-24 px-6 bg-zinc-950 border-t border-white/5 relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-16">
        
        <div className="text-center space-y-4">
          <span className="text-red-600 font-bold tracking-[0.3em] uppercase text-[10px] block">
            RESULTADOS COMPROVADOS POR ADVOGADOS
          </span>
          <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white leading-none">
            Depoimentos & Prova Social
          </h2>
          <p className="max-w-xl mx-auto text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Veja o que dizem os sócios de escritórios que saíram do caos operacional e atingiram o topo de escala corporativa.
          </p>
        </div>

        {/* Carousel Block */}
        <div className="bg-black border border-white/5 rounded-3xl p-8 md:p-12 relative flex flex-col justify-between space-y-8 min-h-[300px]">
          
          <div className="absolute top-6 right-8 text-neutral-800 pointer-events-none">
            <Quote size={80} className="opacity-10" />
          </div>

          <div className="space-y-6">
            <div className="flex gap-1 text-red-500">
              {[...Array(active.stars)].map((_, i) => (
                <Star key={i} size={14} className="fill-red-500" />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-white text-base md:text-xl font-normal normal-case leading-relaxed italic"
              >
                "{active.text}"
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6 border-t border-white/5">
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider">
                {active.name}
              </h4>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                {active.role} — <span className="text-red-500">{active.origin}</span>
              </p>
            </div>

            {/* Slider Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                className="w-10 h-10 border border-zinc-800 text-slate-400 hover:text-white rounded-full flex items-center justify-center transition-all bg-zinc-950 hover:border-red-600 active:scale-95"
              >
                <ArrowLeft size={16} />
              </button>
              <span className="text-xs font-black uppercase tracking-widest text-zinc-600">
                0{index + 1} / 0{list.length}
              </span>
              <button
                onClick={handleNext}
                className="w-10 h-10 border border-zinc-800 text-slate-400 hover:text-white rounded-full flex items-center justify-center transition-all bg-zinc-950 hover:border-red-600 active:scale-95"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
