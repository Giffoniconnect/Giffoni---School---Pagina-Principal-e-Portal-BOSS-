import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ArrowRight, Search, Key, Sparkles, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function BossExistingStudent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [foundStudent, setFoundStudent] = useState<any | null>(null);

  // Campos de senha para validação
  const [password, setPassword] = useState('');

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Digite o Nome Completo ou CPF para pesquisar.');
      return;
    }

    setLoading(true);
    setFoundStudent(null);

    try {
      // Buscar por CPF exato ou Nome exato (com suporte a minúsculo/maiúsculo básico no filtro local)
      const qCpf = query(collection(db, 'students'), where('cpf', '==', searchQuery.trim()));
      const snapCpf = await getDocs(qCpf);

      if (!snapCpf.empty) {
        const studentDoc = snapCpf.docs[0];
        setFoundStudent({ id: studentDoc.id, ...studentDoc.data() });
        toast.success('Aluno localizado com sucesso!');
        setLoading(false);
        return;
      }

      // Tentar por Nome Completo exato
      const qName = query(collection(db, 'students'), where('fullName', '==', searchQuery.trim()));
      const snapName = await getDocs(qName);

      if (!snapName.empty) {
        const studentDoc = snapName.docs[0];
        setFoundStudent({ id: studentDoc.id, ...studentDoc.data() });
        toast.success('Aluno localizado com acessar nome!');
        setLoading(false);
        return;
      }

      // Caso não localize
      toast.error('Localização falhou: Nenhum aluno encontrado com esses dados cadastrais.');
    } catch (err: any) {
      console.error(err);
      toast.error('Ocorreu um erro ao consultar o Firestore.');
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = (e: FormEvent) => {
    e.preventDefault();

    if (!foundStudent) return;

    if (!password) {
      toast.error('Digite a senha criada para o aluno.');
      return;
    }

    // Comparar senhas salvas
    if (foundStudent.password === password) {
      toast.success('Credenciais autenticadas! Redirecionando para matrícula.');
      navigate(`/boss/cadastro/ja-sou-aluno/matricular-curso?studentId=${foundStudent.id}`);
    } else {
      toast.error('Senha de acesso incorreta. Tente novamente.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-red-600 font-bold tracking-[0.3em] uppercase text-[10px] block mb-2">
            Etapa 1.6 — Portabilidade & Extensão
          </span>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">
            Já Sou <span className="text-slate-400">Aluno</span>
          </h1>
        </div>
        <Link 
          to="/boss/cadastro" 
          className="text-slate-400 hover:text-slate-900 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors group self-start"
        >
          <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> Central de Cadastros
        </Link>
      </div>

      <div className="space-y-8">
        {/* Bloco 1: Localização */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-800 font-semibold">
              <Search size={16} />
            </div>
            <h2 className="text-lg font-black uppercase italic tracking-tight text-slate-900">
              1. Identificar Registro Acadêmico
            </h2>
          </div>

          <form onSubmit={handleSearch} className="flex gap-4">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="DIGITE NOME COMPLETO OU CPF EXATO DO ALUNO"
              className="flex-1 bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold uppercase transition-all outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-slate-900 hover:bg-red-600 text-white font-black uppercase text-[10px] tracking-widest px-8 py-3 rounded-xl transition-colors shrink-0"
            >
              {loading ? 'BUSCANDO...' : 'PESQUISAR'}
            </button>
          </form>

          {foundStudent && (
            <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 mt-4">
              <Sparkles className="text-emerald-600 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-black uppercase text-xs text-emerald-900 tracking-wide">
                  Aluno Identificado de Forma Segura!
                </p>
                <div className="mt-2 text-xs font-semibold text-emerald-800 uppercase space-y-1">
                  <p>Nome: <span className="font-black text-slate-900">{foundStudent.fullName}</span></p>
                  <p>CPF: <span className="font-black text-slate-900">{foundStudent.cpf}</span></p>
                  <p>Login reservado: <span className="font-mono font-bold lowercase text-slate-900">{foundStudent.loginEmail}</span></p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bloco 2: Autenticação de Senha Caso Localizado */}
        {foundStudent && (
          <form onSubmit={handleValidation} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-800 font-semibold">
                <Key size={16} />
              </div>
              <h2 className="text-lg font-black uppercase italic tracking-tight text-slate-900">
                2. Autenticação e Entrada no Sistema
              </h2>
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">
                Efetuar Entrada com a Senha Cadastrada para o Aluno
              </label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="DIGITE A ASSINATURA DIGITAL / SENHA DELE"
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold transition-all outline-none"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-red-600 text-white hover:bg-slate-900 px-10 py-4 rounded-full font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-colors duration-300"
              >
                PROSSEGUIR PARA MATRÍCULA <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
