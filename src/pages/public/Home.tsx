import { useState, useEffect, Fragment } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { HomeSection } from '../../types';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'home_sections'),
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSections(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HomeSection)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'home_sections');
    });
    return unsubscribe;
  }, []);

  if (loading) return <div className="h-screen bg-black flex items-center justify-center"><div className="text-white text-2xl font-bold animate-pulse tracking-tighter">GIFFONI SCHOOL</div></div>;

  return (
    <div className="bg-black text-white selection:bg-red-600 selection:text-white">
      {/* Navigation (Placeholder) */}
      <nav className="fixed top-0 w-full z-50 p-6 flex justify-between items-center backdrop-blur-md bg-black/50 border-b border-white/10">
        <div className="text-2xl font-black tracking-tighter italic">GIFFONI SCHOOL</div>
        <div className="flex items-center gap-8 text-sm font-medium uppercase tracking-widest text-slate-400">
          <a href="#metodo" className="hover:text-white transition-colors">Método</a>
          <a href="#cursos" className="hover:text-white transition-colors">Formações</a>
          <Link to="/login" className="bg-white text-black px-6 py-2 rounded-full hover:bg-red-600 hover:text-white transition-all font-bold text-xs uppercase tracking-widest">Área do Aluno</Link>
        </div>
      </nav>

      {/* Dynamic Sections */}
      <main className="pt-24 min-h-screen">
        {sections.map((section) => (
          <Fragment key={section.id}>
            {section.type === 'hero' ? (
              <HeroSection data={section} />
            ) : (
              <GenericSection data={section} />
            )}
          </Fragment>
        ))}

        {sections.length === 0 && (
          <div className="h-[80vh] flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter mb-8 leading-none uppercase">
              O Futuro da <br/> <span className="text-red-600">ADVOCACIA</span>
            </h1>
            <p className="max-w-xl text-slate-400 text-lg md:text-xl font-medium mb-12">
              A plataforma independente que está transformando o direito em movimento.
            </p>
            <Link 
              to="/cursos"
              className="group relative bg-white text-black px-10 py-5 rounded-full font-black uppercase text-sm flex items-center gap-3 hover:bg-red-600 hover:text-white transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-95"
            >
              <div className="absolute inset-0 bg-white/40 blur-2xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              Conhecer Formações <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        )}
      </main>

      <footer className="bg-zinc-950 py-20 px-6 border-t border-white/5 text-center relative overflow-hidden">
        <div className="text-4xl font-black tracking-tighter italic mb-8">GIFFONI SCHOOL</div>
        <p className="text-slate-500 text-sm max-w-sm mx-auto mb-12">
          Transformando a advocacia através do método, ética e resultados. 
        </p>
        <div className="flex justify-center">
          <Link 
            to="/boss" 
            className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-800 hover:text-red-600 transition-colors border border-zinc-900 px-6 py-2 rounded-full"
          >
            Acesso Portal BOSS
          </Link>
        </div>
      </footer>
    </div>
  );
}

function HeroSection({ data }: { data: HomeSection }) {
  return (
    <section className="py-20 md:py-40 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
      <motion.span 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-red-600 font-bold tracking-[0.3em] uppercase text-xs mb-6"
      >
        O NOVO MOVIMENTO
      </motion.span>
      <motion.h1 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-6xl md:text-8xl font-black italic tracking-tighter leading-none uppercase mb-12"
      >
        {data.title}
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl text-slate-300 text-lg md:text-2xl font-light mb-16 leading-relaxed"
      >
        {data.subtitle}
      </motion.p>
      {data.ctaText && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Link
            to={data.ctaLink || "/cursos"}
            className="group relative bg-white text-black px-12 py-5 rounded-full font-black uppercase text-sm flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.15)] active:scale-95 inline-flex"
          >
            <div className="absolute inset-0 bg-white/40 blur-2xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            {data.ctaText} <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </motion.div>
      )}
    </section>
  );
}

function GenericSection({ data }: { data: HomeSection }) {
  return (
    <section className="py-20 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
        <div>
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-6 leading-none">
            {data.title}
          </h2>
          <p className="text-slate-400 text-lg md:text-xl font-light leading-relaxed mb-8">
            {data.subtitle}
          </p>
          {data.content && <div className="text-slate-500 whitespace-pre-wrap mb-10">{data.content}</div>}
        </div>
        {data.imageUrl && (
          <div className="aspect-square bg-zinc-900 rounded-3xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
            <img src={data.imageUrl} alt={data.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        )}
      </div>
    </section>
  );
}
