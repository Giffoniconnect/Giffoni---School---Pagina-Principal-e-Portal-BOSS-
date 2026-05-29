import { motion } from 'motion/react';
import { Eye } from 'lucide-react';

export default function VisionSection() {
  return (
    <section className="py-12 bg-black border-t border-white/5 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-zinc-950 border border-white/5 rounded-3xl p-8 md:p-12 hover:border-red-600/30 transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl -z-10 group-hover:bg-red-600/15" />
          <div className="flex gap-4 items-center mb-6">
            <div className="w-14 h-14 bg-red-600/10 text-red-600 rounded-xl flex items-center justify-center shrink-0">
              <Eye size={28} />
            </div>
            <div>
              <span className="text-red-500 font-extrabold text-[9px] tracking-widest uppercase">Seção 06 — Projeção</span>
              <h3 className="text-xl md:text-2xl font-black uppercase text-white italic tracking-tight">
                Nossa Visão de Futuro
              </h3>
            </div>
          </div>
          
          <p className="text-slate-400 text-sm md:text-lg font-semibold leading-relaxed uppercase tracking-wider">
            Consolidar o maior e mais eficiente ecossistema integrado de aceleração e transição técnica, operacional e digital do mercado corporativo jurídico 
            da América Latina, conectando teoria à execução empresarial de alta performance todos os dias.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
