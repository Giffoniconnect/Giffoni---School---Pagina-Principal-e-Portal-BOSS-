import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Course } from '../../types';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';
import BossCourseWizard from './BossCourseWizard';

export default function BossCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Wizard active triggers
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedCourseIdForWizard, setSelectedCourseIdForWizard] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'courses'), orderBy('title', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
      setCourses(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'courses');
    });
    return unsubscribe;
  }, []);

  const deleteCourse = async (courseId: string) => {
    if (confirm("Confirmar exclusão definitiva do curso selecionado?")) {
      try {
        await deleteDoc(doc(db, 'courses', courseId));
        toast.success('Capacidade educacional excluída com sucesso');
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'courses');
      }
    }
  };

  const filteredCourses = courses.filter(c =>
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isWizardOpen) {
    return (
      <BossCourseWizard 
        courseId={selectedCourseIdForWizard} 
        onClose={() => {
          setIsWizardOpen(false);
          setSelectedCourseIdForWizard(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-red-650 text-red-600 font-bold tracking-[0.3em] uppercase text-[10px] block mb-2">
            MÓDULO DE EXPANSÃO EDUCACIONAL
          </span>
          <h1 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">
            BOSS <span className="text-red-500">CURSOS</span>
          </h1>
          <p className="text-slate-500 font-medium">Gestão de formações, ementas e trilhas de treinamento</p>
        </div>
        <button
          onClick={() => {
            setSelectedCourseIdForWizard(null);
            setIsWizardOpen(true);
          }}
          className="bg-black text-white px-6 py-3.5 rounded-full flex items-center gap-2 hover:bg-slate-800 transition-all font-bold uppercase text-xs tracking-widest self-start"
        >
          <Plus size={18} />
          Criar Novo Curso
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-50 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar formação ou categoria..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-1 focus:ring-red-600 transition-all uppercase text-[10px] font-bold tracking-wider outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Curso / Formação</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Faturamento</th>
                <th className="px-6 py-4">Status de Vendas</th>
                <th className="px-6 py-4 text-right">Ações de Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium text-slate-750">
              {filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-extrabold text-slate-900 text-base tracking-tight uppercase">{course.title}</div>
                    <div className="text-[10px] text-slate-450 font-mono tracking-tighter uppercase mt-0.5">/{course.slug}</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{course.category || 'Geral'}</td>
                  <td className="px-6 py-4 text-xs font-mono tracking-tight font-extrabold">
                    {course.price ? `R$ ${course.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Livre'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                      course.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {course.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => {
                        setSelectedCourseIdForWizard(course.id);
                        setIsWizardOpen(true);
                      }}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                      title="Editar com Construtor de Etapas"
                    >
                      <Edit2 size={16}/>
                    </button>
                    <button 
                      onClick={() => deleteCourse(course.id)}
                      className="p-2 hover:bg-red-50 text-red-550 rounded-lg transition-colors"
                      title="Descartar Curso"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {!loading && filteredCourses.length === 0 && (
          <div className="py-20 text-center text-slate-400 font-bold uppercase text-[10px] italic">
            Nenhum curso cadastrado ainda.
          </div>
        )}
      </div>
    </div>
  );
}
