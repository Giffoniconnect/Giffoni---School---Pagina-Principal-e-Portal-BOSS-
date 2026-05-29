import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ArrowRight, Search, Key, Sparkles, User, Mail, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';
import RegistrationBreadcrumbs from '../../components/RegistrationBreadcrumbs';

export default function BossExistingStudent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Campos de senha para validação
  const [password, setPassword] = useState('');

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    const queryTerm = searchQuery.trim().toLowerCase();
    if (!queryTerm) {
      toast.error('Digite o Nome, CPF ou E-mail para pesquisar.');
      return;
    }

    setLoading(true);
    setResults([]);
    setSelectedStudent(null);
    setPassword('');

    try {
      // Buscar coleção para filtro local tolerante e robusto (Nome, CPF ou E-mail)
      const snap = await getDocs(collection(db, 'students'));
      const studentsList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const filtered = studentsList.filter((st: any) => {
        const nameMatch = st.fullName?.toLowerCase().includes(queryTerm);
        const cpfMatch = st.cpf?.toLowerCase().includes(queryTerm);
        const emailMatch = st.email?.toLowerCase().includes(queryTerm) || st.loginEmail?.toLowerCase().includes(queryTerm);
        return nameMatch || cpfMatch || emailMatch;
      });

      setResults(filtered);

      if (filtered.length > 0) {
        toast.success(`${filtered.length} aluno(s) localizado(s)!`);
      } else {
        toast.error('Nenhum aluno encontrado com esses dados cadastrais.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Erro de conexão ou consulta ao Firestore.');
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = (e: FormEvent) => {
    e.preventDefault();

    if (!selectedStudent) return;

    if (!password) {
      toast.error('Digite a senha criada para o aluno.');
      return;
    }

    // Comparar senhas salvas
    if (selectedStudent.password === password) {
      toast.success('Credenciais autenticadas! Redirecionando para matrícula.');
      navigate(`/boss/cadastro/ja-sou-aluno/matricular-curso?studentId=${selectedStudent.id}`);
    } else {
      toast.error('Senha de acesso incorreta. Tente novamente.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      {/* Breadcrumb */}
      <div className="mb-4">
        <RegistrationBreadcrumbs 
          items={[
            { label: 'Central de Cadastros', to: '/boss/cadastro' },
            { label: 'Cadastro de Alunos', to: '/boss/cadastro/alunos' },
            { label: 'Já Sou Aluno' }
          ]} 
        />
      </div>

      {/* Retorno e Título */}
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
          to="/boss/cadastro/alunos" 
          className="text-slate-400 hover:text-slate-900 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors group self-start"
        >
          <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> Cadastro de Alunos
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
              1. Localizar Através de Dados Cadastrais
            </h2>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              required
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="DIGITE NOME COMPLETO, CPF OU E-MAIL DO ALUNO"
              className="flex-1 bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-4 px-4 text-xs font-bold uppercase transition-all outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-slate-900 hover:bg-red-600 text-white font-black uppercase text-xs tracking-widest px-8 py-4 rounded-xl transition-all shrink-0 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'PESQUISANDO...' : 'PESQUISAR'}
            </button>
          </form>

          {/* Lista de Resultados de Busca */}
          {results.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Alunos Encontrados ({results.length}):
              </p>
              <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto pr-1">
                {results.map((st) => {
                  const isSelected = selectedStudent?.id === st.id;
                  return (
                    <div 
                      key={st.id}
                      onClick={() => {
                        setSelectedStudent(st);
                        setPassword('');
                      }}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                        isSelected 
                          ? 'border-red-600 bg-red-50/40 shadow-inner' 
                          : 'border-slate-100 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-slate-400" />
                          <h4 className="text-sm font-black text-slate-900 uppercase">
                            {st.fullName}
                          </h4>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-wide text-slate-400 flex flex-wrap gap-x-4">
                          <span>CPF: <span className="text-slate-600">{st.cpf}</span></span>
                          <span className="flex items-center gap-1">
                            <Mail size={10} />
                            <span>{st.email || st.loginEmail}</span>
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-colors ${
                          isSelected 
                            ? 'bg-red-600 text-white' 
                            : 'bg-slate-900 text-white hover:bg-red-600'
                        }`}
                      >
                        {isSelected ? 'SELECIONADO' : 'SELECIONAR'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedStudent && (
            <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="font-black uppercase text-xs text-emerald-900 tracking-wide">
                  Aluno Selecionado para Prosseguir
                </p>
                <div className="mt-2 text-[10px] font-bold text-emerald-800 uppercase space-y-1">
                  <p>Nome: <span className="font-extrabold text-slate-900">{selectedStudent.fullName}</span></p>
                  <p>CPF: <span className="font-extrabold text-slate-900">{selectedStudent.cpf}</span></p>
                  <p>E-mail: <span className="font-mono lowercase text-slate-900">{selectedStudent.email || selectedStudent.loginEmail}</span></p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bloco 2: Autenticação de Senha Caso Selecionado */}
        {selectedStudent && (
          <form onSubmit={handleValidation} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-800 font-semibold">
                <Key size={16} />
              </div>
              <h2 className="text-lg font-black uppercase italic tracking-tight text-slate-900">
                2. Autenticação de Assinatura Acadêmica
              </h2>
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">
                Efetuar Entrada com a Senha de Acesso Cadastrada para o Aluno *
              </label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="DIGITE A SENHA CRIADA NO MOMENTO DO CADASTRO"
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold transition-all outline-none"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-red-600 text-white hover:bg-slate-900 px-10 py-4 rounded-full font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.15)] active:scale-95"
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
