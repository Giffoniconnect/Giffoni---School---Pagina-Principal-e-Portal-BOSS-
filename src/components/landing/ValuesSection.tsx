import { motion } from 'motion/react';
import { Shield, Cpu, BookOpen, Crown, Award, Users, Gem } from 'lucide-react';

export default function ValuesSection() {
  const values = [
    { icon: Shield, title: "Ética Inabalável", desc: "Comprometimento absoluto com a transparência, conformidade legal e integridade profunda nos processos." },
    { icon: Cpu, title: "Inovação Disruptiva", desc: "Aplicação diária de ferramentas modernas de inteligência artificial, no-code e bots automatizados." },
    { icon: BookOpen, title: "Educação Prática", desc: "Aulas sem firulas teóricas desnecessárias, focadas estritamente naquilo que otimiza o dia a dia." },
    { icon: Crown, title: "Tecnologia como Alavanca", desc: "Investimento em infraestrutura tecnológica para liberar o potencial humano criativo." },
    { icon: Award, title: "Resultado Concreto", desc: "Métricas claras, indicadores em tempo real e conversão das operações em faturamento dinâmico." },
    { icon: Users, title: "Colaboração", desc: "Ambiente interconectado de compartilhamento onde alunos ajudam a expandir redes de negócios." },
    { icon: Gem, title: "Aprendizado Contínuo", desc: "Evolução incansável para liderar as aceleradas mudanças regulatórias e tecnológicas jurídicas." }
  ];

  return (
    <section className="py-16 bg-black border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-4">
          <span className="text-red-600 font-bold tracking-[0.3em] uppercase text-[10px] block">
            Seção 07 — Valores
          </span>
          <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-white leading-none">
            Nossos Valores Fundamentais
          </h2>
          <p className="max-w-2xl mx-auto text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Os pilares culturais que ditam a dedicação dos nossos mentores na formação de advogados de excelência.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, idx) => {
            const Icon = v.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                key={idx}
                className="bg-zinc-950/60 border border-white/5 p-6 rounded-2xl flex flex-col justify-between hover:border-red-600/30 transition-all duration-300 group"
              >
                <div className="space-y-4">
                  <div className="text-red-500 bg-neutral-900 w-10 h-10 rounded-xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
                    <Icon size={18} />
                  </div>
                  <h4 className="text-sm font-black text-white uppercase italic tracking-wider">
                    {v.title}
                  </h4>
                  <p className="text-slate-400 text-[10px] font-semibold leading-relaxed uppercase tracking-widest leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
