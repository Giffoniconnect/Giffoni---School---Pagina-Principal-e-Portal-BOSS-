import { useState, useEffect, FormEvent } from 'react';
import { db } from '../../lib/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, getDocs, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { 
  ArrowLeft, ArrowRight, Save, Eye, Rocket, Copy, Archive, Trash2, 
  Plus, Pencil, Check, Award, DollarSign, Users, CheckCircle2, 
  X, Layers, Film, FileText, Layout, Calendar, List, MoveUp, MoveDown, HelpCircle, AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { Course } from '../../types';

interface BossCourseWizardProps {
  courseId: string | null;
  onClose: () => void;
}

export default function BossCourseWizard({ courseId, onClose }: BossCourseWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Core State containing all 14 steps parameters
  const [formData, setFormData] = useState({
    // Step 1 - Identificação
    title: '',
    slug: '',
    subtitle: '',
    category: 'Advocacia',
    teacherId: '',
    teacherName: '',
    coauthor: '',
    thumbnailUrl: '',
    bannerUrl: '',
    trailerUrl: '',

    // Step 2 - Apresentação Comercial
    shortDescription: '',
    fullDescription: '',
    objectives: '',
    targetAudience: '',
    prerequisites: '',
    learningOutcomes: '',

    // Step 3 - Pedagógico Checkboxes
    hasCertificate: true,
    hasActivities: false,
    hasActionPlan: false,
    hasComplementaryMaterial: false,
    hasCommunity: false,
    hasFinalAssessment: false,
    isUpdatable: true,

    // Step 4 & 5 - Estrutura Curricular (loaded & saved as JSON)
    modules: [] as any[],

    // Step 6 - Biblioteca de Materiais (list of objects)
    materials: [] as any[],

    // Step 7 - Atividades e Avaliações
    activities: [] as any[],

    // Step 8 - Plano de Ação
    actionPlanSteps: [] as any[],

    // Step 9 - Certificação
    totalHours: 40,
    approvalCriteria: 'Conclusão de 100% das aulas + Nota mínima na avaliação',
    certMinGrade: 70,
    certTemplate: 'modelo_standard_giffoni',
    certAutoEmit: true,

    // Step 10 - Financeiro
    isFree: false,
    price: 997,
    promoPrice: 497,
    maxInstallments: 12,
    payPix: true,
    payBoleto: true,
    payCard: true,

    // Step 11 - Professores e Comissões
    professorShare: 70,
    partnerShare: 20,
    schoolShare: 10,
    commissionNotes: '',

    // Step 12 - Disponibilidade
    status: 'draft' as 'draft' | 'published' | 'archived',
    lifecycleStatus: 'construction' as 'draft' | 'construction' | 'revision' | 'published' | 'archived',

    // Step 13 - Exibição
    showOnHome: true,
    featuredCourse: false,
    showInShowcase: true,
    showInCarousel: false,
    showInPromotions: false,
  });

  // State for adding module / lesson / material / activity / action plan items
  const [newModuleName, setNewModuleName] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');
  const [newLessonName, setNewLessonName] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState('15 min');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState('');
  
  // Editor preview mode inside step 2
  const [richPreview, setRichPreview] = useState(false);

  // Active Teachers from database/fallback
  const [availableTeachers, setAvailableTeachers] = useState<any[]>([
    { id: 't1', name: 'Dr. Roberto Giffoni' },
    { id: 't2', name: 'Dra. Sandra de Souza' },
    { id: 't3', name: 'Prof. Marcos Silva' }
  ]);

  // Load course details
  useEffect(() => {
    async function loadData() {
      // Load teachers from database
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const teachersList = usersSnap.docs
          .map(d => ({ id: d.id, ...d.data() } as any))
          .filter(u => u.role === 'PROFESSOR' || u.role === 'SUPER_BOSS');
        if (teachersList.length > 0) {
          setAvailableTeachers(teachersList);
        }
      } catch (err) {
        console.error("Erro ao buscar professores:", err);
      }

      if (!courseId) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData(prev => ({
            ...prev,
            ...data,
            // Fallback checking to keep structure stable
            modules: data.modules || [],
            materials: data.materials || [],
            activities: data.activities || [],
            actionPlanSteps: data.actionPlanSteps || [],
          }));
          if (data.currentStep) {
            setCurrentStep(data.currentStep);
          }
        } else {
          toast.error("Curso não encontrado.");
        }
      } catch (err) {
        console.error("Erro ao carregar curso:", err);
        toast.error("Erro ao carregar dados do curso.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [courseId]);

  // Generate automated slug based on title
  useEffect(() => {
    if (!courseId && formData.title) {
      const generatedSlug = formData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title, courseId]);

  // Handle Input Changes
  const updateField = (field: string, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  // Real-time automatic / manual save to Firebase Firestore
  const saveProgress = async (stepOverride?: number) => {
    const nextStepToSave = stepOverride || currentStep;
    setSaving(true);
    try {
      const payload = {
        ...formData,
        currentStep: nextStepToSave,
        updatedAt: serverTimestamp(),
      };

      if (courseId) {
        await setDoc(doc(db, 'courses', courseId), payload, { merge: true });
      } else {
        // If it's a new course, create the reservation first
        const docRef = await addDoc(collection(db, 'courses'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success("Progresso inicial salvo com sucesso!");
        window.location.reload(); // Refresh to switch to editing mode
        return;
      }
    } catch (err: any) {
      console.error(err);
      toast.error(`Falha no salvamento automático: ${err.message || 'Erro de rede'}`);
    } finally {
      setSaving(false);
    }
  };

  // Safe navigation
  const nextStep = async () => {
    // Current Step Validations
    if (currentStep === 1) {
      if (!formData.title.trim()) { return toast.error("O Nome do Curso é obrigatório."); }
      if (!formData.slug.trim()) { return toast.error("O Slug do Curso é obrigatório."); }
      if (!formData.category.trim()) { return toast.error("Por favor, selecione uma Categoria."); }
    }
    if (currentStep === 2) {
      if (!formData.shortDescription.trim()) { return toast.error("A descrição curta é obrigatória."); }
      if (!formData.fullDescription.trim()) { return toast.error("A apresentação completa do curso é obrigatória."); }
    }
    if (currentStep === 11) {
      const total = formData.professorShare + formData.partnerShare + formData.schoolShare;
      if (total !== 100) {
        return toast.error(`A soma das comissões deve ser exatamente 100%! Atualmente está em ${total}%`);
      }
    }

    const next = Math.min(14, currentStep + 1);
    setCurrentStep(next);
    await saveProgress(next);
  };

  const prevStep = async () => {
    const prev = Math.max(1, currentStep - 1);
    setCurrentStep(prev);
    await saveProgress(prev);
  };

  // --- COMPONENT HELPERS ---
  
  // Custom rich formatting appender for presentations
  const appendRichFormatting = (tag: string) => {
    const field = 'fullDescription';
    let added = '';
    if (tag === 'bold') added = '**Negrito**';
    if (tag === 'italic') added = '*Itálico*';
    if (tag === 'heading') added = '\n### Título da Seção\n';
    if (tag === 'bullet') added = '\n• Item de lista\n';
    if (tag === 'quote') added = '\n> Citação ou destaque\n';
    
    setFormData(prev => ({
      ...prev,
      [field]: prev.fullDescription + added
    }));
  };

  // Step 4 - Curriculum manager
  const addModule = () => {
    if (!newModuleName.trim()) return toast.error("Digite o nome do módulo.");
    const newModule = {
      id: 'mod_' + Date.now(),
      title: newModuleName,
      description: newModuleDesc,
      order: formData.modules.length + 1,
      lessons: [],
      isHidden: false
    };
    updateField('modules', [...formData.modules, newModule]);
    setNewModuleName('');
    setNewModuleDesc('');
    toast.success("Módulo curricular adicionado!");
  };

  const addLesson = (modId: string) => {
    if (!newLessonName.trim()) return toast.error("Digite o nome da aula.");
    const updatedModules = formData.modules.map(mod => {
      if (mod.id === modId) {
        const newL = {
          id: 'les_' + Date.now(),
          title: newLessonName,
          duration: newLessonDuration,
          order: (mod.lessons || []).length + 1,
          contentType: 'video',
          videoUrl: '',
          materialComplementarUrl: '',
          isFree: false,
          isRequired: true,
          releaseImmediately: true,
          isHidden: false,
          description: ''
        };
        return { ...mod, lessons: [...(mod.lessons || []), newL] };
      }
      return mod;
    });
    updateField('modules', updatedModules);
    setNewLessonName('');
    toast.success("Aula vinculada ao módulo com sucesso!");
  };

  const reorderModule = (index: number, direction: 'up' | 'down') => {
    const list = [...formData.modules];
    if (direction === 'up' && index > 0) {
      [list[index], list[index - 1]] = [list[index - 1], list[index]];
    } else if (direction === 'down' && index < list.length - 1) {
      [list[index], list[index + 1]] = [list[index + 1], list[index]];
    }
    // recalculate orders
    const updated = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    updateField('modules', updated);
  };

  const deleteModule = (modId: string) => {
    const filtered = formData.modules.filter(m => m.id !== modId);
    updateField('modules', filtered);
    toast.success("Módulo removido da grade.");
  };

  const deleteLesson = (modId: string, lesId: string) => {
    const updated = formData.modules.map(mod => {
      if (mod.id === modId) {
        return {
          ...mod,
          lessons: mod.lessons.filter((l: any) => l.id !== lesId)
        };
      }
      return mod;
    });
    updateField('modules', updated);
    toast.success("Aula descartada.");
  };

  // Step 6: Material library helpers
  const addMaterial = (name: string, category: string, desc: string, modId: string, lesId: string, url: string) => {
    const item = {
      id: 'mat_' + Date.now(),
      name,
      category,
      description: desc,
      moduleId: modId,
      lessonId: lesId,
      fileUrl: url
    };
    updateField('materials', [...formData.materials, item]);
    toast.success("Material cadastrado na biblioteca!");
  };

  // Step 7: Activities helpers
  const addActivity = (question: string, type: string, model: string, minG: number, isReq: boolean) => {
    const act = {
      id: 'act_' + Date.now(),
      question,
      type,
      modelAnswer: model,
      minGrade: minG,
      isRequired: isReq
    };
    updateField('activities', [...formData.activities, act]);
    toast.success("Atividade cadastrada com sucesso!");
  };

  // Step 8: Action Plan helpers
  const addActionPlanStep = (title: string, obj: string, desc: string, deadline: string, result: string) => {
    const stepObj = {
      id: 'plan_' + Date.now(),
      title,
      objective: obj,
      description: desc,
      targetDeadline: deadline,
      expectedResult: result,
      isHidden: false
    };
    updateField('actionPlanSteps', [...formData.actionPlanSteps, stepObj]);
    toast.success("Meta estratégica adicionada ao Plano de Ação!");
  };

  // Step 14 Final checklist calculation
  const getValidationSummary = () => {
    const checks = {
      basicInfo: formData.title.length > 3 && formData.slug.length > 3,
      description: formData.shortDescription.length > 10 && formData.fullDescription.length > 20,
      pedagogical: true, 
      curriculum: formData.modules.length > 0 && formData.modules.some(m => m.lessons.length > 0),
      contents: formData.modules.some(m => m.lessons.some((l: any) => l.videoUrl || l.description || l.contentType)),
      materials: formData.materials.length > 0 || !formData.hasComplementaryMaterial,
      activities: formData.activities.length > 0 || !formData.hasActivities,
      actionPlan: formData.actionPlanSteps.length > 0 || !formData.hasActionPlan,
      certification: formData.totalHours > 0,
      finance: formData.isFree || formData.price > 0,
      commission: (formData.professorShare + formData.partnerShare + formData.schoolShare) === 100,
      availability: !!formData.lifecycleStatus
    };
    return checks;
  };

  // Course duplicator
  const duplicateCourse = async () => {
    setSaving(true);
    try {
      const duplicated = {
        ...formData,
        title: `${formData.title} (CÓPIA)`,
        slug: `${formData.slug}-copia-${Date.now()}`,
        status: 'draft',
        lifecycleStatus: 'construction',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'courses'), duplicated);
      toast.success("Curso duplicado com sucesso! Redirecionando...");
      onClose();
    } catch (err: any) {
      toast.error("Erro ao duplicar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Course deleter
  const deleteCoursePermanently = async () => {
    if (!courseId) return;
    if (confirm("Tem certeza absoluta que deseja excluir este rascunho permanentemente?")) {
      setSaving(true);
      try {
        await deleteDoc(doc(db, 'courses', courseId));
        toast.success("Curso deletado definitivamente.");
        onClose();
      } catch (err: any) {
        toast.error("Erro ao excluir: " + err.message);
      } finally {
        setSaving(false);
      }
    }
  };

  // Publish
  const publishCourse = async () => {
    const totalShare = formData.professorShare + formData.partnerShare + formData.schoolShare;
    if (totalShare !== 100) {
      return toast.error(`Não é possível publicar: Repasse de comissão inválido (${totalShare}%)`);
    }
    if (formData.modules.length === 0) {
      return toast.error("Não é possível publicar um curso sem nenhum módulo pedagógico.");
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, 'courses', courseId!), {
        status: 'published',
        lifecycleStatus: 'published',
        updatedAt: serverTimestamp()
      });
      toast.success("🚀 CURSO PUBLICADO COM SUCESSO!");
      onClose();
    } catch (err: any) {
      toast.error("Erro ao publicar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // State trackers for items forms
  const [tempMat, setTempMat] = useState({ name: '', cat: 'PDF', desc: '', modId: '', lesId: '', url: '' });
  const [tempAct, setTempAct] = useState({ question: '', type: 'multichoice', model: '', minG: 70, isReq: true });
  const [tempPlan, setTempPlan] = useState({ title: '', obj: '', desc: '', deadline: '15 dias', result: '' });

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600 border-r-2"></div>
        <p className="font-extrabold text-slate-800 tracking-wider text-xs uppercase animate-pulse">
          Sincronizando construtor educacional do portal...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen rounded-3xl p-6 md:p-10 space-y-8 relative">
      
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-1">
          <span className="text-[10px] font-black tracking-[0.3em] text-red-600 uppercase block">
            Módulo Pedagógico Executivo
          </span>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
            {courseId ? 'Editar Formação ' : 'Criar Novo '}
            <span className="text-red-500">Curso</span>
          </h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            {formData.title ? `"${formData.title}"` : 'Assistente Avançado de Sequenciamento Intelectual'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-3 border border-slate-200 hover:border-slate-800 text-slate-600 hover:text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-full transition-all flex items-center gap-2 bg-white"
          >
            <X size={14} /> Sair do Construtor
          </button>
          
          <button 
            type="button" 
            onClick={() => saveProgress()}
            disabled={saving}
            className="px-6 py-3 bg-semibold bg-white border border-red-600/30 text-red-600 hover:bg-slate-950 hover:text-white rounded-full font-black text-[10px] uppercase tracking-wider transition-all duration-300 flex items-center gap-2"
          >
            <Save size={14} /> {saving ? 'SALVANDO...' : 'SALVAR RASCUNHO'}
          </button>
        </div>
      </div>

      {/* Progress Bar & Stage Indicator */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="bg-red-100 text-red-700 font-black px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">
              Etapa {currentStep} de 14
            </span>
            <span className="text-slate-800 font-extrabold uppercase tracking-tight text-sm">
              {currentStep === 1 && '1. IDENTIFICAÇÃO BÁSICA'}
              {currentStep === 2 && '2. APRESENTAÇÃO COMERCIAL e POSICIONAMENTO'}
              {currentStep === 3 && '3. MATRIZ PEDAGÓGICA'}
              {currentStep === 4 && '4. ESTRUTURA CURRICULAR (MÓDULOS & AULAS)'}
              {currentStep === 5 && '5. CONTEÚDO E REQUISITOS DAS AULAS'}
              {currentStep === 6 && '6. BIBLIOTECA DE ACESSÓRIOS PEDAGÓGICOS'}
              {currentStep === 7 && '7. ATIVIDADES, FIXAÇÃO & AVALIAÇÕES'}
              {currentStep === 8 && '8. PLANO DE AÇÃO EXECUTIVO (GIFFONI EXCLUSIVE)'}
              {currentStep === 9 && '9. PARAMETRIZAÇÃO DE CERTIFICAÇÃO'}
              {currentStep === 10 && '10. FINANCEIRO DO PRODUTO'}
              {currentStep === 11 && '11. PROFESSORES E COMISSÕES'}
              {currentStep === 12 && '12. CICLO DE VIDA E DISPONIBILIDADE'}
              {currentStep === 13 && '13. CONFIGURAÇÃO DE VITRINE'}
              {currentStep === 14 && '14. REVISÃO GERAL DO PRODUTO'}
            </span>
          </div>
          <span className="text-slate-400 font-extrabold text-[10px] tracking-wider uppercase">
            Progresso Geral: {Math.round((currentStep / 14) * 100)}%
          </span>
        </div>

        {/* Progress tracks container */}
        <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-red-600 transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 14) * 100}%` }}
          />
        </div>

        {/* Jump-to-step helper */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {Array.from({ length: 14 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (courseId) {
                  setCurrentStep(i + 1);
                  saveProgress(i + 1);
                } else {
                  toast.error("Salve o progresso inicial na etapa 1 antes de navegar.");
                }
              }}
              className={`w-7 h-7 rounded-lg text-[10px] font-black flex items-center justify-center transition-all ${
                currentStep === i + 1 
                  ? 'bg-red-600 text-white shadow-sm' 
                  : i + 1 < currentStep 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
              title={`Ir para etapa ${i + 1}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Main Wizard Form Body */}
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm min-h-[50vh] flex flex-col justify-between space-y-10">
        
        {/* Step Contents switcher */}
        <div className="space-y-8">
          
          {/* STEP 1: IDENTIFICATION */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 uppercase italic tracking-tight">1. Identificação Básica do Produto</h3>
                <p className="text-xs text-slate-400 font-semibold uppercase">Cadastre as regras básicas de indexação e identidade da nova formação.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Nome do Curso *</label>
                  <input 
                    type="text"
                    placeholder="E.G. MBA EM ADPLICABILIDADE TRIBUTÁRIA CORPORATIVA"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold uppercase outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">URL Slug amigável *</label>
                  <input 
                    type="text"
                    value={formData.slug}
                    onChange={(e) => updateField('slug', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-mono tracking-wide outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Categoria Pedagógica *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold uppercase outline-none transition-all"
                  >
                    <option value="Advocacia">Advocacia Prática</option>
                    <option value="Tributário">Regras Tributárias</option>
                    <option value="Tribunal">Práticas de Tribunal</option>
                    <option value="Contabilidade">Contabilidade Executiva</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Subtítulo ou Chamada Comercial</label>
                  <input 
                    type="text"
                    placeholder="DESCRIÇÃO COMERCIAL RÁPIDA DE APRESENTAÇÃO NA VITRINE"
                    value={formData.subtitle}
                    onChange={(e) => updateField('subtitle', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold uppercase outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Professor Responsável *</label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => {
                      const t = availableTeachers.find(item => item.id === e.target.value);
                      setFormData(prev => ({ 
                        ...prev, 
                        teacherId: e.target.value, 
                        teacherName: t ? (t.displayName || t.name) : '' 
                      }));
                    }}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold uppercase outline-none transition-all"
                  >
                    <option value="">Selecione o professor...</option>
                    {availableTeachers.map(teach => (
                      <option key={teach.id} value={teach.id}>{teach.displayName || teach.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Coautor ou Professor Adjunto</label>
                  <input 
                    type="text"
                    placeholder="PROFESSOR COAUTOR DO TREINAMENTO"
                    value={formData.coauthor}
                    onChange={(e) => updateField('coauthor', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold uppercase outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">URL da Capa (Capa Miniatura)</label>
                  <input 
                    type="text"
                    placeholder="HTTPS://EXEMPLO.COM/IMAGENS/CAPA.JPG"
                    value={formData.thumbnailUrl}
                    onChange={(e) => updateField('thumbnailUrl', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-semibold outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">URL do Banner do Curso</label>
                  <input 
                    type="text"
                    placeholder="HTTPS://EXEMPLO.COM/IMAGENS/BANNER.JPG"
                    value={formData.bannerUrl}
                    onChange={(e) => updateField('bannerUrl', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-semibold outline-none transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Vídeo de Trailer / Pitch Comercial (URL)</label>
                  <input 
                    type="text"
                    placeholder="HTTPS://YOUTUBE.COM/WATCH?V=..."
                    value={formData.trailerUrl}
                    onChange={(e) => updateField('trailerUrl', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-semibold outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PRESENTATION & RICH EDITOR */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 uppercase italic tracking-tight">2. Apresentação e Posicionamento Comercial</h3>
                <p className="text-xs text-slate-400 font-semibold uppercase">Descreva rigorosamente o seu produto, destacando objetivos e justificativas mercadológicas.</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Descrição Curta (Vitrine) *</label>
                  <textarea 
                    rows={2}
                    placeholder="SÍNTESE ATRAENTE PARA DIVULGAÇÃO RÁPIDA (RECOMENDADO COMPACTO)"
                    value={formData.shortDescription}
                    onChange={(e) => updateField('shortDescription', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold uppercase outline-none transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Apresentação Completa do Curso (Editor Rico) *</label>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                      <button 
                        type="button" 
                        onClick={() => setRichPreview(false)}
                        className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-colors ${!richPreview ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                      >
                        Editor
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          if (!formData.fullDescription) {
                            toast.error("O campo está vazio.");
                            return;
                          }
                          setRichPreview(true);
                        }}
                        className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-colors ${richPreview ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                      >
                        Visualizar HTML
                      </button>
                    </div>
                  </div>

                  {!richPreview ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 flex-wrap bg-slate-100 p-2 rounded-xl border border-slate-200">
                        <button type="button" onClick={() => appendRichFormatting('bold')} className="p-1 px-2.5 bg-white border rounded text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm">B</button>
                        <button type="button" onClick={() => appendRichFormatting('italic')} className="p-1 px-2.5 bg-white border rounded text-xs italic text-slate-700 hover:bg-slate-50 shadow-sm">I</button>
                        <button type="button" onClick={() => appendRichFormatting('heading')} className="p-1 px-2.5 bg-white border rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm">H3</button>
                        <button type="button" onClick={() => appendRichFormatting('bullet')} className="p-1 px-2.5 bg-white border rounded text-xs text-slate-700 hover:bg-slate-50 shadow-sm">Lista •</button>
                        <button type="button" onClick={() => appendRichFormatting('quote')} className="p-1 px-2.5 bg-white border rounded text-xs text-slate-700 hover:bg-slate-50 shadow-sm">Citação ”</button>
                      </div>
                      <textarea
                        rows={6}
                        placeholder="CONTEÚDO DETALHADO DO CURSO UTILIZANDO AS MARCAÇÕES RICAS ACIMA..."
                        value={formData.fullDescription}
                        onChange={(e) => updateField('fullDescription', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-semibold outline-none transition-all min-h-[160px]"
                      />
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl min-h-[160px] text-xs font-semibold prose prose-slate">
                      {formData.fullDescription.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Objetivos Metodológicos</label>
                    <textarea 
                      rows={3}
                      placeholder="DIRETRIZES E OBJETIVOS DE APRENDIZAGEM..."
                      value={formData.objectives}
                      onChange={(e) => updateField('objectives', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold uppercase outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Público-Alvo Recomendado</label>
                    <textarea 
                      rows={3}
                      placeholder="PERFIL DOS ALUNOS RECOMENDADOS PARA ADMISSÃO..."
                      value={formData.targetAudience}
                      onChange={(e) => updateField('targetAudience', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold uppercase outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Pré-Requisitos Técnicos</label>
                    <textarea 
                      rows={3}
                      placeholder="CONHECIMENTOS PRÉVIOS EXIGIDOS PARA MATRÍCULA..."
                      value={formData.prerequisites}
                      onChange={(e) => updateField('prerequisites', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold uppercase outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">O que o aluno aprenderá na Formação</label>
                    <textarea 
                      rows={3}
                      placeholder="HABILIDADES DIRETAS QUE ESTARÃO NO PLANO DE EXECUÇÃO..."
                      value={formData.learningOutcomes}
                      onChange={(e) => updateField('learningOutcomes', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl py-3 px-4 text-xs font-bold uppercase outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PEDAGOGICAL CONFIGURATION */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 uppercase italic tracking-tight">3. Matriz de Configurações Pedagógicas</h3>
                <p className="text-xs text-slate-400 font-semibold uppercase">Selecione e ative as diretrizes educacionais que estruturam esse produto de conhecimento.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div onClick={() => updateField('hasCertificate', !formData.hasCertificate)} className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${formData.hasCertificate ? 'bg-red-50/40 border-red-500' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                  <input type="checkbox" checked={formData.hasCertificate} readOnly className="mt-1 accent-red-600" />
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase">Emissão de Certificado Oficial Giffoni</p>
                    <p className="text-[10px] text-slate-500 font-medium">Define se a conclusão garante emissão de certificado chancelado de carga horária especificada.</p>
                  </div>
                </div>

                <div onClick={() => updateField('hasActivities', !formData.hasActivities)} className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${formData.hasActivities ? 'bg-red-50/40 border-red-500' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                  <input type="checkbox" checked={formData.hasActivities} readOnly className="mt-1 accent-red-600" />
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase">Possui Exercícios e Atividades de Fixação</p>
                    <p className="text-[10px] text-slate-500 font-medium font-semibold uppercase">Permite inclusão de questionários e estudos de caso corporativos reais.</p>
                  </div>
                </div>

                <div onClick={() => updateField('hasActionPlan', !formData.hasActionPlan)} className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${formData.hasActionPlan ? 'bg-red-50/40 border-red-500' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                  <input type="checkbox" checked={formData.hasActionPlan} readOnly className="mt-1 accent-red-600" />
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase">Habilitar Plano de Ação Estratégico</p>
                    <p className="text-[10px] text-slate-500 font-medium">Ativa o diferencial exclusivo da Giffoni School para acompanhamento de tarefas práticas sequenciadas.</p>
                  </div>
                </div>

                <div onClick={() => updateField('hasComplementaryMaterial', !formData.hasComplementaryMaterial)} className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${formData.hasComplementaryMaterial ? 'bg-red-50/40 border-red-500' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                  <input type="checkbox" checked={formData.hasComplementaryMaterial} readOnly className="mt-1 accent-red-600" />
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase">Biblioteca de Materiais de Apoio</p>
                    <p className="text-[10px] text-slate-500 font-medium">Habilita repositórios para checklists, arquivos PPT, decisões e modelos de petições.</p>
                  </div>
                </div>

                <div onClick={() => updateField('hasCommunity', !formData.hasCommunity)} className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${formData.hasCommunity ? 'bg-red-50/40 border-red-500' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                  <input type="checkbox" checked={formData.hasCommunity} readOnly className="mt-1 accent-red-600" />
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase">Comunidade Global Intelectiva de Alunos</p>
                    <p className="text-[10px] text-slate-500 font-medium font-semibold uppercase">Ativa um ambiente interativo para perguntas, sugestões e debates de alta estirpe jurídica.</p>
                  </div>
                </div>

                <div onClick={() => updateField('hasFinalAssessment', !formData.hasFinalAssessment)} className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${formData.hasFinalAssessment ? 'bg-red-50/40 border-red-500' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                  <input type="checkbox" checked={formData.hasFinalAssessment} readOnly className="mt-1 accent-red-600" />
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase">Prova de Teste Final Obrigatória</p>
                    <p className="text-[10px] text-slate-500 font-medium">Exige aprovação com nota de corte na avaliação final de conhecimentos.</p>
                  </div>
                </div>

                <div onClick={() => updateField('isUpdatable', !formData.isUpdatable)} className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${formData.isUpdatable ? 'bg-red-50/40 border-red-500' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                  <input type="checkbox" checked={formData.isUpdatable} readOnly className="mt-1 accent-red-600" />
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase">Programa Educacional Atualizável</p>
                    <p className="text-[10px] text-slate-500 font-medium">Sinaliza para o discente que o material receberá novas aulas conforme mudanças em tribunais superiores.</p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 4: CURRICULUM GRADE */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 uppercase italic tracking-tight">4. Estrutura Curricular e Grade de Ensino</h3>
                <p className="text-xs text-slate-400 font-semibold uppercase">Estruture os módulos da formação e vincule as respectivas aulas pedagógicas.</p>
              </div>

              {/* Form to add modules */}
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-4">
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <Layers size={14} className="text-red-500" /> + Adicionar Novo Módulo Letivo
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input 
                    type="text" 
                    placeholder="E.G. MÓDULO I: FUNDAMENTAÇÃO LEGAL" 
                    value={newModuleName}
                    onChange={(e) => setNewModuleName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold uppercase transition-all outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="DESCRIÇÃO RÁPIDA..." 
                    value={newModuleDesc}
                    onChange={(e) => setNewModuleDesc(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold uppercase transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={addModule}
                    className="bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                  >
                    <Plus size={14} /> ADICIONAR MÓDULO
                  </button>
                </div>
              </div>

              {/* Modules list with reordering and nested Lesson creations */}
              <div className="space-y-6">
                {formData.modules.length === 0 ? (
                  <p className="text-center py-6 text-slate-400 font-bold uppercase text-[10px] italic border-2 border-dashed border-slate-200 rounded-2xl">
                    Nenhum módulo criado para esta grade ainda. Adicione acima.
                  </p>
                ) : (
                  formData.modules.map((mod, idx) => (
                    <div key={mod.id} className="bg-white border-2 border-slate-100 rounded-2xl p-6 space-y-5 shadow-sm">
                      <div className="flex items-center justify-between border-b pb-3 flex-wrap gap-4">
                        <div>
                          <p className="text-[9px] font-black text-red-600 tracking-wider">MÓDULO {idx + 1} DE {formData.modules.length}</p>
                          <h4 className="font-extrabold text-slate-900 text-sm uppercase">{mod.title}</h4>
                          <span className="text-[10px] text-slate-400 font-semibold">{mod.description || 'Sem descrição cadastrada'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => reorderModule(idx, 'up')} className="p-1 px-2 hover:bg-slate-100 rounded text-slate-500 transition-colors" title="Mover para cima">
                            <MoveUp size={14} />
                          </button>
                          <button type="button" onClick={() => reorderModule(idx, 'down')} className="p-1 px-2 hover:bg-slate-100 rounded text-slate-500 transition-colors" title="Mover para baixo">
                            <MoveDown size={14} />
                          </button>
                          <button type="button" onClick={() => deleteModule(mod.id)} className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors" title="Remover módulo">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Lesson creator inside module */}
                      <div className="bg-slate-50 p-4 rounded-xl flex flex-col md:flex-row items-center gap-3">
                        <input 
                          type="text" 
                          placeholder="NOME DA NOVA AULA..." 
                          value={selectedModuleId === mod.id ? newLessonName : ''}
                          onChange={(e) => {
                            setSelectedModuleId(mod.id);
                            setNewLessonName(e.target.value);
                          }}
                          className="flex-1 bg-white border border-slate-250 rounded-lg py-2 px-3 text-xs font-semibold uppercase outline-none"
                        />
                        <select
                          value={selectedModuleId === mod.id ? newLessonDuration : '15 min'}
                          onChange={(e) => {
                            setSelectedModuleId(mod.id);
                            setNewLessonDuration(e.target.value);
                          }}
                          className="bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold outline-none"
                        >
                          <option value="10 min">10 min</option>
                          <option value="15 min">15 min</option>
                          <option value="30 min">30 min</option>
                          <option value="45 min">45 min</option>
                          <option value="60 min">60 min</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => addLesson(mod.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg text-[10px] font-black tracking-wider uppercase hover:bg-slate-900 transition-colors"
                        >
                          + VINCULAR AULA
                        </button>
                      </div>

                      {/* Nested Lessons table list */}
                      <div className="space-y-2 pl-4 border-l-2 border-red-500/30">
                        {(!mod.lessons || mod.lessons.length === 0) ? (
                          <p className="text-[10px] font-semibold italic text-slate-400">Nenhuma aula mapeada para este módulo.</p>
                        ) : (
                          mod.lessons.map((les: any, lIdx: number) => (
                            <div key={les.id} className="flex items-center justify-between text-xs bg-slate-50/50 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                              <span className="font-extrabold uppercase text-slate-800">
                                {lIdx + 1}. {les.title} <span className="text-[10px] font-mono text-slate-400">({les.duration})</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <button type="button" onClick={() => deleteLesson(mod.id, les.id)} className="p-1 text-slate-400 hover:text-red-600 transition-colors">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* STEP 5: LESSON DETAIL CONTENT */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 uppercase italic tracking-tight">5. Conteúdo e Mídia das Aulas</h3>
                <p className="text-xs text-slate-400 font-semibold uppercase">Instale os conteúdos (vídeos, PDFs, powerpoints) de cada aula estruturada.</p>
              </div>

              {formData.modules.length === 0 ? (
                <p className="text-center py-10 text-slate-400 font-bold uppercase italic text-[10px]">Crie módulos e aulas na Etapa anterior antes de configurar mídias.</p>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Selecione o Módulo Letivo</label>
                      <select 
                        value={selectedModuleId}
                        onChange={(e) => {
                          setSelectedModuleId(e.target.value);
                          setSelectedLessonId('');
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold uppercase outline-none"
                      >
                        <option value="">Selecione o módulo...</option>
                        {formData.modules.map(m => (
                          <option key={m.id} value={m.id}>{m.title}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Selecione a Aula Alvo</label>
                      <select 
                        value={selectedLessonId}
                        onChange={(e) => setSelectedLessonId(e.target.value)}
                        disabled={!selectedModuleId}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold uppercase outline-none"
                      >
                        <option value="">Selecione a aula...</option>
                        {(formData.modules.find(m => m.id === selectedModuleId)?.lessons || []).map((l: any) => (
                          <option key={l.id} value={l.id}>{l.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedLessonId && (
                    <div className="bg-red-50/10 border border-red-100 rounded-2xl p-6 md:p-8 space-y-6">
                      <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b pb-3">
                        Configurando: <span className="text-red-600">{(formData.modules.find(m => m.id === selectedModuleId)?.lessons || []).find((l: any) => l.id === selectedLessonId)?.title}</span>
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Tipo de Aula</label>
                          <select
                            value={(formData.modules.find(m => m.id === selectedModuleId)?.lessons || []).find((l: any) => l.id === selectedLessonId)?.contentType || 'video'}
                            onChange={(e) => {
                              const updated = formData.modules.map(m => {
                                if (m.id === selectedModuleId) {
                                  return {
                                    ...m,
                                    lessons: m.lessons.map((les: any) => {
                                      if (les.id === selectedLessonId) {
                                        return { ...les, contentType: e.target.value };
                                      }
                                      return les;
                                    })
                                  };
                                }
                                return m;
                              });
                              updateField('modules', updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-bold uppercase outline-none"
                          >
                            <option value="video">🎞 Vídeo institucional</option>
                            <option value="pdf">📄 Documento PDF complementar</option>
                            <option value="powerpoint">⚙ PPT de Projeção</option>
                            <option value="text">✍ Conteúdo em Texto corrido</option>
                            <option value="audio">🔊 Arquivo de Áudio</option>
                            <option value="live">⚡ Transmissão de Live integrada</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">URL primária de mídia (Vimeo, YouTube, Drive)</label>
                          <input 
                            type="text"
                            placeholder="HTTPS://YOUTUBE.COM/WATCH?V=..."
                            value={(formData.modules.find(m => m.id === selectedModuleId)?.lessons || []).find((l: any) => l.id === selectedLessonId)?.videoUrl || ''}
                            onChange={(e) => {
                              const updated = formData.modules.map(m => {
                                if (m.id === selectedModuleId) {
                                  return {
                                    ...m,
                                    lessons: m.lessons.map((les: any) => {
                                      if (les.id === selectedLessonId) {
                                        return { ...les, videoUrl: e.target.value };
                                      }
                                      return les;
                                    })
                                  };
                                }
                                return m;
                              });
                              updateField('modules', updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Resumo da Aula / Texto complementar</label>
                          <textarea
                            rows={3}
                            placeholder="SÍNTESE PARA DESTAQUE DA AULA..."
                            value={(formData.modules.find(m => m.id === selectedModuleId)?.lessons || []).find((l: any) => l.id === selectedLessonId)?.description || ''}
                            onChange={(e) => {
                              const updated = formData.modules.map(m => {
                                if (m.id === selectedModuleId) {
                                  return {
                                    ...m,
                                    lessons: m.lessons.map((les: any) => {
                                      if (les.id === selectedLessonId) {
                                        return { ...les, description: e.target.value };
                                      }
                                      return les;
                                    })
                                  };
                                }
                                return m;
                              });
                              updateField('modules', updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold uppercase outline-none"
                          />
                        </div>

                        {/* Special Checkboxes */}
                        <div className="space-y-3 pt-4">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.modules.map(m => {
                                if (m.id === selectedModuleId) {
                                  return {
                                    ...m,
                                    lessons: m.lessons.map((les: any) => {
                                      if (les.id === selectedLessonId) {
                                        return { ...les, isFree: !les.isFree };
                                      }
                                      return les;
                                    })
                                  };
                                }
                                return m;
                              });
                              updateField('modules', updated);
                            }}
                            className="flex items-center gap-2 text-xs font-extrabold text-slate-800 uppercase"
                          >
                            <input 
                              type="checkbox" 
                              checked={(formData.modules.find(m => m.id === selectedModuleId)?.lessons || []).find((l: any) => l.id === selectedLessonId)?.isFree || false}
                              readOnly 
                              className="accent-red-650" 
                            />
                            🔓 Aula gratuita de demonstração
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.modules.map(m => {
                                if (m.id === selectedModuleId) {
                                  return {
                                    ...m,
                                    lessons: m.lessons.map((les: any) => {
                                      if (les.id === selectedLessonId) {
                                        return { ...les, isRequired: !les.isRequired };
                                      }
                                      return les;
                                    })
                                  };
                                }
                                return m;
                              });
                              updateField('modules', updated);
                            }}
                            className="flex items-center gap-2 text-xs font-extrabold text-slate-800 uppercase"
                          >
                            <input 
                              type="checkbox" 
                              checked={(formData.modules.find(m => m.id === selectedModuleId)?.lessons || []).find((l: any) => l.id === selectedLessonId)?.isRequired ?? true}
                              readOnly 
                              className="accent-red-650" 
                            />
                            🔒 Aula de liberação obrigatória
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.modules.map(m => {
                                if (m.id === selectedModuleId) {
                                  return {
                                    ...m,
                                    lessons: m.lessons.map((les: any) => {
                                      if (les.id === selectedLessonId) {
                                        return { ...les, releaseImmediately: !les.releaseImmediately };
                                      }
                                      return les;
                                    })
                                  };
                                }
                                return m;
                              });
                              updateField('modules', updated);
                            }}
                            className="flex items-center gap-2 text-xs font-extrabold text-slate-800 uppercase"
                          >
                            <input 
                              type="checkbox" 
                              checked={(formData.modules.find(m => m.id === selectedModuleId)?.lessons || []).find((l: any) => l.id === selectedLessonId)?.releaseImmediately ?? true}
                              readOnly 
                              className="accent-red-650" 
                            />
                            ⚡ Liberar imediatamente na contratação
                          </button>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {/* STEP 6: MATERIALS LIBRARY */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 uppercase italic tracking-tight">6. Biblioteca de Materiais de Apoio</h3>
                <p className="text-xs text-slate-400 font-semibold uppercase">Cadastre apostilas, modelos de decisões, checklists e planilhas associados.</p>
              </div>

              {/* Form to create material */}
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-4">
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">📋 Cadastrar Novo Material</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input 
                    type="text" 
                    placeholder="NOME DO MATERIAL..." 
                    value={tempMat.name}
                    onChange={(e) => setTempMat({ ...tempMat, name: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold uppercase transition-all"
                  />
                  <select
                    value={tempMat.cat}
                    onChange={(e) => setTempMat({ ...tempMat, cat: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold uppercase outline-none"
                  >
                    <option value="Apostila">📘 Apostila Acadêmica</option>
                    <option value="Modelo Jurídico">⚖ Modelo Prático (Petitiva)</option>
                    <option value="Checklist">📈 Checklist de Atuação</option>
                    <option value="Fluxograma">📑 Fluxograma de Procedimento</option>
                    <option value="Planilha">📊 Planilha de Precificação</option>
                    <option value="PDF">📄 PDF Geral</option>
                    <option value="PPT">⚙ Slides PowerPoint</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="URL DE DOWNLOAD (DRIVE, STORAGE)..." 
                    value={tempMat.url}
                    onChange={(e) => setTempMat({ ...tempMat, url: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold"
                  />
                  <div className="md:col-span-3">
                    <input 
                      type="text" 
                      placeholder="DESCREVA BREVEMENTE O CONTEÚDO..." 
                      value={tempMat.desc}
                      onChange={(e) => setTempMat({ ...tempMat, desc: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold uppercase"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      if (!tempMat.name || !tempMat.url) {
                        toast.error("Nome e URL de Download são obrigatórios.");
                        return;
                      }
                      addMaterial(tempMat.name, tempMat.cat, tempMat.desc, tempMat.modId, tempMat.lesId, tempMat.url);
                      setTempMat({ name: '', cat: 'PDF', desc: '', modId: '', lesId: '', url: '' });
                    }}
                    className="bg-red-650 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider md:col-span-3 hover:bg-slate-800 transition-colors"
                  >
                    + ADICIONAR À BIBLIOTECA
                  </button>
                </div>
              </div>

              {/* List of library items */}
              <div className="space-y-3">
                {formData.materials.length === 0 ? (
                  <p className="text-center py-6 text-slate-400 font-bold uppercase italic text-[10px]">Nenhum material listado nesta biblioteca.</p>
                ) : (
                  formData.materials.map((mat) => (
                    <div key={mat.id} className="flex justify-between items-center bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                      <div>
                        <span className="text-[9px] font-black uppercase px-2.5 py-1 bg-red-100 text-red-700 rounded-full">{mat.category}</span>
                        <p className="font-extrabold text-slate-800 uppercase text-xs mt-2">{mat.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{mat.description || 'Sem descrição cadastrada'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const filter = formData.materials.filter(m => m.id !== mat.id);
                          updateField('materials', filter);
                          toast.success("Item de apoio descartado.");
                        }}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* STEP 7: TESTS & ACTIVITIES */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 uppercase italic tracking-tight">7. Fixação, Exercícios e Avaliações</h3>
                <p className="text-xs text-slate-400 font-semibold uppercase">Programe os testes rápidos para medir a progressão intelectual discente.</p>
              </div>

              {/* Activity form */}
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-4">
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-black uppercase tracking-wider">➕ Nova Fixação Acadêmica</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[8px] font-black uppercase text-slate-500 mb-1">Enunciado / Pergunta da Questão *</label>
                    <textarea 
                      rows={2}
                      placeholder="QUAL A TESE CORRETA CONFORME SUPERIOR TRIBUNAL...?" 
                      value={tempAct.question}
                      onChange={(e) => setTempAct({ ...tempAct, question: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold uppercase outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-black uppercase text-slate-500 mb-1">Modelo de Resposta ou Alternativa Ideal</label>
                    <input 
                      type="text" 
                      placeholder="E.G. ALTERNATIVA 'C' OU DIRETRIZ REVISIONAL" 
                      value={tempAct.model}
                      onChange={(e) => setTempAct({ ...tempAct, model: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-extrabold uppercase outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-black uppercase text-slate-500 mb-1">Tipo de Exercício</label>
                    <select
                      value={tempAct.type}
                      onChange={(e) => setTempAct({ ...tempAct, type: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-bold uppercase outline-none"
                    >
                      <option value="multichoice">Múltipla Escolha</option>
                      <option value="essay">Dissertativa Acadêmica</option>
                      <option value="case">Estudo de Caso Jurisprudencial</option>
                      <option value="practice">Exercício Prático de Escritório</option>
                      <option value="checklist">Checklist De Conformidade</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!tempAct.question) {
                        toast.error("O enunciado da questão é obrigatório.");
                        return;
                      }
                      addActivity(tempAct.question, tempAct.type, tempAct.model, tempAct.minG, tempAct.isReq);
                      setTempAct({ question: '', type: 'multichoice', model: '', minG: 70, isReq: true });
                    }}
                    className="bg-slate-900 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider md:col-span-2 hover:bg-slate-800 transition-all duration-300"
                  >
                    + CONFIRMAR E ADICIONAR ATIVIDADE
                  </button>
                </div>
              </div>

              {/* List of activities */}
              <div className="space-y-3">
                {formData.activities.length === 0 ? (
                  <p className="text-center py-6 text-slate-400 font-bold uppercase italic text-[10px]">Nenhum teste de fixação cadastrado ainda para este curso.</p>
                ) : (
                  formData.activities.map((act) => (
                    <div key={act.id} className="flex justify-between items-center bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                      <div>
                        <span className="text-[9px] font-black uppercase px-2.5 py-1 bg-red-100 text-red-700 rounded-full">{act.type}</span>
                        <p className="font-extrabold text-slate-800 uppercase text-xs mt-2">P: {act.question}</p>
                        {act.modelAnswer && <p className="text-[10px] text-slate-500 font-semibold">Gabarito: {act.modelAnswer}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const filter = formData.activities.filter(a => a.id !== act.id);
                          updateField('activities', filter);
                          toast.success("Fixação descartada.");
                        }}
                        className="p-2 text-slate-400 hover:text-red-550 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* STEP 8: ACTION PLAN */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div className="bg-red-500 text-white p-6 rounded-2xl space-y-2">
                <span className="text-[9px] font-black uppercase tracking-widest bg-white/25 px-2.5 py-1 rounded-full">Exclusividade Giffoni School</span>
                <h3 className="text-xl font-extrabold uppercase italic tracking-tight">8. Plano de Ação Estratégico Executivo</h3>
                <p className="text-xs font-semibold uppercase opacity-95">Defina a progressão e objetivos operacionais reais do aluno em escritórios corporativos.</p>
              </div>

              {/* Form to append action plan */}
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-4">
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">⚡ Cadastrar Nova Etapa Proposta</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[8px] font-black uppercase text-slate-500 mb-1">Nome da Meta / Etapa *</label>
                    <input 
                      type="text" 
                      placeholder="E.G. ETAPA 1: AUDITORIA INTERNA DO CLIENTE" 
                      value={tempPlan.title}
                      onChange={(e) => setTempPlan({ ...tempPlan, title: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold uppercase transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-black uppercase text-slate-500 mb-1">Prazo Recomendado de Execução</label>
                    <input 
                      type="text" 
                      placeholder="E.G. 10 DIAS APÓS FIM DO MÓDULO" 
                      value={tempPlan.deadline}
                      onChange={(e) => setTempPlan({ ...tempPlan, deadline: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold uppercase transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-black uppercase text-slate-500 mb-1">Objetivo Estratégico</label>
                    <input 
                      type="text" 
                      placeholder="INDICAR O ALVO CORPORATIVO DA META..." 
                      value={tempPlan.obj}
                      onChange={(e) => setTempPlan({ ...tempPlan, obj: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold uppercase transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-black uppercase text-slate-500 mb-1">Resultado Empírico Esperado</label>
                    <input 
                      type="text" 
                      placeholder="RELATÓRIO ASSINADO OU AUDICIONAL..." 
                      value={tempPlan.result}
                      onChange={(e) => setTempPlan({ ...tempPlan, result: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold uppercase transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[8px] font-black uppercase text-slate-500 mb-1">Instruções de Detalhamento da Meta</label>
                    <textarea 
                      rows={2}
                      placeholder="COMO FAZER, PROCEDIMENTOS INICIAIS, LINKS RECOMENDADOS..." 
                      value={tempPlan.desc}
                      onChange={(e) => setTempPlan({ ...tempPlan, desc: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold uppercase"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!tempPlan.title) {
                        toast.error("O título do plano é obrigatório.");
                        return;
                      }
                      addActionPlanStep(tempPlan.title, tempPlan.obj, tempPlan.desc, tempPlan.deadline, tempPlan.result);
                      setTempPlan({ title: '', obj: '', desc: '', deadline: '15 dias', result: '' });
                    }}
                    className="bg-red-600 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider md:col-span-2 hover:bg-slate-900 transition-colors"
                  >
                    + ADICIONAR ETAPA PRÁTICA
                  </button>
                </div>
              </div>

              {/* Steps list */}
              <div className="space-y-4">
                {formData.actionPlanSteps.length === 0 ? (
                  <p className="text-center py-6 text-slate-400 font-bold uppercase italic text-[10px]">Nenhuma meta estratégica cadastrada no Plano de Ação.</p>
                ) : (
                  formData.actionPlanSteps.map((step, sIdx) => (
                    <div key={step.id} className="bg-slate-50/50  border-2 border-slate-100 rounded-2xl p-5 shadow-sm space-y-3">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-red-600">Meta Executiva {sIdx + 1} de {formData.actionPlanSteps.length}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const filter = formData.actionPlanSteps.filter(s => s.id !== step.id);
                            updateField('actionPlanSteps', filter);
                            toast.success("Meta descartada.");
                          }}
                          className="p-1 px-2.5 hover:bg-red-50 text-red-600 rounded transition-colors"
                        >
                          Deletar Meta
                        </button>
                      </div>
                      <div>
                        <h4 className="font-extrabold uppercase text-xs text-slate-850">{step.title}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold">{step.description}</p>
                        <div className="mt-2 grid grid-cols-2 gap-4 text-[10px] font-bold text-slate-500 uppercase">
                          <p>🎯 Alvo: {step.objective || 'Nenhum'}</p>
                          <p>📅 Prazo: {step.targetDeadline || 'Livre'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* STEP 9: CERTIFICATION */}
          {currentStep === 9 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 uppercase italic tracking-tight">9. Parâmetros de Emissão de Certificado</h3>
                <p className="text-xs text-slate-400 font-semibold uppercase">Instale os requisitos pedagógicos para liberação automatizada de certificados chancelados.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Carga Horária Chancelada (Horas) *</label>
                  <input 
                    type="number"
                    value={formData.totalHours}
                    onChange={(e) => updateField('totalHours', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Modelo Oficial de Prancha Grafica</label>
                  <select
                    value={formData.certTemplate}
                    onChange={(e) => updateField('certTemplate', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold uppercase outline-none"
                  >
                    <option value="modelo_standard_giffoni">Prancha Standard Giffoni</option>
                    <option value="modelo_faturamento_executivo">Prancha Executiva Especial</option>
                    <option value="modelo_pos_direito">Pós Graduação Advogacional</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Regra de Aprovação Textual</label>
                  <input 
                    type="text"
                    value={formData.approvalCriteria}
                    onChange={(e) => updateField('approvalCriteria', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold uppercase outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Nota de Corte Mínima (%)</label>
                  <input 
                    type="number"
                    max={100}
                    min={0}
                    value={formData.certMinGrade}
                    onChange={(e) => updateField('certMinGrade', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input 
                    type="checkbox" 
                    id="autoEmitCheck"
                    checked={formData.certAutoEmit} 
                    onChange={(e) => updateField('certAutoEmit', e.target.checked)}
                    className="accent-red-650" 
                  />
                  <label htmlFor="autoEmitCheck" className="text-xs font-black uppercase text-slate-800 tracking-tight cursor-pointer">
                    Liberar emissão automatizada no fim
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 10: FINANCE */}
          {currentStep === 10 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 uppercase italic tracking-tight">10. Financeiro e Parâmetros Comerciais</h3>
                <p className="text-xs text-slate-400 font-semibold uppercase">Estipule o formato de contratação comercial e interfaces da API do Stripe.</p>
              </div>

              <div className="space-y-6">
                
                {/* Free vs Paid Toggle */}
                <div className="flex items-center gap-4 bg-slate-100 p-2.5 rounded-2xl w-fit">
                  <button
                    type="button"
                    onClick={() => updateField('isFree', true)}
                    className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-colors ${formData.isFree ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                  >
                    Curso Gratuito
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('isFree', false)}
                    className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-colors ${!formData.isFree ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                  >
                    Curso Pago (Faturamento)
                  </button>
                </div>

                {!formData.isFree && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-100/50 p-6 rounded-2xl border">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Preço de Tabela (Venda) *</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">R$</span>
                        <input 
                          type="number"
                          value={formData.price}
                          onChange={(e) => updateField('price', Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Preço Promocional (Stripe Checkout)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">R$</span>
                        <input 
                          type="number"
                          value={formData.promoPrice}
                          onChange={(e) => updateField('promoPrice', Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Parcelamento Máximo Especial</label>
                      <select
                        value={formData.maxInstallments}
                        onChange={(e) => updateField('maxInstallments', Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold outline-none"
                      >
                        <option value={1}>À vista</option>
                        <option value={3}>Até 3x sem juros</option>
                        <option value={6}>Até 6x com juros</option>
                        <option value={12}>Até 12x via cartão de crédito</option>
                      </select>
                    </div>

                    {/* Checkboxes for Payment methods */}
                    <div className="md:col-span-3 border-t pt-4 mt-2 space-y-3">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Métodos de Cobrança Autorizados</p>
                      <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-800">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={formData.payPix} onChange={(e) => updateField('payPix', e.target.checked)} className="accent-red-650" />
                          PIX Direto
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={formData.payBoleto} onChange={(e) => updateField('payBoleto', e.target.checked)} className="accent-red-650" />
                          Boleto Bancário (Gateway)
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={formData.payCard} onChange={(e) => updateField('payCard', e.target.checked)} className="accent-red-650" />
                          Cartão de Crédito Integrado Stripe
                        </label>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </div>
          )}

          {/* STEP 11: PROFESSORS TEAM & COMMISSIONS */}
          {currentStep === 11 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 uppercase italic tracking-tight">11. Repartição Pedagógica de Comissões</h3>
                <p className="text-xs text-slate-400 font-semibold uppercase">Ajuste os percentuais das comissões do faturamento. A soma dos repasses deve obrigatoriamente fechar em 100%.</p>
              </div>

              <div className="bg-slate-100/40 border border-slate-100 p-6 md:p-8 rounded-2xl space-y-6">
                
                <div className="space-y-4">
                  <div className="flex items-end justify-between font-black uppercase text-xs">
                    <span className="text-slate-500">Repasse do Professor Responsável</span>
                    <span className="text-red-600 bg-red-50 px-3 py-1 rounded">{formData.professorShare}%</span>
                  </div>
                  <input 
                    type="range" 
                    max={100} 
                    min={0} 
                    value={formData.professorShare}
                    onChange={(e) => updateField('professorShare', Number(e.target.value))}
                    className="w-full accent-red-600"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-end justify-between font-black uppercase text-xs">
                    <span className="text-slate-500">Repasse de Coautor / Parceiro Global</span>
                    <span className="text-red-600 bg-red-50 px-3 py-1 rounded">{formData.partnerShare}%</span>
                  </div>
                  <input 
                    type="range" 
                    max={100} 
                    min={0} 
                    value={formData.partnerShare}
                    onChange={(e) => updateField('partnerShare', Number(e.target.value))}
                    className="w-full accent-red-600"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-end justify-between font-black uppercase text-xs">
                    <span className="text-slate-500">Repasse Retido da Giffoni School</span>
                    <span className="text-red-600 bg-red-50 px-3 py-1 rounded">{formData.schoolShare}%</span>
                  </div>
                  <input 
                    type="range" 
                    max={100} 
                    min={0} 
                    value={formData.schoolShare}
                    onChange={(e) => updateField('schoolShare', Number(e.target.value))}
                    className="w-full accent-red-600"
                  />
                </div>

                {/* Validation alert */}
                <div className="border-t pt-4 flex items-center justify-between font-black uppercase text-xs">
                  <span className="text-slate-500">SOMA DOS PERCENTUAIS DE REPASSE:</span>
                  <span className={`px-4 py-1.5 rounded-full ${
                    (formData.professorShare + formData.partnerShare + formData.schoolShare) === 100
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-red-100 text-red-800 animate-bounce'
                  }`}>
                    {formData.professorShare + formData.partnerShare + formData.schoolShare}% / 100%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 12: LIFECYCLE DISPONIBILITY */}
          {currentStep === 12 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 uppercase italic tracking-tight">12. Disponibilidade e Ciclo de Vida do Curso</h3>
                <p className="text-xs text-slate-400 font-semibold uppercase">Controle em qual estágio corporativo ou comercial o curso se encontra.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-800">
                <div onClick={() => {
                  setFormData(prev => ({ ...prev, lifecycleStatus: 'construction', status: 'draft' }));
                }} className={`p-5 rounded-2xl border cursor-pointer transition-all ${formData.lifecycleStatus === 'construction' ? 'bg-red-50/30 border-red-500' : 'bg-white border-slate-150 hover:border-slate-350'}`}>
                  <p className="font-black text-slate-900 uppercase">🚧 EM CONSTRUÇÃO (RASCUNHO)</p>
                  <p className="text-[10px] text-slate-400 leading-none mt-1 font-semibold">Os professores continuam alimentando novos materiais na grade curricular.</p>
                </div>

                <div onClick={() => {
                  setFormData(prev => ({ ...prev, lifecycleStatus: 'revision', status: 'draft' }));
                }} className={`p-5 rounded-2xl border cursor-pointer transition-all ${formData.lifecycleStatus === 'revision' ? 'bg-red-50/30 border-red-500' : 'bg-white border-slate-150 hover:border-slate-350'}`}>
                  <p className="font-black text-slate-900 uppercase">🔍 EM REVISÃO INTERNA</p>
                  <p className="text-[10px] text-slate-400 leading-none mt-1 font-semibold">Conselho de BOSS vistoria os planos de ações e a integridade de vídeos carregados.</p>
                </div>

                <div onClick={() => {
                  setFormData(prev => ({ ...prev, lifecycleStatus: 'published', status: 'published' }));
                }} className={`p-5 rounded-2xl border cursor-pointer transition-all ${formData.lifecycleStatus === 'published' ? 'bg-red-50/30 border-red-500' : 'bg-white border-slate-150 hover:border-slate-350'}`}>
                  <p className="font-black text-slate-900 uppercase">🚀 PUBLICADO COMERCIALMENTE</p>
                  <p className="text-[10px] text-slate-400 leading-none mt-1 font-semibold">Permite a divulgação, compra e matrículas dos discentes reais em todo o país.</p>
                </div>

                <div onClick={() => {
                  setFormData(prev => ({ ...prev, lifecycleStatus: 'archived', status: 'archived' }));
                }} className={`p-5 rounded-2xl border cursor-pointer transition-all ${formData.lifecycleStatus === 'archived' ? 'bg-red-50/30 border-red-500' : 'bg-white border-slate-150 hover:border-slate-350'}`}>
                  <p className="font-black text-slate-900 uppercase">📦 CATEGORIZADO COMO ARQUIVADO</p>
                  <p className="text-[10px] text-slate-400 leading-none mt-1 font-semibold">Oculta do faturamento e impede novas turmas de compra, guardando histórico.</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 13: PUBLIC HOME EXPOSURE */}
          {currentStep === 13 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 uppercase italic tracking-tight">13. Exibição e Marketing na Home Pública</h3>
                <p className="text-xs text-slate-400 font-semibold uppercase">Determine as regras de visibilidade publicitária do produto final no portal de marketing.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div onClick={() => updateField('showOnHome', !formData.showOnHome)} className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${formData.showOnHome ? 'bg-red-50/10 border-red-500' : 'bg-white border-slate-150 hover:border-slate-300'}`}>
                  <input type="checkbox" checked={formData.showOnHome} readOnly className="mt-1 accent-red-650" />
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase">Exibir na Home Administrativa/Marketing</p>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-tight mt-1">Coloca este curso visível no catálogo de produtos do portal.</p>
                  </div>
                </div>

                <div onClick={() => updateField('featuredCourse', !formData.featuredCourse)} className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${formData.featuredCourse ? 'bg-red-50/10 border-red-500' : 'bg-white border-slate-150 hover:border-slate-300'}`}>
                  <input type="checkbox" checked={formData.featuredCourse} readOnly className="mt-1 accent-red-650" />
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase">Destaque Principal do Portal</p>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-tight mt-1">Exibe no banner de destaque rotativo primário do site de atração.</p>
                  </div>
                </div>

                <div onClick={() => updateField('showInShowcase', !formData.showInShowcase)} className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${formData.showInShowcase ? 'bg-red-50/10 border-red-500' : 'bg-white border-slate-150 hover:border-slate-300'}`}>
                  <input type="checkbox" checked={formData.showInShowcase} readOnly className="mt-1 accent-red-650" />
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase">Exibir na Vitrine de Pesquisa</p>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-tight mt-1">Faz o curso aparecer para buscas diretas das categorias selecionadas.</p>
                  </div>
                </div>

                <div onClick={() => updateField('showInPromotions', !formData.showInPromotions)} className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${formData.showInPromotions ? 'bg-red-50/10 border-red-500' : 'bg-white border-slate-150 hover:border-slate-300'}`}>
                  <input type="checkbox" checked={formData.showInPromotions} readOnly className="mt-1 accent-red-650" />
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase">Inundar em Campanhas Promocionais</p>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-tight mt-1">Sinaliza para envio automático em newsletters com juros e descontos configurados.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 14: CHRONOS REVISION FINAL */}
          {currentStep === 14 && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 uppercase italic tracking-tight">14. Revisão Geral do Produto Educacional</h3>
                <p className="text-xs text-slate-400 font-semibold uppercase">Vistorie se todas as obrigações cadastrais e pedagógicas estão validadas para publicação.</p>
              </div>

              {/* Checklist visual boxes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="p-4 bg-slate-50 rounded-2xl border flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-700">✓ DADOS DE IDENTIFICAÇÃO</span>
                  <CheckCircle2 size={18} className={getValidationSummary().basicInfo ? 'text-emerald-500' : 'text-slate-300'} />
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-700">✓ DESCRIÇÃO E PROPÓSITO</span>
                  <CheckCircle2 size={18} className={getValidationSummary().description ? 'text-emerald-500' : 'text-slate-300'} />
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-700">✓ CONFIGURAÇÃO PEDAGÓGICA</span>
                  <CheckCircle2 size={18} className={getValidationSummary().pedagogical ? 'text-emerald-500' : 'text-slate-300'} />
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-700">✓ ESTRUTURA CURRICULAR</span>
                  <CheckCircle2 size={18} className={getValidationSummary().curriculum ? 'text-emerald-500' : 'text-slate-300'} />
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-700">✓ CONTEÚDOS DAS AULAS</span>
                  <CheckCircle2 size={18} className={getValidationSummary().contents ? 'text-emerald-500' : 'text-slate-300'} />
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-700">✓ CERTIFICAÇÃO DEFINIDA</span>
                  <CheckCircle2 size={18} className={getValidationSummary().certification ? 'text-emerald-500' : 'text-slate-300'} />
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-700">✓ PREÇOS E MÉTODOS FINANCEIROS</span>
                  <CheckCircle2 size={18} className={getValidationSummary().finance ? 'text-emerald-500' : 'text-slate-300'} />
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-700">✓ DIVISÃO DE COMISSÃO (100%)</span>
                  <CheckCircle2 size={18} className={getValidationSummary().commission ? 'text-emerald-500' : 'text-slate-300'} />
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-700">✓ STATUS E DISPONIBILIDADE</span>
                  <CheckCircle2 size={18} className={getValidationSummary().availability ? 'text-emerald-500' : 'text-slate-300'} />
                </div>

              </div>

              {/* Action buttons list */}
              <div className="border-t pt-8 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">AÇÕES EXECUTIVAS DO CONSTRUTOR DE CURSOS</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  
                  <button 
                    type="button" 
                    onClick={() => saveProgress(14)}
                    className="p-4 bg-slate-100 font-black uppercase text-[10px] tracking-wider rounded-xl text-slate-700 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                  >
                    💾 SALVAR COMO RASCUNHO
                  </button>

                  <button 
                    type="button" 
                    onClick={() => setPreviewOpen(true)}
                    className="p-4 bg-slate-800 text-white font-black uppercase text-[10px] tracking-wider rounded-xl hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
                  >
                    👁 PRÉ-VISUALIZAR CURSO GERAL
                  </button>

                  <button 
                    type="button" 
                    onClick={publishCourse}
                    className="p-4 bg-red-600 text-white font-black uppercase text-[10px] tracking-wider rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 col-span-2 md:col-span-1"
                  >
                    🚀 PUBLICAR CURSO IMEDIATAMENTE
                  </button>

                  <button 
                    type="button" 
                    onClick={duplicateCourse}
                    className="p-4 bg-slate-100 hover:bg-slate-250 text-slate-700 font-black uppercase text-[10px] tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    📄 DUPLICAR CURSO
                  </button>

                  <button 
                    type="button" 
                    onClick={async () => {
                      await updateDoc(doc(db, 'courses', courseId!), { status: 'archived', lifecycleStatus: 'archived' });
                      toast.success("Curso categorizado como arquivado.");
                      onClose();
                    }}
                    className="p-4 bg-slate-100 hover:bg-slate-250 text-slate-700 font-black uppercase text-[10px] tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    📦 ARQUIVAR CURSO
                  </button>

                  {courseId && (
                    <button 
                      type="button" 
                      onClick={deleteCoursePermanently}
                      className="p-4 bg-red-50 text-red-600 font-black uppercase text-[10px] tracking-wider rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                      🗑 EXCLUIR RASCUNHO DEFINITIVAMENTE
                    </button>
                  )}

                </div>
              </div>

            </div>
          )}

        </div>

        {/* Wizard Footer Controls */}
        <div className="border-t pt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-3.5 bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <ArrowLeft size={14} /> Voltar Etapa
          </button>

          <span className="text-[10px] text-slate-400 font-extrabold uppercase">
            Auto-salvamento ativo • Giffoni School Portal BOSS
          </span>

          {currentStep < 14 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
            >
              Avançar Etapa <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3.5 bg-black hover:bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
            >
              Concluir e Voltar <Check size={14} />
            </button>
          )}
        </div>

      </div>

      {/* Course Mock-up card Preview Modal popup overlay */}
      <AnimatePresence>
        {previewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl relative border"
            >
              {/* Cover */}
              <div className="h-44 bg-slate-900 relative flex items-end p-6 text-white overflow-hidden">
                {formData.thumbnailUrl ? (
                  <img src={formData.thumbnailUrl} alt="Thumbnail" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-red-950" />
                )}
                <div className="relative z-10 space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-red-650 bg-red-600 px-2 py-0.5 rounded-full">{formData.category}</span>
                  <h4 className="text-xl font-bold uppercase tracking-tight italic text-white line-clamp-1">{formData.title || 'Título provisório da formação'}</h4>
                  <p className="text-[10px] font-semibold text-slate-300 line-clamp-1">{formData.subtitle || 'Subtítulo comercial de admissão'}</p>
                </div>
              </div>

              {/* Details body */}
              <div className="p-6 space-y-4 text-xs select-none">
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Apresentador Responsável</span>
                  <p className="font-extrabold text-slate-800 uppercase mt-0.5">👤 {formData.teacherName || 'Não atribuído'}</p>
                </div>
                
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Descrição comercial rápida</span>
                  <p className="text-slate-500 font-semibold uppercase tracking-tight mt-1 line-clamp-3">{formData.shortDescription || 'Ainda sem apresentação comercial curta preenchida...'}</p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-black uppercase">
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Investimento comercial</span>
                    <p className="text-slate-900 tracking-tight mt-0.5">
                      {formData.isFree ? 'CURSO GRATUITO' : `R$ ${formData.promoPrice || formData.price} em até ${formData.maxInstallments}x`}
                    </p>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Duração total</span>
                    <p className="text-red-600 tracking-tight mt-0.5">🕒 {formData.totalHours} horas</p>
                  </div>
                </div>
              </div>

              {/* footer */}
              <div className="p-4 bg-slate-50 border-t flex justify-end">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="px-5 py-2.5 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest"
                >
                  FECHAR PRÉ-VISUALIZAÇÃO
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
