import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { HomeSection } from '../../types';
import { Plus, Trash2, Edit2, Eye, EyeOff, GripVertical } from 'lucide-react';
import { motion, Reorder } from 'motion/react';
import { toast } from 'react-hot-toast';

export default function BossHomeManager() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'home_sections'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HomeSection));
      setSections(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'home_sections');
    });
    return unsubscribe;
  }, []);

  const toggleActive = async (section: HomeSection) => {
    try {
      await updateDoc(doc(db, 'home_sections', section.id), { isActive: !section.isActive });
      toast.success(`Seção ${!section.isActive ? 'ativada' : 'desativada'}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `home_sections/${section.id}`);
    }
  };

  const deleteSection = async (id: string) => {
    if (window.confirm('Tem certeza?')) {
      try {
        await deleteDoc(doc(db, 'home_sections', id));
        toast.success('Seção removida');
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `home_sections/${id}`);
      }
    }
  };

  const addDefaultSection = async () => {
    const newSection = {
      type: 'hero',
      title: 'Nova Seção',
      subtitle: 'Descrição da seção',
      order: sections.length > 0 ? Math.max(...sections.map(s => s.order)) + 1 : 0,
      isActive: false,
      createdAt: serverTimestamp()
    };
    try {
      await addDoc(collection(db, 'home_sections'), newSection);
      toast.success('Seção adicionada');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'home_sections');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tighter text-slate-900 italic">BOSS HOME [CONFIG]</h1>
        <button
          onClick={addDefaultSection}
          className="bg-black text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-slate-800 transition-all font-medium"
        >
          <Plus size={20} />
          Adicionar Seção
        </button>
      </div>

      <div className="grid gap-4">
        {sections.map((section) => (
          <motion.div
            layout
            key={section.id}
            className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 ${!section.isActive ? 'opacity-60' : ''}`}
          >
            <div className="cursor-grab text-slate-300">
              <GripVertical size={20} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  {section.type}
                </span>
                <h3 className="font-semibold text-slate-800">{section.title}</h3>
              </div>
              <p className="text-sm text-slate-500 truncate max-w-md">{section.subtitle}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleActive(section)}
                className={`p-2 rounded-lg transition-colors ${section.isActive ? 'text-green-600 bg-green-50' : 'text-slate-400 bg-slate-50'}`}
              >
                {section.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
              <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                <Edit2 size={18} />
              </button>
              <button 
                onClick={() => deleteSection(section.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </motion.div>
        ))}
        {sections.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-medium">
            Nenhuma seção configurada. Comece criando o Hero.
          </div>
        )}
      </div>
    </div>
  );
}
