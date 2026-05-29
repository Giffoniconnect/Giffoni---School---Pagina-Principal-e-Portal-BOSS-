import { motion } from 'motion/react';
import { ArrowRight, Settings, CheckSquare, Cpu, Trophy, Sparkles } from 'lucide-react';

export default function ActionPlanSection() {
  const steps = [
    {
      icon: Settings,
      num: "01",
      title: "Diagnóstico e Mapeamento Operacional",
      desc: "Análise profunda de gargalos operacionais e desperdício de horas úteis faturáveis em seu escritório."
    },
    {
      icon: CheckSquare,
      num: "02",
      title: "Modelagem e Desenho de Processos",
      desc: "Padronização e documentação dos fluxos de trabalho usando os playbooks exclusivos do Portal BOSS."
    },
    {
      icon: Cpu,
      num: "03",
      title: "Integração Tecnológica & Automação IA",
      desc: "Implementação direta de robôs de triagem, contratos automatizados e integradores Giffoni Connect."
    },
    {
      icon: Trophy,
      num: "04",
      title: "Gestão Analítica de Metas e Escalonamento",
      desc: "Acompanhamento em tempo real via dashboard do BOSS com feedback constante e comissões programadas."
    }
  ];

  return (
    <section className="py-24 px-6 bg-black border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto space-y-20 relative">
        
        <div className="text-center space-y-4">
          <span className="text-red-600 font-bold tracking-[0.3em] uppercase text-[10px] block">
            Plano Estratégico de Ação
          </span>
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white leading-none">
            Você não recebe apenas aulas. <br />
            <span className="text-zinc-500">Você recebe um plano de execução.</span>
          </h2>
          <p className="max-w-xl mx-auto text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Não paramos no conteúdo gravado. Guiamos sua jornada passo a passo até colher os frutos operacionais e financeiros.
          </p>
        </div>

        {/* Timeline Layout */}
        <div className="relative border-l border-zinc-800 ml-4 md:ml-10 space-y-12 max-w-4xl mx-auto">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                key={idx}
                className="relative pl-10 md:pl-16 group"
              >
                {/* Visual Circle Indicator on the line */}
                <div className="absolute left-[-16px] top-1 w-8 h-8 rounded-full bg-zinc-950 border-2 border-zinc-800 text-red-600 flex items-center justify-center font-black text-xs group-hover:border-red-600 group-hover:bg-red-950 transition-colors">
                  {step.num}
                </div>

                <div className="bg-zinc-950 border border-white/5 p-6 md:p-8 rounded-3xl space-y-4 hover:border-red-600/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="text-red-500 bg-red-950/20 p-2 rounded-xl">
                      <Icon size={18} />
                    </div>
                    <h3 className="text-base md:text-xl font-black text-white uppercase italic tracking-tight">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-slate-400 text-xs font-semibold leading-relaxed uppercase tracking-wider">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}

          {/* Result Block */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative pl-10 md:pl-16 pt-6"
          >
            <div className="absolute left-[-18px] top-6 w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center font-black animate-bounce shadow-[0_0_15px_rgba(220,38,38,0.4)]">
              ★
            </div>
            <div className="bg-gradient-to-r from-red-950/40 to-black border border-red-500/30 p-8 rounded-3xl space-y-3">
              <span className="text-red-500 font-extrabold text-[10px] tracking-widest uppercase flex items-center gap-1.5">
                <Sparkles size={12} /> RESULTADO ALCANÇADO
              </span>
              <h4 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter text-white">
                Operação Jurídica Autogerenciável & Faturamento Previsível
              </h4>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed uppercase tracking-wider">
                Sua advocacia tracionada, relatórios automáticos no Giffoni Connect e liberdade do sócio fundador para novas metas corporativas.
              </p>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
