import { motion } from 'motion/react';
import { Users, BookOpen, GraduationCap, Clock, Award } from 'lucide-react';

export default function StatsSection() {
  const stats = [
    { icon: Users, value: "5.400+", label: "Alunos Admitidos" },
    { icon: BookOpen, value: "14+", label: "Métodos & Cursos" },
    { icon: GraduationCap, value: "28+", label: "Docentes Ativos" },
    { icon: Clock, value: "350h+", label: "Conteúdo Gravado" },
    { icon: Award, value: "12.000+", label: "Acessos Registrados" }
  ];

  return (
    <section className="py-20 bg-black border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          {stats.map((st, idx) => {
            const Icon = st.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                key={idx}
                className="bg-zinc-950/40 border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center justify-between hover:border-red-600/20 transition-all duration-300"
              >
                <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-red-500 mb-4 shrink-0">
                  <Icon size={18} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">
                    {st.value}
                  </h3>
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest leading-normal">
                    {st.label}
                  </p>
                </div>
                <span className="text-[7px] font-black text-zinc-700 tracking-wider uppercase mt-4 block">PORTAL BOSS METRIC //</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
