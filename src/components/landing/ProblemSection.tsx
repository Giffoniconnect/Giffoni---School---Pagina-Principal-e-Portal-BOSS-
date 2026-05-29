import { motion } from 'motion/react';
import { AlertCircle, RotateCcw, TrendingDown, Layers, Users, ShieldAlert, ZapOff } from 'lucide-react';

export default function ProblemSection() {
  const pains = [
    {
      icon: AlertCircle,
      title: "Falta de Organização",
      desc: "Tarefas perdidas em blocos e planilhas instáveis, ocasionando perda de prazos e sobrecarga mental extrema."
    },
    {
      icon: RotateCcw,
      title: "Retrabalho Constante",
      desc: "Atividades repetitivas que drenam o tempo valioso dos sócios e geradores de receita jurídica."
    },
    {
      icon: TrendingDown,
      title: "Crescimento Caótico",
      desc: "Aumento de receita seguido do colapso no atendimento e perda severa da margem de lucro operacional."
    },
    {
      icon: Layers,
      title: "Falta de Processos",
      desc: "Nenhum método padronizado ou fluxograma que permita a delegação segura a estagiários e juniores."
    },
    {
      icon: Users,
      title: "Equipe Desalinhada",
      desc: "Profissionais executando a operação de maneiras divergentes por falta de ferramentas e documentação."
    },
    {
      icon: ShieldAlert,
      title: "Dependência Operacional",
      desc: "Se o sócio fundador adoece ou decide sair de férias, o escritório inteiro deixa de faturar e produzir."
    },
    {
      icon: ZapOff,
      title: "Baixa Produtividade",
      desc: "Falta absoluta de automação e de uso correto de Inteligência Artificial para minutas e triagens."
    }
  ];

  return (
    <section className="py-24 px-6 bg-zinc-950 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <span className="text-red-600 font-bold tracking-[0.3em] uppercase text-[10px] block">
            O Grande Diagnóstico
          </span>
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white leading-none">
            As dores que travam os <br />
            <span className="text-zinc-500">escritórios de advocacia</span>
          </h2>
          <p className="max-w-xl mx-auto text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Se você se identifica com mais de dois cenários abaixo, sua operação está em risco iminente de estagnação.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pains.map((pain, idx) => {
            const Icon = pain.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                key={idx}
                className="bg-black border border-white/5 p-8 rounded-3xl hover:border-red-600/40 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 bg-zinc-900 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all rounded-2xl flex items-center justify-center mb-6">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-lg font-black text-white uppercase italic tracking-tight mb-2">
                    {pain.title}
                  </h3>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed uppercase tracking-wider">
                    {pain.desc}
                  </p>
                </div>
                <div className="text-[9px] font-black tracking-widest text-zinc-700 uppercase pt-4 transition-colors group-hover:text-red-500">
                  Giffoni Diagnóstico //
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
