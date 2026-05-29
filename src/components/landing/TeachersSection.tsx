import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ArrowRight, User, BookOpen, Star, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function TeachersSection() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'PROFESSOR'));
    getDocs(q).then((snap) => {
      setTeachers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }).catch((err) => {
      console.error("Firestore loading error for teachers, displaying fallbacks:", err);
      setLoading(false);
    });
  }, []);

  const defaultTeachers = [
    {
      id: "t1",
      displayName: "Dr. Thiago Giffoni",
      specialization: "Execução, Gestão Estratégica & BOSS Core",
      bio: "Advogado corporativo experiente, desenvolvedor do método de governança jurídica BOSS. Fundador de escritórios com faturamento elevado.",
      courses: ["Master BOSS: Gestão de Processos", "Mentoria Giffoni Connect de Resultados"]
    },
    {
      id: "t2",
      displayName: "Profa. Mariana Costa",
      specialization: "Inteligência Artificial e Robótica Jurídica",
      bio: "Pesquisadora de automação e engenheira de prompts. Especialista em integrar o GPT, chatbots de WhatsApp e rotinas aos fluxos do BOSS.",
      courses: ["Legal IA & Automação Completa", "Chatbots e Conversão no WhatsApp"]
    },
    {
      id: "t3",
      displayName: "Dr. Felipe Santos",
      specialization: "Controladoria Digital & Legal Operations",
      bio: "Focado em análise e KPI de produção. Mentor de controladoria, estruturação física e auditorias de processos em grandes escritórios.",
      courses: ["Formação Completa em Legal Ops", "Advanced Controladoria de Sucesso"]
    }
  ];

  const displayedTeachers = teachers.length > 0 
    ? teachers.map(t => ({
        id: t.id,
        displayName: t.displayName || t.fullName || "Professor Cadastrado",
        specialization: t.specialization || "Especialista Giffoni School",
        bio: t.bio || "Membro docente convidado atuando na mentoria jurídica do BOSS.",
        courses: t.courses || ["Cursos de Especialização Estendida"]
      }))
    : defaultTeachers;

  return (
    <section className="py-24 px-6 bg-black border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto space-y-16">
        
        <div className="text-center space-y-4">
          <span className="text-red-600 font-bold tracking-[0.3em] uppercase text-[10px] block">
            Nossos Mentores e Instrutores
          </span>
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white leading-none">
            Corpo Docente de Elite <br />
            <span className="text-slate-400">Só quem executa na prática</span>
          </h2>
          <p className="max-w-xl mx-auto text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Livre-se de professores teóricos em direito. Nosso time de mentores vive do faturamento e resultado de seus próprios escritórios diariamente.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">
            Obtendo Docentes Credenciados...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {displayedTeachers.map((tc, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                key={tc.id}
                className="bg-zinc-950 border border-white/5 rounded-3xl p-8 hover:border-red-600/30 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-6">
                  {/* Photo/Avatar frame */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-white/10 text-slate-400 flex items-center justify-center shrink-0 group-hover:border-red-600 transition-all relative overflow-hidden">
                      <User size={30} className="group-hover:scale-105 transition-all text-zinc-700" />
                      <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white uppercase italic tracking-tight flex items-center gap-1.5">
                        {tc.displayName} <Star size={14} className="text-red-500 fill-red-500 shrink-0" />
                      </h3>
                      <p className="text-red-500 font-extrabold text-[10px] tracking-widest uppercase">
                        {tc.specialization}
                      </p>
                    </div>
                  </div>

                  <p className="text-slate-400 text-xs font-semibold leading-relaxed uppercase tracking-wider">
                    {tc.bio}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                    <BookOpen size={12} className="text-red-600" />
                    <span>Leciona as Disciplinas:</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {tc.courses.map((c: string, i: number) => (
                      <span key={i} className="text-[10px] bg-black/50 border border-zinc-900 text-slate-300 font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
