import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Course } from '../../types';
import { ArrowRight, BookOpen, GraduationCap, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function BossEnrollment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('studentId');

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [studentName, setStudentName] = useState('');

  // Identificar se veio de "novo-aluno" ou "ja-sou-aluno"
  const isNewStudentFlow = location.pathname.includes('novo-aluno');

  useEffect(() => {
    if (!studentId) {
      toast.error('Identificador do aluno ausente no fluxo de matrícula.');
      navigate('/boss/cadastro');
      return;
    }

    const fetchData = async () => {
      try {
        // Carregar dados de identificação do aluno
        const studentDoc = await getDoc(doc(db, 'students', studentId));
        if (studentDoc.exists()) {
          setStudentName(studentDoc.data().fullName);
        } else {
          toast.error('Aluno não encontrado no banco de dados.');
          navigate('/boss/cadastro');
          return;
        }

        // Carregar cursos com status "published"
        const coursesQuery = query(collection(db, 'courses'), where('status', '==', 'published'));
        const coursesSnap = await getDocs(coursesQuery);
        const coursesList = coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        setCourses(coursesList);
        
        if (coursesList.length > 0) {
          setSelectedCourseId(coursesList[0].id || '');
        }

      } catch (err: any) {
        console.error(err);
        toast.error('Erro ao conectar e resgatar cursos ativos.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, navigate]);

  const handleEnroll = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedCourseId) {
      toast.error('Selecione uma formação ou curso ativo.');
      return;
    }

    const course = courses.find(c => c.id === selectedCourseId);
    if (!course) return;

    setLoading(true);

    try {
      // Registrar a matrícula preliminar com status aguardando financeiro
      const enrollmentPayload = {
        studentId,
        studentName,
        courseId: selectedCourseId,
        courseTitle: course.title,
        coursePrice: course.price,
        status: 'pendente_pagamento', // Inicial
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'enrollments'), enrollmentPayload);
      toast.success('Matrícula reservada com sucesso!');

      // Redirecionamento estrito para o módulo financeiro
      navigate(`/boss/cadastro/matricula/financeiro?enrollmentId=${docRef.id}&studentId=${studentId}&courseId=${selectedCourseId}`);

    } catch (err: any) {
      console.error(err);
      toast.error('Houve um erro operacional ao gravar solicitação de matrícula.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center font-black italic tracking-tighter text-slate-800">
        CARREGANDO PROCESSAMENTO ACADÊMICO...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="mb-10">
        <span className="text-red-600 font-bold tracking-[0.3em] uppercase text-[10px] block mb-2">
          {isNewStudentFlow ? 'Etapa 1.5 — Registro Prévio de Matrícula' : 'Etapa 1.6.3 — Matrícula Adicional'}
        </span>
        <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">
          Efetuar <span className="text-red-600">Matrícula</span>
        </h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-2">
          Aluno: {studentName}
        </p>
      </div>

      <form onSubmit={handleEnroll} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-800 font-semibold">
            <BookOpen size={16} />
          </div>
          <h2 className="text-lg font-black uppercase italic tracking-tight text-slate-900">
            Selecionar Grade / Método Ativo
          </h2>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 border border-dashed rounded-2xl border-slate-250">
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
              NENHUM CURSO PUBLICADO E ATIVO FOI LOCALIZADO NO FIRESTORE.
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Cadastre e ative cursos na aba "Cursos" do portal corporativo primeiro.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">Trilha de Formação Estudantil</label>
              <select 
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-4 px-4 text-xs font-bold uppercase transition-all outline-none"
              >
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title.toUpperCase()} — R$ {course.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
              <GraduationCap className="text-amber-600 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-amber-900 font-black uppercase tracking-wider text-[10px]">Importante: Registro Provisório</p>
                <p className="text-amber-700 font-bold uppercase tracking-wider text-[9px] leading-normal mt-1">
                  A ativação da licença do aluno e o envio de credenciais de boas-vindas do portal serão despachados automaticamente após a confirmação da transação no módulo financeiro a seguir.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <Link 
            to="/boss/cadastro" 
            className="text-slate-500 hover:text-slate-900 text-xs font-bold uppercase tracking-widest hover:underline"
          >
            Cancelar Processo
          </Link>
          
          <button
            type="submit"
            disabled={loading || courses.length === 0}
            className="bg-slate-900 hover:bg-red-600 text-white hover:shadow-xl px-10 py-4 rounded-full font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all duration-300 disabled:opacity-50"
          >
            AVANÇAR PARA FINANCEIRO <ArrowRight size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}
