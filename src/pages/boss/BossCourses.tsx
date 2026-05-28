import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Course } from '../../types';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';

export default function BossCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

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

  const addDefaultCourse = async () => {
    const newCourse = {
      title: 'Nova Formação',
      slug: 'nova-formacao-' + Date.now(),
      description: 'Descrição da formação...',
      price: 997,
      status: 'draft',
      category: 'Advocacia',
      teacherId: '',
      createdAt: serverTimestamp()
    };
    try {
      await addDoc(collection(db, 'courses'), newCourse);
      toast.success('Curso criado como rascunho');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'courses');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">BOSS CURSOS</h1>
          <p className="text-slate-500 font-medium">Gestão de formações e treinamentos</p>
        </div>
        <button
          onClick={addDefaultCourse}
          className="bg-black text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-slate-800 transition-all font-bold uppercase text-xs tracking-widest"
        >
          <Plus size={20} />
          Criar Novo Curso
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-50 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar formação..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Curso</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Preço</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900 text-lg tracking-tight italic">{course.title}</div>
                  <div className="text-xs text-slate-400">/{course.slug}</div>
                </td>
                <td className="px-6 py-4 text-sm">{course.category}</td>
                <td className="px-6 py-4 text-sm font-mono tracking-tight">R$ {course.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="px-6 py-4">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                    course.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {course.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><Edit2 size={18}/></button>
                  <button className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {!loading && courses.length === 0 && (
          <div className="py-20 text-center text-slate-400 italic">
            Nenhum curso cadastrado ainda.
          </div>
        )}
      </div>
    </div>
  );
}
