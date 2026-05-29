import { Link } from 'react-router-dom';
import { ArrowRight, UserCheck, Search } from 'lucide-react';
import { motion } from 'motion/react';
import RegistrationBreadcrumbs from '../../components/RegistrationBreadcrumbs';

export default function BossCadastroProfessores() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      {/* Breadcrumb */}
      <div className="mb-4">
        <RegistrationBreadcrumbs 
          items={[
            { label: 'Central de Cadastros', to: '/boss/cadastro' },
            { label: 'Cadastro de Professores' }
          ]} 
        />
      </div>

      {/* Retorno e Título */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-red-600 font-bold tracking-[0.3em] uppercase text-[10px] block mb-2">
            Módulo de Admissão de Professores
          </span>
          <h1 className="text-4xl font-extrabold italic tracking-tighter uppercase text-slate-900 leading-none">
            Cadastro de <span className="text-red-600">Professores</span>
          </h1>
        </div>
        <Link 
          to="/boss/cadastro" 
          className="text-slate-400 hover:text-slate-900 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors group self-start"
        >
          <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> Central de Cadastros
        </Link>
      </div>

      {/* Grid de Redirecionamento Estrito - 2 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        {/* Card 1: Novo Professor (Cadastrar) */}
        <motion.div 
          whileHover={{ y: -6 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between h-80 group cursor-pointer"
        >
          <Link to="/boss/cadastro/novo-cadastro-professor" className="flex flex-col justify-between h-full w-full">
            <div>
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                <UserCheck size={24} />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight italic text-slate-900 mb-3 flex items-center gap-2">
                ➕ Novo Professor
              </h3>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed uppercase tracking-wider">
                Realizar novo cadastro de professor. Estrutura acadêmica, comissões de faturamento e acesso ao painel do docente.
              </p>
            </div>
            
            <div className="w-full bg-slate-900 text-white group-hover:bg-red-600 font-black uppercase text-xs tracking-widest py-4 rounded-full flex items-center justify-center gap-2 transition-colors duration-300 mt-4">
              Cadastrar <ArrowRight size={14} />
            </div>
          </Link>
        </motion.div>

        {/* Card 2: Já Sou Professor (Localizar) */}
        <motion.div 
          whileHover={{ y: -6 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between h-80 group cursor-pointer"
        >
          <Link to="/boss/cadastro/ja-sou-professor" className="flex flex-col justify-between h-full w-full">
            <div>
              <div className="w-14 h-14 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                <Search size={24} />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight italic text-slate-900 mb-3 flex items-center gap-2">
                🔎 Já Sou Professor
              </h3>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed uppercase tracking-wider">
                Localizar cadastro já existente. Gerencie especialidades, contratos, comissões acadêmicas e turmas subordinadas.
              </p>
            </div>
            
            <div className="w-full bg-slate-900 text-white group-hover:bg-red-600 font-black uppercase text-xs tracking-widest py-4 rounded-full flex items-center justify-center gap-2 transition-colors duration-300 mt-4">
              Localizar <ArrowRight size={14} />
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
