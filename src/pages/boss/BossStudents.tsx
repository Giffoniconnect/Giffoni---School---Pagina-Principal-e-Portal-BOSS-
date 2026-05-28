import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { User, ShieldAlert, CheckCircle2, Search, Calendar } from 'lucide-react';

export default function BossStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'students'), orderBy('registeredAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(data);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredStudents = students.filter(student => 
    student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.cpf?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-red-600 font-bold tracking-[0.3em] uppercase text-[10px] block mb-2">
            Etapa 1.2.4 — Cadastro Discente
          </span>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">
            Conselho de <span className="text-red-500">Alunos</span>
          </h1>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="PESQUISAR ALUNO OU CPF..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-full py-3.5 pl-12 pr-6 text-xs font-bold tracking-wider focus:ring-1 focus:ring-red-600 focus:border-red-600 transition-all outline-none uppercase"
          />
        </div>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center font-black italic text-slate-800 tracking-tight">
          CARREGANDO LISTAGEM DE ALUNOS COMPARTILHADA...
        </div>
      ) : filteredStudents.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[40vh]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-wider">Nome Completo</th>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-wider">Documento (CPF)</th>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-wider">E-mail de Login</th>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-wider">Método Ativo</th>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">Licença</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 shrink-0">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 uppercase text-xs leading-none">{student.fullName}</p>
                          <p className="text-[9px] text-slate-400 uppercase tracking-widest leading-none mt-1">{student.profession || 'Não Informado'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 font-mono text-xs uppercase text-slate-500 font-semibold">{student.cpf}</td>
                    <td className="p-6 font-semibold text-xs text-slate-600">{student.loginEmail}</td>
                    <td className="p-6">
                      {student.hasActiveEnrollment ? (
                        <div>
                          <p className="text-xs font-black text-red-600 uppercase leading-none">{student.activeCourseTitle}</p>
                          <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none">Matrícula Efetivada</p>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
                          Sem matrículas ativas
                        </span>
                      )}
                    </td>
                    <td className="p-6 text-center">
                      <span className={`inline-flex px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-full ${student.statusAccess === 'ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {student.statusAccess}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-24 bg-white border border-dashed rounded-3xl border-slate-100">
          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
            NENHUM DISCENTE ENCONTRADO PARA "{searchTerm.toUpperCase()}"
          </p>
        </div>
      )}
    </div>
  );
}
