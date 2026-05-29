import { motion } from 'motion/react';
import { ArrowDown, GraduationCap, LayoutDashboard, UserCheck, HeartHandshake, Wrench, Cpu, Compass } from 'lucide-react';

export default function EcosystemSection() {
  const steps = [
    { icon: GraduationCap, title: "Giffoni School", detail: "Formações, playbooks e métodos para aprender com quem pratica todos os dias na advocacia real de performance." },
    { icon: LayoutDashboard, title: "Portal BOSS", detail: "O centro de admissão, controle de comissionamentos, turmas de professores e monitoramento financeiro unificado." },
    { icon: UserCheck, title: "Portal do Aluno", detail: "Sua sala VIP com cronograma de aulas, materiais práticos complementares para baixar e rastreamento de progresso." },
    { icon: HeartHandshake, title: "Comunidade Estendida", detail: "Espaço exclusivo para alunos, facilitando indicações de clientes e parcerias em larga escala." },
    { icon: Wrench, title: "Ferramentas & Templates", desc: "Documentos padrão, planilhas e scripts prontos para usar no seu negócio jurídico." },
    { icon: Cpu, title: "Automações Unificadas", desc: "Estruturas de chatbot, IA de relatórios e conectores integrados diretamente via API." },
    { icon: Compass, title: "Implementação Assistida", desc: "Acompanhamento cirúrgico e auditorias em reuniões com nossa equipe de mentores experientes." }
  ];

  return (
    <section className="py-24 px-6 bg-zinc-950 border-t border-white/5 relative overflow-hidden">
      {/* Visual neon circles */}
      <div className="absolute right-0 top-1/4 w-80 h-80 bg-red-600/5 rounded-full blur-[80px]" />
      <div className="absolute left-0 bottom-1/4 w-80 h-80 bg-slate-600/5 rounded-full blur-[80px]" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        
        <div className="text-center space-y-4">
          <span className="text-red-600 font-bold tracking-[0.3em] uppercase text-[10px] block">
            Nossa estrutura integrada
          </span>
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white leading-none">
            Ecossistema Giffoni <br />
            <span className="text-zinc-500">Unificação Tecnológica e Gestão</span>
          </h2>
          <p className="max-w-2xl mx-auto text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Mostramos como cada peça do nosso ecossistema interage para prover uma infraestrutura que multiplica a produtividade dos advogados.
          </p>
        </div>

        {/* Visual Workflow Steps (Flex & Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                key={idx}
                className="bg-black/90 border border-white/5 p-6 rounded-3xl relative group flex flex-col justify-between hover:border-red-600/30 transition-all duration-300"
              >
                <div className="space-y-6">
                  <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all">
                    <Icon size={22} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-black text-white uppercase italic tracking-tight flex items-center gap-2">
                      {st.title}
                    </h3>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest leading-relaxed">
                      {st.detail || st.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-6 flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-zinc-600 group-hover:text-red-500 transition-colors">
                  <span>ECO CONECTADO</span>
                  <span>// 0{idx + 1}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Visual connection indicator */}
        <div className="flex flex-col items-center justify-center gap-2 pt-6 text-slate-500 animate-pulse">
          <span className="text-[10px] font-black uppercase tracking-widest">Sincronização Ativa em Tempo Real</span>
          <ArrowDown size={14} className="text-red-600" />
        </div>

      </div>
    </section>
  );
}
