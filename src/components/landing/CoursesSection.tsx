import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Course } from '../../types';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, BookOpen, Clock, User } from 'lucide-react';
import { motion } from 'motion/react';

export default function CoursesSection() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'courses'), where('status', '==', 'published'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));
      setLoading(false);
    }, (error) => {
      console.error("Firestore loading error, displaying high-fidelity fallbacks:", error);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Default high quality fallback courses for Giffoni School
  const fallbackCourses = [
    {
      id: "fallback-1",
      title: "Master BOSS: Métodos de Gestão Jurídica Operacional",
      slug: "master-boss-gestao",
      description: "Aprenda a mapear fluxos, definir comissões, gerenciar comissões e liberar o fundador da dependência operacional definitiva.",
      price: 1997.00,
      category: "Gestão Jurídica",
      teacherId: "Thiago Giffoni",
      thumbnailUrl: "",
      teacherName: "Dr. Thiago Giffoni"
    },
    {
      id: "fallback-2",
      title: "Legal IA: Automação Inteligente e IA para Petições",
      slug: "legal-ia-automacao",
      description: "Integração prática de bots de WhatsApp, minutas inteligentes com GPT e automação robusta de rotinas diárias.",
      price: 1497.00,
      category: "Inteligência Artificial",
      teacherId: "Mariana Costa",
      thumbnailUrl: "",
      teacherName: "Profa. Mariana Costa"
    },
    {
      id: "fallback-3",
      title: "Formação em Legal Ops e Controladoria de Sucesso",
      slug: "legal-ops-controladoria",
      description: "Organize prazos e crie dashboards analíticos no Portal BOSS com foco absoluto em lucratividade e zero retrabalho em equipe.",
      price: 1297.00,
      category: "Operações",
      teacherId: "Felipe Santos",
      thumbnailUrl: "",
      teacherName: "Dr. Felipe Santos"
    }
  ];

  const displayedCourses = courses.length > 0 ? courses : fallbackCourses;

  return (
    <section id="cursos-disponiveis" className="py-24 px-6 bg-zinc-950 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto space-y-16">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <span className="text-red-600 font-bold tracking-[0.3em] uppercase text-[10px] block">
              Formações Elite
            </span>
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white leading-none">
              Nossos Métodos & <br />
              <span className="text-zinc-500">Cursos de Execução</span>
            </h2>
            <p className="max-w-xl text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Playbooks estratégicos focados na ação imediata. Módulos integrados de forma nativa ao Portal BOSS.
            </p>
          </div>
          <Link
            to="/cursos"
            className="group inline-flex items-center gap-2 bg-white text-black hover:bg-red-600 hover:text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-colors self-start"
          >
            Ver todos as formações <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-slate-500 font-bold tracking-widest text-xs uppercase animate-pulse">
            Obtendo Métodos do Portal BOSS...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {displayedCourses.map((course, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                key={course.id}
                className="bg-black border border-white/5 rounded-3xl overflow-hidden hover:border-red-600/30 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="aspect-[16/10] bg-zinc-900 overflow-hidden relative border-b border-white/5 grayscale group-hover:grayscale-0 transition-all duration-500">
                    {course.thumbnailUrl ? (
                      <img 
                        src={course.thumbnailUrl} 
                        alt={course.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black text-red-600/30">
                        <Play size={44} className="group-hover:scale-110 group-hover:text-red-500 transition-all" />
                      </div>
                    )}
                    <span className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                      {course.category}
                    </span>
                  </div>

                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight group-hover:text-red-500 transition-colors leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-slate-400 text-xs font-semibold leading-relaxed uppercase tracking-wider line-clamp-3">
                      {course.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-6">
                  {/* Metadata Row */}
                  <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-bold uppercase border-t border-white/5 pt-4">
                    <div className="flex items-center gap-1.5">
                      <User size={12} className="text-red-600" />
                      <span>{course.teacherId || 'Corpo Docente Giffoni'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-red-600" />
                      <span>Carga Horária: 32h</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold tracking-tighter text-white">
                      R$ {course.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <Link
                      to={`/cursos/${course.slug}`}
                      className="text-[10px] font-black uppercase tracking-widest bg-zinc-900 text-white group-hover:bg-red-600 px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      Acessar Método <ArrowRight size={10} />
                    </Link>
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
