import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle, Mail, Phone } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const list: FaqItem[] = [
    {
      q: "A Giffoni School vende apenas videoaulas teóricas?",
      a: "Não. Focamos 100% em execução operacional. Ao se matricular em nossos cursos, você recebe playbooks documentados, setups de automação para ferramentas do mercado e templates que já são amplamente testados em escritórios de alto faturamento."
    },
    {
      q: "O que é o Portal BOSS e como ele se integra às aulas?",
      a: "O Portal BOSS é o sistema de governança da escola. Nele, a administração controla as matrículas, os perfis acadêmicos dos professores e do time financeiro, e futuramente será o conector de todo o ecossistema integrado para os alunos."
    },
    {
      q: "Preciso ter conhecimento avançado de tecnologia para automatizar meu escritório?",
      a: "Nossos cursos são desenhados para advogados e gestores de todos os níveis. Apresentamos fluxos de cliques guiados e disponibilizamos robôs pré-configurados que você pode adotar de forma modular sem escrever uma única linha de código."
    },
    {
      q: "As aulas concedem certificado de conclusão?",
      a: "Sim. Todas as formações concluídas na plataforma garantem a emissão automática de um certificado digital verificável com carga horária, atestando a especialização operacional do profissional."
    },
    {
      q: "Como falar com a equipe de vendas ou tirar dúvidas adicionais?",
      a: "Você pode clicar no botão 'Falar com a Equipe' para enviar uma mensagem direta via suporte Giffoni Connect, ou entrar em contato através dos nossos canais de e-mail institucional."
    }
  ];

  const handleToggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq-section" className="py-24 px-6 bg-zinc-950 border-t border-white/5 relative">
      <div className="max-w-4xl mx-auto space-y-16">
        
        <div className="text-center space-y-4">
          <span className="text-red-600 font-bold tracking-[0.3em] uppercase text-[10px] block">
            Dúvidas Frequentes
          </span>
          <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white leading-none">
            FAQ da Giffoni School
          </h2>
          <p className="max-w-xl mx-auto text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Consulte as respostas para as perguntas mais comuns de novos alunos e simplifique seu processo de decisão.
          </p>
        </div>

        {/* Faq Items Grid */}
        <div className="space-y-4">
          {list.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                className="bg-black border border-white/5 rounded-2xl overflow-hidden transition-colors hover:border-red-600/20"
              >
                <button
                  onClick={() => handleToggle(idx)}
                  className="w-full text-left p-6 flex justify-between items-center gap-4 text-white hover:text-red-500 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle size={18} className="text-red-500 shrink-0" />
                    <span className="font-bold uppercase text-xs sm:text-sm tracking-wider">
                      {item.q}
                    </span>
                  </div>
                  <ChevronDown 
                    size={18} 
                    className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180 text-red-500' : ''}`} 
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-6 pt-0 border-t border-white/5 text-slate-400 text-xs font-semibold leading-relaxed uppercase tracking-wider">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Contact direct buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 text-xs text-slate-500 font-bold uppercase tracking-widest">
          <span className="flex items-center gap-2">
            <Mail size={14} className="text-red-500" /> direito.rgr@gmail.com
          </span>
          <span className="flex items-center gap-2">
            <Phone size={14} className="text-red-500" /> SUPORTE CONNECT DISPONÍVEL
          </span>
        </div>

      </div>
    </section>
  );
}
