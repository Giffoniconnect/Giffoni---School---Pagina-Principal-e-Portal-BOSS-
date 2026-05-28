import { Link } from 'react-router-dom';
import { Home, ArrowRight, Settings, Globe } from 'lucide-react';
import { motion } from 'motion/react';

export default function BossGeneralSettings() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      {/* Retorno e Título */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-red-600 font-bold tracking-[0.3em] uppercase text-[10px] block mb-2">
            Etapa 1.2.5 — Painel Corporativo
          </span>
          <h1 className="text-4xl font-extrabold italic tracking-tighter uppercase text-slate-900 leading-none">
            Configurações <span className="text-slate-400">Gerais</span>
          </h1>
        </div>
        <Link 
          to="/boss/visao-geral" 
          className="text-slate-400 hover:text-slate-900 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors group self-start"
        >
          <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> Voltar ao Painel
        </Link>
      </div>

      {/* Grid de Subconfigurações - Focado na Home Pública */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        {/* Card: Configuração de Home Pública */}
        <motion.div 
          whileHover={{ y: -6 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between h-72 group"
        >
          <div>
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
              <Globe size={24} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight italic text-slate-900 mb-3">
              Home Pública
            </h3>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed uppercase tracking-wider">
              Gerenciar seções, títulos dinâmicos de marketing, CTAs e estrutura visual de ofertas da página de entrada da Giffoni School.
            </p>
          </div>
          
          <Link 
            to="/boss/configuracoes-gerais/home-publica"
            className="w-full bg-slate-900 text-white hover:bg-red-600 font-black uppercase text-xs tracking-widest py-4 rounded-full flex items-center justify-center gap-2 transition-colors duration-300"
          >
            Acessar Gerenciador <ArrowRight size={14} />
          </Link>
        </motion.div>

        {/* Card: Sistema e Segurança (Desabilitado / Futuro) */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-8 flex flex-col justify-between h-72 opacity-60">
          <div>
            <div className="w-14 h-14 bg-slate-200 text-slate-500 rounded-2xl flex items-center justify-center mb-6">
              <Settings size={24} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight italic text-slate-400 mb-2">
              Segurança & API
            </h3>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed uppercase tracking-wider">
              Ajuste de integrações com webhooks, tokens de acesso do Stripe e chaves criptográficas institucionais de segurança (Disponível no deploy).
            </p>
          </div>
          
          <button
            disabled
            className="w-full bg-slate-200 text-slate-400 cursor-not-allowed font-black uppercase text-xs tracking-widest py-4 rounded-full flex items-center justify-center gap-2"
          >
            Bloqueado nesta Fase
          </button>
        </div>
      </div>
    </div>
  );
}
