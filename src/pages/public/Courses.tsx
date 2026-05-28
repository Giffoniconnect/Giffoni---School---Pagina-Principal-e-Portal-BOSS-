import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Course } from '../../types';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Play } from 'lucide-react';
import { motion } from 'motion/react';

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'courses'), where('status', '==', 'published'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'courses');
    });
    return unsubscribe;
  }, []);

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black italic">CARREGANDO...</div>;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white pb-40">
      {/* Header */}
      <header className="pt-32 pb-20 px-6 max-w-7xl mx-auto border-b border-white/10">
        <div className="mb-10">
          <Link to="/" className="text-slate-500 hover:text-white text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 transition-colors group">
            <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> Voltar ao Início
          </Link>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-red-600 font-bold tracking-[0.3em] uppercase text-xs mb-4 block"
            >
              FORMAÇÃO ELITE
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none"
            >
              Cursos & <span className="text-zinc-800">Métodos</span>
            </motion.h1>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="PESQUISAR..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border-none rounded-full py-4 pl-12 pr-6 text-sm font-bold tracking-widest focus:ring-2 focus:ring-red-600 transition-all outline-none"
            />
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredCourses.map((course, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={course.id}
                className="group relative"
              >
                <Link to={`/cursos/${course.slug}`}>
                  <div className="aspect-[16/10] bg-zinc-900 rounded-3xl overflow-hidden mb-6 relative border border-white/5 grayscale group-hover:grayscale-0 transition-all duration-500">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play size={40} className="text-zinc-800 group-hover:text-red-600 transition-colors" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-red-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                        {course.category}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2 group-hover:text-red-500 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-slate-500 line-clamp-2 text-sm leading-relaxed mb-4">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-xl font-bold tracking-tighter">
                      R$ {course.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                      Ver Mais <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 border-2 border-dashed border-white/5 rounded-3xl">
            <p className="text-slate-600 font-bold uppercase tracking-widest italic">
              NENHUM MÉTODO ENCONTRADO PARA "{searchTerm}"
            </p>
          </div>
        )}
      </main>

      {/* CTA Footer */}
      <section className="py-40 px-6 text-center">
        <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase mb-12">
          Transforme sua <br/> <span className="text-red-600">CARREIRA</span>
        </h2>
        <button className="bg-white text-black px-12 py-5 rounded-full font-black uppercase text-sm hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)]">
          Falar com Consultor
        </button>
      </section>
    </div>
  );
}
