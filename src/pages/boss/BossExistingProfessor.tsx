import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ArrowRight, Search, Sparkles, User, Mail, Percent, BookOpen, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import RegistrationBreadcrumbs from '../../components/RegistrationBreadcrumbs';

export default function BossExistingProfessor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<any | null>(null);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    const queryTerm = searchQuery.trim().toLowerCase();
    if (!queryTerm) {
      toast.error('Digite o Nome, CPF ou E-mail para pesquisar.');
      return;
    }

    setLoading(true);
    setResults([]);
    setSelectedProfessor(null);

    try {
      // Buscar coleção para filtro local tolerante e robusto
      const snap = await getDocs(collection(db, 'users'));
      const usersList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const filtered = usersList.filter((u: any) => {
        // Filtrar apenas usuários que possuem role 'PROFESSOR'
        if (u.role !== 'PROFESSOR') return false;

        const nameMatch = u.displayName?.toLowerCase().includes(queryTerm);
        const cpfMatch = u.cpf?.toLowerCase().includes(queryTerm);
        const emailMatch = u.email?.toLowerCase().includes(queryTerm) || u.contactEmail?.toLowerCase().includes(queryTerm);
        return nameMatch || cpfMatch || emailMatch;
      });

      setResults(filtered);

      if (filtered.length > 0) {
        toast.success(`${filtered.length} professor(es) localizado(s)!`);
      } else {
        toast.error('Nenhum professor encontrado com esses dados cadastrais.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Erro de conexão ou consulta ao Firestore.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      {/* Breadcrumb */}
      <div className="mb-4">
        <RegistrationBreadcrumbs 
          items={[
            { label: 'Central de Cadastros', to: '/boss/cadastro' },
            { label: 'Cadastro de Professores', to: '/boss/cadastro/professores' },
            { label: 'Já Sou Professor' }
          ]} 
        />
      </div>

      {/* Retorno e Título */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-red-600 font-bold tracking-[0.3em] uppercase text-[10px] block mb-2">
            Etapa 2.2 — Localização Docente
          </span>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">
            Já Sou <span className="text-slate-400">Professor</span>
          </h1>
        </div>
        <Link 
          to="/boss/cadastro/professores" 
          className="text-slate-400 hover:text-slate-900 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors group self-start"
        >
          <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> Cadastro de Professores
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
              placeholder="DIGITE NOME COMPLETO, CPF OU E-MAIL DO PROFESSOR"
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
                Professores Encontrados ({results.length}):
              </p>
              <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto pr-1">
                {results.map((prof) => {
                  const isSelected = selectedProfessor?.id === prof.id;
                  return (
                    <div 
                      key={prof.id}
                      onClick={() => setSelectedProfessor(prof)}
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
                            {prof.displayName}
                          </h4>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-wide text-slate-400 flex flex-wrap gap-x-4">
                          <span>CPF: <span className="text-slate-600">{prof.cpf || "IMPROVISADO"}</span></span>
                          <span className="flex items-center gap-1">
                            <Mail size={10} />
                            <span>{prof.contactEmail || prof.email}</span>
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
                        {isSelected ? 'ABERTO' : 'ABRIR CADASTRO'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bloco 2: Detalhes do Cadastro Encontrado */}
        {selectedProfessor && (
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-semibold">
                <Sparkles size={16} />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase italic tracking-tight text-slate-900">
                  Ficha do Professor Selecionado
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-0.5">
                  Visualização de dados e especialidades do docente
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 uppercase font-bold">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <p className="text-[10px] text-slate-400">Nome do Docente</p>
                <p className="text-sm text-slate-900 font-black">{selectedProfessor.displayName}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <p className="text-[10px] text-slate-400">CPF</p>
                <p className="text-sm text-slate-900 font-black">{selectedProfessor.cpf || "Não cadastrado"}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <p className="text-[10px] text-slate-400">E-mail Principal</p>
                <p className="text-sm text-slate-900 font-black lowercase font-mono">{selectedProfessor.email}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <p className="text-[10px] text-slate-400">Contato Secundário</p>
                <p className="text-sm text-slate-900 font-black lowercase font-mono">{selectedProfessor.contactEmail || "Não cadastrado"}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <p className="text-[10px] text-slate-400">Especialização Principal</p>
                <p className="text-slate-800 font-extrabold">{selectedProfessor.specialization || "Não informada"}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl space-y-2 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-slate-400">Comissão de Vendas</p>
                  <p className="text-sm text-slate-900 font-black">{selectedProfessor.commissionShare || 70}%</p>
                </div>
                <Percent size={20} className="text-slate-400" />
              </div>

              {selectedProfessor.bio && (
                <div className="bg-slate-50 p-4 rounded-xl space-y-2 md:col-span-2">
                  <p className="text-[10px] text-slate-400">Biografia Acadêmica</p>
                  <p className="text-slate-800 font-normal normal-case leading-relaxed">{selectedProfessor.bio}</p>
                </div>
              )}

              {selectedProfessor.internalNotes && (
                <div className="bg-slate-50 p-4 rounded-xl space-y-2 md:col-span-2">
                  <p className="text-[10px] text-slate-400">Observações BOSS</p>
                  <p className="text-slate-600 font-normal leading-relaxed">{selectedProfessor.internalNotes}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full flex items-center gap-1">
                ● STATUS: {selectedProfessor.statusAccess || 'ATIVO'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
