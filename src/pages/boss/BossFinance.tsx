import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { CreditCard, Landmark, QrCode, ArrowRight, ShieldCheck, DollarSign, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function BossFinance() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const enrollmentId = searchParams.get('enrollmentId');
  const studentId = searchParams.get('studentId');
  const courseId = searchParams.get('courseId');

  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<any | null>(null);
  
  // Status de Transações
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'boleto' | 'cartao'>('pix');
  const [financeStatus, setFinanceStatus] = useState('aguardando_pagamento');
  
  // Módulo Stripe Simulado e Gerador de Checkout
  const [stripeLink, setStripeLink] = useState('');
  const [generatingStripe, setGeneratingStripe] = useState(false);

  useEffect(() => {
    if (!enrollmentId) {
      toast.error('Erro de Fluxo: Identificação da matrícula não recebida.');
      navigate('/boss/cadastro');
      return;
    }

    const fetchEnrollment = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'enrollments', enrollmentId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setEnrollment(data);
          // Set inicial do status que veio salvo se houver
          if (data.status === 'pago') setFinanceStatus('pago');
        } else {
          toast.error('Gargalo: Matrícula acadêmica correspondente não identificada.');
          navigate('/boss/cadastro');
        }
      } catch (err) {
        console.error(err);
        toast.error('Erro de conexão ao recuperar faturamento.');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollment();
  }, [enrollmentId, navigate]);

  // Simular Stripe Checkout Link Generation
  const handleGenerateStripe = () => {
    if (!enrollment) return;
    setGeneratingStripe(true);
    setTimeout(() => {
      // Criação de link simulado realístico
      const mockStripeLink = `https://checkout.stripe.com/pay/cs_live_giffoni_${enrollmentId}`;
      setStripeLink(mockStripeLink);
      toast.success('Link do Stripe Checkout gerado com sucesso!');
      setGeneratingStripe(false);
    }, 1200);
  };

  const handleUpdateFinanceStatus = async (status: string) => {
    if (!enrollmentId || !studentId) return;

    setLoading(true);
    try {
      // 1. Atualizar o status da matrícula no Firestore
      await updateDoc(doc(db, 'enrollments', enrollmentId), {
        status: status,
        updatedAt: serverTimestamp(),
        paymentMethod: paymentMethod
      });

      // 2. Se status for "pago" (Liberação Automática da Matrícula)
      if (status === 'pago') {
        const studentRef = doc(db, 'students', studentId);
        await updateDoc(studentRef, {
          hasActiveEnrollment: true,
          activeCourseId: courseId,
          activeCourseTitle: enrollment?.courseTitle,
          accessLiberationDate: serverTimestamp()
        });
        toast.success('Liberado Automaticamente: Acesso do aluno ativado com sucesso!');
      }

      setFinanceStatus(status);
      toast.success(`Financeiro atualizado: ${status.toUpperCase()}`);

    } catch (err: any) {
      console.error(err);
      toast.error(`Erro ao atualizar status do financeiro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center font-black italic tracking-tighter text-slate-800">
        PROCESSANDO FATURAMENTO E GERANDO MÓDULOS...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-red-600 font-bold tracking-[0.3em] uppercase text-[10px] block mb-2">
            Etapa 1.7 — Financeiro & Caixa
          </span>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">
            Gestão <span className="text-red-600">Financeira</span>
          </h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-2">
            Matrícula REF: {enrollmentId}
          </p>
        </div>
        <Link 
          to="/boss/visao-geral" 
          className="text-slate-500 hover:text-slate-950 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors duration-200"
        >
          Voltar para Home BOSS
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Lado Esquerdo: Detalhes do Débito / Faturamento */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm md:col-span-1 space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="font-black italic uppercase text-slate-900 tracking-tight">Fatura do Aluno</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dados consolidados do contrato</p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estudante Matrícula</p>
              <p className="text-sm font-extrabold text-slate-900 uppercase mt-1">{enrollment?.studentName}</p>
            </div>

            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Curso / Método</p>
              <p className="text-sm font-extrabold text-red-600 uppercase mt-1 leading-snug">{enrollment?.courseTitle}</p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Preço Integral</p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                R$ {enrollment?.coursePrice?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Lado Direito: Meios de Pagamento e Liberação */}
        <div className="md:col-span-2 space-y-8">
          {/* Métodos de Pagamento */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-800 font-semibold">
                <DollarSign size={16} />
              </div>
              <h2 className="text-lg font-black uppercase italic tracking-tight text-slate-900">
                1. Métodos de Cobrança Autorizados
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`py-6 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${paymentMethod === 'pix' ? 'border-red-600 bg-red-50 text-red-600 font-bold' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-300'}`}
              >
                <QrCode size={24} />
                <span className="text-[10px] font-black uppercase tracking-wider">PIX (Instantâneo)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cartao')}
                className={`py-6 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${paymentMethod === 'cartao' ? 'border-red-600 bg-red-50 text-red-600 font-bold' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-300'}`}
              >
                <CreditCard size={24} />
                <span className="text-[10px] font-black uppercase tracking-wider">Cartão de Crédito</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('boleto')}
                className={`py-6 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${paymentMethod === 'boleto' ? 'border-red-600 bg-red-50 text-red-600 font-bold' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-300'}`}
              >
                <Landmark size={24} />
                <span className="text-[10px] font-black uppercase tracking-wider">Boleto Bancário</span>
              </button>
            </div>
          </div>

          {/* Integração de link do Stripe (Checkout) */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4 hidden" alt="Stripe" />
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-800 font-semibold text-xs font-mono">
                S
              </div>
              <h2 className="text-lg font-black uppercase italic tracking-tight text-slate-900">
                2. Geração Stripe Link Checkout
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
                Envie o link seguro do Stripe Checkout para o cliente efetuar o pagamento diretamente na plataforma global.
              </p>

              {!stripeLink ? (
                <button
                  type="button"
                  onClick={handleGenerateStripe}
                  disabled={generatingStripe}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-xs tracking-widest px-8 py-3.5 rounded-xl transition-all inline-flex items-center gap-2"
                >
                  {generatingStripe ? 'PROCESSANDO LINK STRIPE...' : 'GERAR LINK STRIPE CHECKOUT'} <ExternalLink size={14} />
                </button>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-3">
                  <span className="text-[10px] font-mono select-all text-slate-600 tracking-wider font-semibold break-all">
                    {stripeLink}
                  </span>
                  <a
                    href={stripeLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-red-600 hover:text-slate-900 text-xs font-black uppercase tracking-widest inline-flex items-center gap-1.5"
                  >
                    ABRIR CHECKOUT AO VIVO <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Seletor de Status de Transação & Liberação Automática (Foco principal) */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center font-semibold">
                <ShieldCheck size={16} />
              </div>
              <h2 className="text-lg font-black uppercase italic tracking-tight text-slate-900">
                3. Transação & Despacho de Licença
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">Status Corrente</label>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { key: 'aguardando_pagamento', label: 'AGUARDANDO' },
                    { key: 'pago', label: 'PAGO (ATIVAR)' },
                    { key: 'recusado', label: 'RECUSADO' },
                    { key: 'vencido', label: 'VENCIDO' },
                    { key: 'cancelado', label: 'CANCELADO' }
                  ].map((status) => (
                    <button
                      key={status.key}
                      type="button"
                      onClick={() => handleUpdateFinanceStatus(status.key)}
                      className={`py-3.5 px-4 rounded-xl border font-bold uppercase text-[10px] tracking-widest hover:border-slate-350 transition-all ${financeStatus === status.key ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-slate-50 text-slate-500 border-slate-100'}`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {financeStatus === 'pago' && (
                <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-3 animate-fade-in">
                  <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-emerald-950 font-black uppercase tracking-wider text-[10px]">Liberação Automática Concluída!</p>
                    <p className="text-emerald-700 font-semibold uppercase tracking-wider text-[9px] leading-normal mt-1">
                      O Firestore compartilhado identificou esta transação e liberou com sucesso o acesso acadêmico para o aluno no respectivo método da Giffoni School.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
