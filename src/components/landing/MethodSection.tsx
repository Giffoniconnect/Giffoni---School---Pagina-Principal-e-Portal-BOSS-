import { motion } from 'motion/react';
import { BookOpen, Hammer, Cpu, Rocket, LineChart, TrendingUp } from 'lucide-react';

export default function MethodSection() {
  const steps = [
    {
      icon: BookOpen,
      num: "01",
      title: "Aprender",
      desc: "Fundamentar conceitos essenciais e práticos, livrando-se das teorias jurídicas acadêmicas obsoletas."
    },
    {
      icon: Hammer,
      num: "02",
      title: "Implementar",
      desc: "Desenhar fluxos operacionais estruturados e colocar os playbooks em prática de forma imediata."
    },
    {
      icon: Cpu,
      num: "03",
      title: "Automatizar",
      desc: "Substituir processos repetíveis e trabalhos mecânicos por tecnologia pura, inteligência artificial e chatbots."
    },
    {
      icon: Rocket,
      num: "04",
      title: "Escalar",
      desc: "Expandir o volume de atendimento e fechamento de novos contratos sem precisar multiplicar as contratações."
    },
    {
      icon: LineChart,
      num: "05",
      title: "Controlar",
      desc: "Visualizar toda a operação, metas e comissões através dos painéis analíticos do ecossistema Connect."
    },
    {
      icon: TrendingUp,
      num: "06",
      title: "Crescer",
      desc: "Elevar o patamar financeiro e consolidar faturamento estruturado, ético e totalmente sustentável."
    }
  ];

  return (
    <section id="metodo" className="py-24 px-6 bg-black border-t border-white/5 relative overflow-hidden">
      {/* Decorative vertical background line and elements */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-red-600/10 to-transparent hidden lg:block" />

      <div className="max-w-7xl mx-auto space-y-20 relative z-10">
        <div className="text-center space-y-4">
          <span className="text-red-600 font-bold tracking-[0.3em] uppercase text-[10px] block">
            Diferencial Operacional giffoni
          </span>
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white leading-none">
            O Método Giffoni <br />
            <span className="text-slate-400">Jornada de Execução Completa</span>
          </h2>
          <p className="max-w-xl mx-auto text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Uma engrenagem estruturada de ponta a ponta para guiar o profissional do caos operacional à liberdade corporativa de sucesso.
          </p>
        </div>

        {/* Vertical/Horizontal Journey list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.08 }}
                key={idx}
                className="bg-zinc-950/40 border border-white/5 p-8 rounded-3xl hover:bg-neutral-900/30 hover:border-red-600/30 transition-all duration-300 relative group"
              >
                {/* Large numbering inside */}
                <div className="absolute top-6 right-8 text-6xl font-black italic text-zinc-900 select-none group-hover:text-red-600/10 transition-colors">
                  {step.num}
                </div>

                <div className="space-y-6">
                  <div className="w-12 h-12 bg-zinc-900 text-slate-300 group-hover:text-red-500 rounded-2xl flex items-center justify-center transition-all">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-2">
                      {step.title}
                    </h3>
                    <p className="text-slate-400 text-xs font-semibold leading-relaxed uppercase tracking-wider">
                      {step.desc}
                    </p>
                  </div>
                </div>

                {/* Vertical arrow/bullet connector indicators */}
                <div className="mt-6 flex items-center gap-2 text-zinc-700 text-[9px] font-black tracking-widest uppercase">
                  <span>ETAPA REALIZDA</span>
                  <div className="h-1 flex-1 bg-zinc-900 bg-gradient-to-r from-red-600/50 to-transparent group-hover:from-red-600 transition-all rounded" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
