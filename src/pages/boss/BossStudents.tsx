import { useState, useEffect, FormEvent } from 'react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc, where, getDocs } from 'firebase/firestore';
import { User, ShieldAlert, CheckCircle2, Search, Calendar, Pencil, Trash2, X, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

export default function BossStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para Modal de Edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    cpf: '',
    rg: '',
    birthDate: '',
    maritalStatus: 'solteiro',
    profession: '',
    address: '',
    email: '',
    phone: '',
    whatsapp: '',
    socialMedia: '',
    internalNotes: '',
    loginEmail: '',
    password: '',
    statusAccess: 'ativo',
  });

  // Estados para Modal de Exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  const openEditModal = (student: any) => {
    setSelectedStudent(student);
    setEditForm({
      fullName: student.fullName || '',
      cpf: student.cpf || '',
      rg: student.rg || '',
      birthDate: student.birthDate || '',
      maritalStatus: student.maritalStatus || 'solteiro',
      profession: student.profession || '',
      address: student.address || '',
      email: student.email || '',
      phone: student.phone || '',
      whatsapp: student.whatsapp || '',
      socialMedia: student.socialMedia || '',
      internalNotes: student.internalNotes || '',
      loginEmail: student.loginEmail || '',
      password: student.password || '',
      statusAccess: student.statusAccess || 'ativo',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    if (!editForm.fullName || !editForm.cpf || !editForm.birthDate || !editForm.email || !editForm.loginEmail || !editForm.password) {
      toast.error('Preencha todos os campos obrigatórios (*)');
      return;
    }

    setActionLoading(true);

    try {
      // Validar CPF se foi alterado
      if (editForm.cpf.trim() !== selectedStudent.cpf) {
        const cpfQuery = query(collection(db, 'students'), where('cpf', '==', editForm.cpf.trim()));
        const cpfSnapshot = await getDocs(cpfQuery);
        if (!cpfSnapshot.empty) {
          toast.error('Erro de Validação: Este número de CPF já está cadastrado no sistema.');
          setActionLoading(false);
          return;
        }
      }

      // Validar Email de Login se foi alterado
      if (editForm.loginEmail.trim() !== selectedStudent.loginEmail) {
        const emailQuery = query(collection(db, 'students'), where('loginEmail', '==', editForm.loginEmail.trim()));
        const emailSnapshot = await getDocs(emailQuery);
        if (!emailSnapshot.empty) {
          toast.error('Erro de Validação: Este e-mail de login já está em uso.');
          setActionLoading(false);
          return;
        }
      }

      // Atualizar no Firestore
      const studentRef = doc(db, 'students', selectedStudent.id);
      await updateDoc(studentRef, {
        fullName: editForm.fullName.trim(),
        cpf: editForm.cpf.trim(),
        rg: editForm.rg.trim(),
        birthDate: editForm.birthDate,
        maritalStatus: editForm.maritalStatus,
        profession: editForm.profession.trim(),
        address: editForm.address.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        whatsapp: editForm.whatsapp.trim(),
        socialMedia: editForm.socialMedia.trim(),
        internalNotes: editForm.internalNotes.trim(),
        loginEmail: editForm.loginEmail.trim(),
        password: editForm.password,
        statusAccess: editForm.statusAccess,
      });

      toast.success('Cadastro de aluno atualizado com sucesso!');
      setIsEditModalOpen(false);
      setSelectedStudent(null);
    } catch (err: any) {
      console.error(err);
      toast.error(`Erro ao atualizar registro: ${err.message || 'Falha de comunicação.'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (student: any) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedStudent) return;

    setActionLoading(true);
    try {
      const studentRef = doc(db, 'students', selectedStudent.id);
      await deleteDoc(studentRef);
      toast.success('Cadastro excluído com sucesso!');
      setIsDeleteModalOpen(false);
      setSelectedStudent(null);
    } catch (err: any) {
      console.error(err);
      toast.error(`Erro ao excluir registro: ${err.message || 'Falha de comunicação.'}`);
    } finally {
      setActionLoading(false);
    }
  };

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
                  <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-wider text-right w-28">Ações</th>
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
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(student)}
                          className="w-8 h-8 rounded-full bg-slate-150 text-slate-600 hover:bg-slate-900 hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm"
                          title="Editar Cadastro de Aluno"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(student)}
                          className="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm"
                          title="Excluir Cadastro"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
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

      {/* Modal de Edição */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-4xl bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                <div>
                  <span className="text-red-600 font-bold tracking-[0.3em] uppercase text-[9px] block mb-1">
                    Painel de Controle BOSS
                  </span>
                  <h2 className="text-xl font-black uppercase italic tracking-tight text-slate-900 leading-none">
                    Editar Cadastro do <span className="text-red-600">Discente</span>
                  </h2>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white flex items-center justify-center transition-all duration-200 outline-none"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Body - Scrollable */}
              <form onSubmit={handleEditSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                  {/* Bloco 1: Dados Pessoais */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
                      1. Dados de Pessoa Física (Cadastral)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-slate-500 font-bold uppercase tracking-wider text-[9px] mb-1.5">Nome Completo *</label>
                        <input
                          type="text"
                          required
                          value={editForm.fullName}
                          onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-2.5 px-3.5 text-xs font-bold uppercase transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold uppercase tracking-wider text-[9px] mb-1.5">CPF *</label>
                        <input
                          type="text"
                          required
                          value={editForm.cpf}
                          onChange={(e) => setEditForm({ ...editForm, cpf: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-2.5 px-3.5 text-xs font-bold uppercase transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold uppercase tracking-wider text-[9px] mb-1.5">RG</label>
                        <input
                          type="text"
                          value={editForm.rg}
                          onChange={(e) => setEditForm({ ...editForm, rg: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-2.5 px-3.5 text-xs font-bold uppercase transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold uppercase tracking-wider text-[9px] mb-1.5">Data de Nascimento *</label>
                        <input
                          type="date"
                          required
                          value={editForm.birthDate}
                          onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-2.5 px-3.5 text-xs font-bold uppercase transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold uppercase tracking-wider text-[9px] mb-1.5">Estado Civil</label>
                        <select
                          value={editForm.maritalStatus}
                          onChange={(e) => setEditForm({ ...editForm, maritalStatus: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-2.5 px-3.5 text-xs font-bold uppercase transition-all outline-none"
                        >
                          <option value="solteiro">Solteiro(a)</option>
                          <option value="casado">Casado(a)</option>
                          <option value="divorciado">Divorciado(a)</option>
                          <option value="viuvo">Viúvo(a)</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-slate-500 font-bold uppercase tracking-wider text-[9px] mb-1.5">Profissão</label>
                        <input
                          type="text"
                          value={editForm.profession}
                          onChange={(e) => setEditForm({ ...editForm, profession: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-2.5 px-3.5 text-xs font-bold uppercase transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold uppercase tracking-wider text-[9px] mb-1.5">E-mail de Contato *</label>
                        <input
                          type="email"
                          required
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-2.5 px-3.5 text-xs font-bold transition-all outline-none"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-slate-500 font-bold uppercase tracking-wider text-[9px] mb-1.5">Endereço Completo</label>
                        <input
                          type="text"
                          value={editForm.address}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-2.5 px-3.5 text-xs font-bold uppercase transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold uppercase tracking-wider text-[9px] mb-1.5">Telefone Comercial</label>
                        <input
                          type="text"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-2.5 px-3.5 text-xs font-bold uppercase transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold uppercase tracking-wider text-[9px] mb-1.5">WhatsApp de Matrículas</label>
                        <input
                          type="text"
                          value={editForm.whatsapp}
                          onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-2.5 px-3.5 text-xs font-bold uppercase transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold uppercase tracking-wider text-[9px] mb-1.5">Redes Sociais</label>
                        <input
                          type="text"
                          value={editForm.socialMedia}
                          onChange={(e) => setEditForm({ ...editForm, socialMedia: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-2.5 px-3.5 text-xs font-bold transition-all outline-none"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-slate-500 font-bold uppercase tracking-wider text-[9px] mb-1.5">Observações Internas (Anotações BOSS)</label>
                        <textarea
                          rows={2}
                          value={editForm.internalNotes}
                          onChange={(e) => setEditForm({ ...editForm, internalNotes: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-2.5 px-3.5 text-xs font-bold uppercase transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bloco 2: Acesso do Aluno */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
                      2. Credenciais de Acesso (Segurança)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-500 font-bold uppercase tracking-wider text-[9px] mb-1.5">E-mail de Login Interno *</label>
                        <input
                          type="email"
                          required
                          value={editForm.loginEmail}
                          onChange={(e) => setEditForm({ ...editForm, loginEmail: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-2.5 px-3.5 text-xs font-bold transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold uppercase tracking-wider text-[9px] mb-1.5">Status da Conta</label>
                        <select
                          value={editForm.statusAccess}
                          onChange={(e) => setEditForm({ ...editForm, statusAccess: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-2.5 px-3.5 text-xs font-bold uppercase transition-all outline-none"
                        >
                          <option value="ativo">Ativo (Acesso Liberado)</option>
                          <option value="bloqueado">Bloqueado temporariamente</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-slate-500 font-bold uppercase tracking-wider text-[9px] mb-1.5">Senha de Acesso *</label>
                        <input
                          type="password"
                          required
                          value={editForm.password}
                          onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-2.5 px-3.5 text-xs font-bold transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer - fixed bottom */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-6 py-3 border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-950 hover:bg-slate-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-red-600 text-white hover:bg-slate-900 px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-wider flex items-center gap-2 transition-all duration-300 disabled:opacity-50 shadow-md"
                  >
                    <Save size={14} /> {actionLoading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Exclusão */}
      <AnimatePresence>
        {isDeleteModalOpen && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden p-6 text-center space-y-6"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto">
                <Trash2 size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black uppercase italic tracking-tight text-slate-900 leading-tight">
                  Excluir Cadastro?
                </h3>
                <p className="text-slate-500 text-xs">
                  Tem certeza que deseja excluir permanentemente o cadastro de <strong className="text-slate-900 uppercase">{selectedStudent.fullName}</strong>? Esta ação não poderá ser desfeita.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-1/2 px-6 py-3 border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-950 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteSubmit}
                  disabled={actionLoading}
                  className="w-1/2 bg-red-600 text-white hover:bg-red-700 px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-wider transition-all duration-300 disabled:opacity-50"
                >
                  {actionLoading ? 'EXCLUINDO...' : 'SIM, EXCLUIR'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
