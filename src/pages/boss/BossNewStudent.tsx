import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowRight, User, ShieldAlert, CheckCircle, Smartphone } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function BossNewStudent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Estados dos Campos Pessoa Física
  const [fullName, setFullName] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('solteiro');
  const [profession, setProfession] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [socialMedia, setSocialMedia] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  // Estados dos Dados de Acesso
  const [loginEmail, setLoginEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusAccess, setStatusAccess] = useState('ativo');

  // Copiar email físico para o e-mail de login automaticamente se estiver vazio
  const handleEmailBlur = () => {
    if (!loginEmail && email) {
      setLoginEmail(email);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validar Campos Obrigatórios
    if (!fullName || !cpf || !birthDate || !email || !loginEmail || !password || !confirmPassword) {
      toast.error('Preencha todos os campos obrigatórios identificados com asterisco (*).');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('A confirmação de senha não coincide com a senha criada.');
      return;
    }

    setLoading(true);

    try {
      // Validar duplicidade de CPF na coleção 'students'
      const cpfQuery = query(collection(db, 'students'), where('cpf', '==', cpf.trim()));
      const cpfSnapshot = await getDocs(cpfQuery);
      if (!cpfSnapshot.empty) {
        toast.error('Erro de Validação: Este número de CPF já está cadastrado no sistema.');
        setLoading(false);
        return;
      }

      // Validar duplicidade de E-mail de Login na coleção 'students'
      const emailQuery = query(collection(db, 'students'), where('loginEmail', '==', loginEmail.trim()));
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        toast.error('Erro de Validação: Este e-mail de login já está em uso.');
        setLoading(false);
        return;
      }

      // Criar payload robusto preservando dados do formulário
      const newStudent = {
        fullName: fullName.trim(),
        cpf: cpf.trim(),
        rg: rg.trim(),
        birthDate,
        maritalStatus,
        profession: profession.trim(),
        address: address.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim(),
        socialMedia: socialMedia.trim(),
        internalNotes: internalNotes.trim(),
        loginEmail: loginEmail.trim(),
        password, // Em ambiente produtivo completo de deploy, isso seria hashificado por cloud function
        statusAccess,
        registeredAt: serverTimestamp(),
        hasActiveEnrollment: false
      };

      // Adição ao Firestore
      const docRef = await addDoc(collection(db, 'students'), newStudent);
      toast.success('Aluno cadastrado com sucesso!');

      // Redireciona para o fluxo de matrícula da rota-etapa oficial
      navigate(`/boss/cadastro/novo-aluno/matricular-curso?studentId=${docRef.id}`);

    } catch (err: any) {
      console.error(err);
      toast.error(`Erro ao criar registro: ${err.message || 'Falha na conexão com o banco de dados.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-red-600 font-bold tracking-[0.3em] uppercase text-[10px] block mb-2">
            Etapa 1.4 — Processo Seletivo & Admissão
          </span>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">
            Admitir <span className="text-red-600">Novo Aluno</span>
          </h1>
        </div>
        <Link 
          to="/boss/cadastro" 
          className="text-slate-400 hover:text-slate-900 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors group self-start"
        >
          <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> Central de Cadastros
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Bloco 1: Dados Pessoa Física */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-800 font-semibold">
              <User size={16} />
            </div>
            <h2 className="text-lg font-black uppercase italic tracking-tight text-slate-900">
              1. Dados de Pessoa Física (Cadastral)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">Nome Completo *</label>
              <input 
                type="text" 
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="NOME COMPLETO DO ESTUDANTE"
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
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">RG</label>
              <input 
                type="text" 
                value={rg}
                onChange={(e) => setRg(e.target.value)}
                placeholder="00.000.000-0"
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold uppercase transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">Data de Nascimento *</label>
              <input 
                type="date" 
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold uppercase transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">Estado Civil</label>
              <select 
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold uppercase transition-all outline-none"
              >
                <option value="solteiro">Solteiro(a)</option>
                <option value="casado">Casado(a)</option>
                <option value="divorciado">Divorciado(a)</option>
                <option value="viuvo">Viúvo(a)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">Profissão</label>
              <input 
                type="text" 
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="ADVOGADO, ESTUDANTE DE DIREITO, ETC."
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
                placeholder="contato@exemplo.com"
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold transition-all outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">Endereço Completo</label>
              <input 
                type="text" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="RUA, NÚMERO, BAIRRO, CIDADE - ESTADO"
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold uppercase transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">Telefone Comercial</label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 0012-3456"
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold uppercase transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">WhatsApp de Matrículas</label>
              <input 
                type="text" 
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(00) 90000-0000"
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold uppercase transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">Redes Sociais</label>
              <input 
                type="text" 
                value={socialMedia}
                onChange={(e) => setSocialMedia(e.target.value)}
                placeholder="@perfilinstagram / linkedin"
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold transition-all outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">Observações Internas (Anotações BOSS)</label>
              <textarea 
                rows={3}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="ANOTAR DETALHES ADICIONAIS DO LEAD OU ALUNO..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-2xl py-3 px-4 text-xs font-bold uppercase transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Dados de Acesso para o Futuro Portal */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-800 font-semibold">
              <CheckCircle size={16} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase italic tracking-tight text-slate-900">
                2. Credenciais de Acesso (Segurança)
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-0.5">
                Valores reservados para o futuro login na Giffoni School
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
                placeholder="login@giffonishool.com"
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
                <option value="bloqueado">Bloqueado temporariamente</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">Criar Senha Inicial *</label>
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
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">Confirmar Senha Inicial *</label>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="DIGITE A MESMA SENHA"
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Botão de Gravação & Avanço */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 text-white hover:bg-slate-900 px-12 py-5 rounded-full font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 transition-all duration-300 disabled:opacity-50 active:scale-95 shadow-[0_0_30px_rgba(220,38,38,0.15)]"
          >
            {loading ? 'EFETUANDO CADASTRO...' : 'SALVAR E VINCULAR CURSO'} <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
