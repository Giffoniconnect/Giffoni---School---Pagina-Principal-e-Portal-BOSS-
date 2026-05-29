import { motion } from 'motion/react';
import { ShieldCheck, Server, Brain, Link } from 'lucide-react';

export default function WhoWeAreSection() {
  const connections = [
    { icon: ShieldCheck, title: "Giffoni Advocacia", desc: "Laboratório real. Todos os nossos métodos de gestão de equipe e de processos são testados diariamente em operações complexas de contencioso e consultivo." },
    { icon: Server, title: "Giffoni Connect & Portal BOSS", desc: "A infraestrutura proprietária que une o financeiro, o faturamento, os contratos e as metas operacionais de todas as unidades conectadas." },
    { icon: Brain, title: "Inteligência Artificial & Automação", desc: "Não ensinamos teoria. Entregamos modelos prontos de IA generativa para triagem de petições, minutas, relatórios de provisionamento e bônus." }
  ];

  return (
    <section className="py-24 px-6 bg-zinc-950 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        
        {/* Narrativa institucional */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <span className="text-red-600 font-bold tracking-[0.3em] uppercase text-[10px] block">
              Quem Somos — Origens Práticas
            </span>
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white leading-none">
              Nascidos na prática <br />
              <span className="text-zinc-500">não na teoria acadêmica</span>
            </h2>
          </div>
          <p className="text-slate-400 text-sm font-semibold leading-relaxed uppercase tracking-wider">
            A Giffoni School não é uma instituição de ensino tradicional voltada para meros diplomas. 
            Nós somos a divisão educacional e operacional da Giffoni Connect. 
            Todas as formações e playbooks são idealizados diretamente de dentro de um ecossistema operacional de alta performance jurídica.
          </p>
          <p className="text-zinc-500 text-xs uppercase leading-relaxed font-bold">
            Entregamos o ecossistema perfeito: o método prático que gerou alto faturamento repetível, alinhado à automação tecnológica integral com inteligência analítica e ferramentas proprietárias do Portal BOSS.
          </p>
        </motion.div>

        {/* Quadro de conexões em cards */}
        <div className="space-y-6">
          {connections.map((conn, idx) => {
            const Icon = conn.icon;
            return (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                key={idx}
                className="bg-black border border-white/5 p-6 rounded-2xl flex gap-6 hover:border-red-600/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-zinc-900 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={20} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                    {conn.title}
                  </h3>
                  <p className="text-slate-400 text-xs font-semibold leading-relaxed uppercase tracking-widest text-[10px]">
                    {conn.desc}
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
