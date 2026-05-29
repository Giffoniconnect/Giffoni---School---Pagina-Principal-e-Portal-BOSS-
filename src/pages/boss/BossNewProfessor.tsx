import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowRight, User, Shield, CheckCircle, Percent, BookOpen, Wallet, Award, Monitor } from 'lucide-react';
import { toast } from 'react-hot-toast';
import RegistrationBreadcrumbs from '../../components/RegistrationBreadcrumbs';

export default function BossNewProfessor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Estados dos Campos Pessoais & Acadêmicos
  const [fullName, setFullName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [bio, setBio] = useState('');
  const [commissionShare, setCommissionShare] = useState('70');
  const [internalNotes, setInternalNotes] = useState('');

  // Estados dos Dados de Acesso
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusAccess, setStatusAccess] = useState('ativo');

  // Copiar e-mail físico para e-mail de login se vazio
  const handleEmailBlur = () => {
    if (!loginEmail && email) {
      setLoginEmail(email);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validar Campos Obrigatórios
    if (!fullName || !cpf || !email || !loginEmail || !password || !confirmPassword) {
      toast.error('Preencha todos os campos obrigatórios (*).');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      // Validar duplicidade de CPF na coleção de usuários
      const cpfQuery = query(collection(db, 'users'), where('cpf', '==', cpf.trim()));
      const cpfSnapshot = await getDocs(cpfQuery);
      if (!cpfSnapshot.empty) {
        toast.error('Erro de Validação: Este número de CPF já está cadastrado.');
        setLoading(false);
        return;
      }

      // Validar duplicidade de email
      const emailQuery = query(collection(db, 'users'), where('email', '==', loginEmail.trim()));
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        toast.error('Erro de Validação: Este e-mail de login já está em uso.');
        setLoading(false);
        return;
      }

      // Montar payload com o perfil de professor
      const newProfessor = {
        displayName: fullName.trim(),
        cpf: cpf.trim(),
        email: loginEmail.trim(), // email de login principal
        contactEmail: email.trim(),
        phone: phone.trim(),
        role: 'PROFESSOR',
        specialization: specialization.trim(),
        bio: bio.trim(),
        commissionShare: Number(commissionShare),
        internalNotes: internalNotes.trim(),
        password, // Seria gerido/hashificado em produção real
        statusAccess,
        createdAt: Date.now() // Timestamp numérico padrão do perfil
      };

      // Adição no Firebase
      await addDoc(collection(db, 'users'), newProfessor);
      toast.success('Professor cadastrado com sucesso!');

      // Redireciona para a listagem ou para a central de professores
      navigate('/boss/cadastro/professores');

    } catch (err: any) {
      console.error(err);
      toast.error(`Erro ao efetuar cadastro: ${err.message || 'Falha de comunicação com o Firestore.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      {/* Breadcrumb */}
      <div className="mb-4">
        <RegistrationBreadcrumbs 
          items={[
            { label: 'Central de Cadastros', to: '/boss/cadastro' },
            { label: 'Cadastro de Professores', to: '/boss/cadastro/professores' },
            { label: 'Novo Professor' }
          ]} 
        />
      </div>

      {/* Retorno e Título */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-red-600 font-bold tracking-[0.3em] uppercase text-[10px] block mb-2">
            Módulo Docente & Academia
          </span>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">
            Admitir <span className="text-red-600">Novo Professor</span>
          </h1>
        </div>
        <Link 
          to="/boss/cadastro/professores" 
          className="text-slate-400 hover:text-slate-900 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors group self-start"
        >
          <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> Cadastro de Professores
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* Bloco 1: Dados do Professor */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-800 font-semibold">
              <User size={16} />
            </div>
            <h2 className="text-lg font-black uppercase italic tracking-tight text-slate-900">
              1. Identificação Geral & Especialidades
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">Nome Completo do Professor *</label>
              <input 
                type="text" 
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="NOME COMPLETO DO DOCENTE"
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold uppercase transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">CPF *</label>
              <input 
                type="text" 
                required
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold uppercase transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">E-mail de Contato *</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                placeholder="professor@giffonischool.com"
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">WhatsApp / Telefone</label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 99999-9999"
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold uppercase transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">Taxa de Comissão Padrão (%) *</label>
              <div className="relative">
                <input 
                  type="number" 
                  required
                  min="0"
                  max="100"
                  value={commissionShare}
                  onChange={(e) => setCommissionShare(e.target.value)}
                  placeholder="70"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 pr-10 text-xs font-bold transition-all outline-none"
                />
                <Percent size={14} className="absolute right-4 top-3.5 text-slate-400" />
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">Especialidades Acadêmicas / Áreas de Atuação</label>
              <input 
                type="text" 
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="CONSTITUCIONAL, EMPRESARIAL, DIREITO DIGITAL, CIVIL..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold uppercase transition-all outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">Mini Bio / Perfil do Professor</label>
              <textarea 
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="ESCREVA SOBRE A EXPERIÊNCIA, TÍTULOS E HISTÓRICO DO PROFESSOR..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-2xl py-3 px-4 text-xs font-bold uppercase transition-all outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">Observações Giffoni School BOSS</label>
              <textarea 
                rows={2}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="ANOTAÇÕES DA ADMINISTRAÇÃO..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-2xl py-3 px-4 text-xs font-bold uppercase transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Credenciais de Acesso */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-800 font-semibold">
              <Shield size={16} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase italic tracking-tight text-slate-900">
                2. Credenciais de Acesso ao Sistema
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-0.5">
                Definição inicial de acesso ao portal do professor
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">E-mail de Login Interno *</label>
              <input 
                type="email" 
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="docente@giffonischool.com"
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">Status da Conta</label>
              <select 
                value={statusAccess}
                onChange={(e) => setStatusAccess(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold uppercase transition-all outline-none"
              >
                <option value="ativo">Ativo (Acesso Liberado)</option>
                <option value="bloqueado">Suspenso Temporariamente</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">Senha de Acesso Docente *</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="MINIMO 6 CARACTERES"
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">Confirmar Senha Docente *</label>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="CONFIRME EXATAMENTE A MESMA SENHA"
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bloco 3: Preparação Estrutural de Futuras Integrações */}
        <div className="bg-slate-50 rounded-3xl p-8 border border-dashed border-slate-300 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="w-8 h-8 bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center font-bold">
              ⚡
            </div>
            <div>
              <h2 className="text-sm font-black uppercase text-slate-700 tracking-wide">
                Estrutura de Futura Integração (Reservada)
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-0.5">
                Os módulos abaixo estão programados na estrutura, prontos para sincronizações futuras.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon: BookOpen, label: "Vincular Cursos" },
              { icon: Percent, label: "Fórmula Comissões" },
              { icon: Award, label: "Gerador Certificados" },
              { icon: Wallet, label: "Módulo Financeiro" },
              { icon: Monitor, label: "Portal Professor" },
            ].map((mod, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 shadow-sm opacity-60">
                <mod.icon size={20} className="text-slate-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{mod.label}</span>
                <span className="text-[8px] font-black uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-400">Pendente</span>
              </div>
            ))}
          </div>
        </div>

        {/* Botão de Gravação & Avanço */}
        <div className="flex justify-end shadow-sm">
          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 text-white hover:bg-slate-900 px-12 py-5 rounded-full font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 transition-all duration-300 disabled:opacity-50 active:scale-95 shadow-[0_0_35px_rgba(220,38,38,0.15)]"
          >
            {loading ? 'EFETUANDO CADASTRO...' : 'SALVAR E CADASTRAR DOCENTE'} <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
