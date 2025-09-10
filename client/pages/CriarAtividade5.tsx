import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sparkles,
  FileText,
  Globe,
  Hash,
  CheckSquare,
  Edit3,
  HelpCircle,
  BookOpen,
  Brain,
  Zap,
  Settings,
  ChevronDown,
  ChevronUp,
  Save,
  Clock,
  ArrowLeft,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Layout from "@/components/Layout";
import QuestionsPreview from "@/components/QuestionsPreview";
import { Question } from "@/components/QuestionCard";
import { useDraftSave, DraftData } from "@/hooks/useDraftSave";
import { useActivitiesSave } from "@/hooks/useActivitiesSave";
import { WordEditor } from "@/components/editor/WordEditor";
import { useToast } from "@/hooks/use-toast";
import DebugSupabase from "@/components/DebugSupabase";
// Importar hooks do Supabase
import { useAtividade, useMateriais, useTurmas, useAtividades } from "@/hooks/useSupabase";
import { supabase } from "@/lib/supabase";
import type { Atividade, Material, Turma } from "@/lib/supabase";
import LoadingSpinner from "@/components/ui/loading-spinner";
import LoadingOverlay from "@/components/ui/loading-overlay";

interface FormData {
  title: string;
  language: string;
  difficulty: string;
  turma: string;
  topics: string;
  selectedMaterial: string;
  questionsCount: number;
  generateMultipleVersions: boolean;
  versionsCount: number;
  generateGabarito: boolean;
  questionTypes: {
    multipleChoice: boolean;
    fillBlanks: boolean;
    trueFalse: boolean;
    openQuestions: boolean;
  };
}

const languages = [
  { value: "portuguese", label: "Português", flag: "🇧🇷" },
  { value: "english", label: "English", flag: "🇺🇸" },
  { value: "spanish", label: "Español", flag: "🇪🇸" },
  { value: "french", label: "Français", flag: "🇫🇷" },
  { value: "german", label: "Deutsch", flag: "🇩🇪" },
  { value: "italian", label: "Italiano", flag: "🇮🇹" },
];

const difficultyLevels = [
  { value: "a1", label: "A1", description: "Básico" },
  { value: "a2", label: "A2", description: "Pré-intermediário" },
  { value: "b1", label: "B1", description: "Intermediário" },
  { value: "b2", label: "B2", description: "Intermediário superior" },
  { value: "c1", label: "C1", description: "Avançado" },
  { value: "c2", label: "C2", description: "Proficiente" },
];


const questionTypes = [
  {
    key: "multipleChoice",
    icon: CheckSquare,
    label: "Múltipla Escolha",
    description: "Questões com alternativas A, B, C, D",
  },
  {
    key: "fillBlanks",
    icon: Edit3,
    label: "Preencher Lacunas",
    description: "Complete as frases com palavras corretas",
  },
  {
    key: "trueFalse",
    icon: HelpCircle,
    label: "Verdadeiro/Falso",
    description: "Afirmações para marcar V ou F",
  },
  {
    key: "openQuestions",
    icon: BookOpen,
    label: "Questões Abertas",
    description: "Questões dissertativas ou de resposta livre",
  },
];


// Função para converter questões para HTML
function questionsToHtml(formData: FormData, questions: Question[], gabarito?: any[], turmas?: Turma[], versao?: number): string {

  console.log("Número de questões recebidas:", questions?.length || 0);
  
  // Verificar se as questões são válidas
  if (!questions || questions.length === 0) {
    console.warn("AVISO: Nenhuma questão fornecida para questionsToHtml");
    return "<p>Nenhuma questão disponível</p>";
  }
  
  // Log detalhado das questões
  questions.forEach((q, index) => {
    console.log(`Questão ${index + 1}:`, {
      type: q.type,
      question: q.question?.substring(0, 50) + "...",
      hasOptions: !!q.options,
      optionsCount: q.options?.length || 0
    });
  });
  
  const formatDate = () => {
    const now = new Date();
    return `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}`;
  };

  const selectedLanguage =
    languages.find((l) => l.value === formData.language)?.label ||
    formData.language;
  const selectedDifficulty =
    difficultyLevels.find((d) => d.value === formData.difficulty)
      ?.description || formData.difficulty;
  // Buscar o nome da turma ao invés do ID
  console.log("Debug turmas:", { formData_turma: formData.turma, turmas_length: turmas?.length, turmas });
  
  let selectedTurma = "_______";
  if (formData.turma && formData.turma !== "none" && turmas && turmas.length > 0) {
    const foundTurma = turmas.find(t => t.id === formData.turma);
    selectedTurma = foundTurma ? foundTurma.name : formData.turma;
  }
  
  console.log("Selected turma:", selectedTurma);
  
  // Definir a versão da atividade
  const atividadeVersao = versao || 1;
  console.log("Atividade versao:", atividadeVersao);

  let questionsHtml = "";
  questions.forEach((question, index) => {
    const questionNumber = index + 1;

    switch (question.type) {
      case "multipleChoice":
        questionsHtml += `
          <div style="margin-bottom: 25px;">
            <p style="margin-bottom: 10px;"><strong>${questionNumber}.</strong> ${question.question}</p>
            <div style="margin-left: 20px;">
              ${
                question.options
                  ?.map(
                    (option, i) =>
                      `<p>${String.fromCharCode(97 + i)}) ${option}</p>`,
                  )
                  .join("") || ""
              }
            </div>
          </div>
        `;
        break;

      case "trueFalse":
        questionsHtml += `
          <div style="margin-bottom: 25px;">
            <p style="margin-bottom: 10px;"><strong>${questionNumber}.</strong> ${question.question}</p>
            <div style="margin-left: 20px;">
              <p>( ) Verdadeiro</p>
              <p>( ) Falso</p>
            </div>
          </div>
        `;
        break;

      case "fillBlanks":
        const questionWithBlanks = question.question.replace(
          /\[blank\]/g,
          "_____",
        );
        questionsHtml += `
          <div style="margin-bottom: 25px;">
            <p style="margin-bottom: 10px;"><strong>${questionNumber}.</strong> ${questionWithBlanks}</p>
          </div>
        `;
        break;

      case "openQuestions":
        questionsHtml += `
          <div style="margin-bottom: 25px;">
            <p style="margin-bottom: 15px;"><strong>${questionNumber}.</strong> ${question.question}</p>
            <div style="margin-left: 20px; border: 1px solid #ccc; height: 100px; padding: 10px;">
              <p style="color: #666; font-style: italic;">Espaço para resposta:</p>
            </div>
          </div>
        `;
        break;
    }
  });

  const finalHtml = `
    <div style="max-width: 210mm; margin: 0 auto; padding: 20mm; background: white; min-height: 297mm; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">${formData.title.toUpperCase()}</h1>
        <p style="margin-bottom: 5px;"><strong>Disciplina:</strong> ${selectedLanguage} | <strong>Nível:</strong> ${selectedDifficulty} | <strong>Data:</strong> ${formatDate()}</p>
        <p style="margin-bottom: 5px;"><strong>Nome:</strong> ________________________________________________</p>
        <p><strong>Turma:</strong> ${selectedTurma} | <strong>Versão:</strong> ${atividadeVersao}</p>
      </div>

      <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; background-color: #f9f9f9;">
        <h3 style="margin-bottom: 10px; font-weight: bold;">INSTRUÇÕES:</h3>
        <ul style="margin-left: 20px;">
          <li>Leia atentamente todas as questões antes de respondê-las.</li>
          <li>Use caneta azul ou preta para as respostas.</li>
          <li>Mantenha sua atividade organizada e com letra legível.</li>
          <li>Tempo sugerido: 2 horas.</li>
          <li>Atividade contém ${questions.length} questões.</li>
        </ul>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">QUESTÕES</h2>
        ${questionsHtml}
      </div>


      ${gabarito && gabarito.length > 0 ? `
        <div style="margin-top: 30px; padding: 20px; border: 2px solid #28a745; background-color: #f8f9fa; border-radius: 8px;">
          <h3 style="color: #28a745; margin-bottom: 15px; font-weight: bold; text-align: center;">GABARITO</h3>
          <p style="text-align: center; font-size: 16px; color: #333;">
            ${gabarito.map((item, index) => {
              const resposta = typeof item === 'string' ? item : (item.answer || item.correctAnswer || 'N/A');
              return `${index + 1}. ${resposta}`;
            }).join(',  ')}
          </p>
        </div>
      ` : ''}
    </div>
  `;
  

  
  return finalHtml;
}

export default function CriarAtividade5() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isEditMode = searchParams.get("edit") === "true";
  const [formData, setFormData] = useState<FormData>({
    title: "",
    language: "",
    difficulty: "",
    turma: "",
    topics: "",
    selectedMaterial: "none",
    questionsCount: 10,
    generateMultipleVersions: false,
    versionsCount: 2,
    generateGabarito: false,
    questionTypes: {
      multipleChoice: true,
      fillBlanks: false,
      trueFalse: false,
      openQuestions: false,
    },
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [lastSaved, setLastSaved] = useState<string>("");
  const [lastSavedPreview, setLastSavedPreview] = useState<string>("");
  const [showEditor, setShowEditor] = useState(false);
  const [editorContent, setEditorContent] = useState<string>("");
  const [lastSavedEditor, setLastSavedEditor] = useState<string>("");
  
  // Estado para controlar campos com erro de validação
  const [fieldErrors, setFieldErrors] = useState<{
    title?: boolean;
    language?: boolean;
    difficulty?: boolean;
    questionTypes?: boolean;
  }>({});
  
  // Estados para múltiplas versões
  const [allVersions, setAllVersions] = useState<any[]>([]);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);
  const [hasMultipleVersions, setHasMultipleVersions] = useState(false);
  const [currentVersionGabarito, setCurrentVersionGabarito] = useState<any[]>([]);

  // Estados para o modal de rascunho
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftData, setDraftData] = useState<DraftData | null>(null);
  const [isNewExam, setIsNewExam] = useState(true);
  const [activityLoaded, setActivityLoaded] = useState(false);

  // Hooks
  const { saveDraft, loadDraft, clearDraft, hasDraft } = useDraftSave();
  const { saveActivity } = useActivitiesSave();
  const { toast } = useToast();

  // Hooks do Supabase
  const { saveAtividade, loading: atividadeLoading, error: atividadeError } = useAtividade();
  const { materiais, loading: materiaisLoading, fetchMateriais } = useMateriais();
  const { getAtividadeById, updateAtividade } = useAtividades();
  const { turmas, loading: turmasLoading, fetchTurmas } = useTurmas();

  // Carregar dados do Supabase apenas uma vez na montagem do componente
  useEffect(() => {
    fetchMateriais();
    fetchTurmas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Função para trocar entre versões
  const handleVersionChange = (versionIndex: number) => {
    if (allVersions.length > versionIndex && versionIndex >= 0) {
      setSelectedVersionIndex(versionIndex);
      const selectedVersion = allVersions[versionIndex];
      
      // Atualizar questões exibidas
      setGeneratedQuestions(selectedVersion.questions);
      
      // Atualizar gabarito da versão atual
      setCurrentVersionGabarito(selectedVersion.gabarito || []);
      
      // Atualizar conteúdo do editor se estiver visível
      if (showEditor) {
        const gabarito = formData.generateGabarito ? selectedVersion.gabarito : undefined;
        console.log("Gerando HTML - handleVersionChange:", { formData_turma: formData.turma, turmas_count: turmas?.length, versao: versionIndex + 1 });
        const newHtml = questionsToHtml(formData, selectedVersion.questions, gabarito, turmas, versionIndex + 1);
        setEditorContent(newHtml);
      }
      
      console.log(`Versão ${selectedVersion.versionId} selecionada:`, selectedVersion);
      
    }
  };

  // Auto save quando um campo perde o foco
  const handleFieldBlur = () => {
    // Verifica se pelo menos um campo importante foi preenchido
    const hasContent = 
      formData.title ||
      formData.language ||
      formData.difficulty ||
      formData.turma ||
      formData.topics ||
      formData.selectedMaterial ||
      formData.questionsCount !== 10 || // Valor padrão é 10
      formData.generateMultipleVersions ||
      formData.versionsCount !== 2 || // Valor padrão é 2
      formData.generateGabarito ||
      !formData.questionTypes.multipleChoice || // Padrão é true
      formData.questionTypes.fillBlanks ||
      formData.questionTypes.trueFalse ||
      formData.questionTypes.openQuestions;

    if (hasContent) {
      saveDraft(1, formData);
      setLastSaved(new Date().toLocaleString("pt-BR"));
  
    }
  };

  // Auto save para preview das questões (apenas quando questões mudam)
  useEffect(() => {
    if (generatedQuestions.length > 0) {
      const savePreviewData = () => {
        const previewData = {
          formData,
          generatedQuestions,
          allVersions,
          hasMultipleVersions,
          selectedVersionIndex,
          currentVersionGabarito,
          timestamp: Date.now(),
          lastSaved: new Date().toLocaleString("pt-BR"),
        };

        try {
          localStorage.setItem(
            "criar-prova-5-preview",
            JSON.stringify(previewData),
          );
          setLastSavedPreview(previewData.lastSaved);
        } catch (error) {
          console.error("Erro ao salvar preview:", error);
        }
      };

      const timeoutId = setTimeout(savePreviewData, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [generatedQuestions, allVersions, hasMultipleVersions, selectedVersionIndex, currentVersionGabarito]); // Adicionadas dependências de múltiplas versões

  // Carregar conteúdo do editor automaticamente ao montar o componente
  useEffect(() => {
    console.log("=== useEffect loadEditorContent executado ===");
    console.log("isEditMode:", isEditMode, "hasDraft():", hasDraft(), "activityLoaded:", activityLoaded);
    
    // Só executar se a atividade já foi carregada para evitar conflitos
    if (!activityLoaded) {
      console.log("Atividade ainda não carregada, aguardando...");
      return;
    }
    
    const loadEditorContent = () => {
      try {
        const savedEditor = localStorage.getItem("editor-atividade-5-latest");
        console.log("Tentando carregar editor do localStorage:", savedEditor ? "Encontrado" : "Não encontrado");
        if (savedEditor) {
          const editorData = JSON.parse(savedEditor);
          console.log("Dados do editor carregados:", {
            hasContent: !!editorData.content,
            contentLength: editorData.content?.length || 0,
            timestamp: editorData.timestamp,
            contentPreview: editorData.content?.substring(0, 100) + "..."
          });
          if (editorData.content) {
            setEditorContent(editorData.content);
            setLastSavedEditor(new Date(editorData.timestamp).toLocaleString("pt-BR"));
            setShowEditor(true);
            console.log("Conteúdo do editor carregado automaticamente do localStorage");
          }
        }
      } catch (error) {
        console.error("Erro ao carregar conteúdo do editor automaticamente:", error);
      }
    };

    const clearEditorForNewActivity = () => {
      // Limpar localStorage do editor para nova atividade
      localStorage.removeItem("editor-atividade-5-latest");
      setEditorContent("");
      setLastSavedEditor("");
      console.log("Editor limpo para nova atividade");
    };

    // Se não estiver em modo de edição
    if (!isEditMode) {
      // Se houver rascunho, carregar conteúdo
      if (hasDraft()) {
        console.log("Rascunho detectado, carregando conteúdo do editor");
        loadEditorContent();
      } else {
        // Se não houver rascunho, limpar editor para nova atividade
        console.log("Nenhum rascunho detectado, limpando editor");
        clearEditorForNewActivity();
      }
    }
  }, [isEditMode, activityLoaded]); // Removido hasDraft das dependências

  // Verificar se existe rascunho ao carregar a página
  useEffect(() => {
    // Evitar execução repetida
    if (activityLoaded) return;

    const checkForDraft = async () => {
      const isEditMode = searchParams.get("edit") === "true";
      const atividadeId = searchParams.get("id");
      const isDraft = searchParams.get("draft") === "true";
      
      // Determinar se é nova atividade, rascunho ou edição
      const isNew = !isEditMode && !isDraft;
      setIsNewExam(isNew);

      // CORREÇÃO: Verificar rascunho independente do modo (novo ou edição)
      if (hasDraft()) {
        const draft = loadDraft();
        if (draft) {
          console.log("=== RASCUNHO ENCONTRADO - RESTAURANDO AUTOMATICAMENTE ===");
          setDraftData(draft);
          // Restaurar automaticamente em vez de mostrar modal
          restoreDraftAutomatically(draft);
          setActivityLoaded(true);
          return; // Sair da função para não executar lógica de edição
        }
      }
      
      // Se é modo de edição E tem ID válido, carregar atividade existente
      if (isEditMode && atividadeId && !isDraft) {
        try {
          const atividade = await getAtividadeById(atividadeId);
          if (atividade) {
            // Mapear dados da atividade para o formData
            const mappedFormData: FormData = {
              title: atividade.title || "",
              language: atividade.language || "portuguese",
              difficulty: atividade.difficulty || "a1",
              turma: atividade.turma_id || "none",
              topics: atividade.topics || "",
              selectedMaterial: atividade.material_id || "none",
              questionsCount: atividade.questions_count || 10,
              generateMultipleVersions: atividade.generate_multiple_versions || false,
              versionsCount: atividade.versions_count || 1,
              questionTypes: {
                multipleChoice: true,
                fillBlanks: false,
                trueFalse: false,
                openQuestions: false,
              },
            };
            
            setFormData(mappedFormData);
            
            // Se há conteúdo HTML, carregar no editor e fechar configurações
            if (atividade.content_html) {
              setEditorContent(atividade.content_html);
              setShowEditor(true);
              setIsConfigOpen(false); // Fechar configurações ao editar atividade existente
            } else {
              setShowEditor(false);
              setIsConfigOpen(true);
            }
            
            // Toast removido conforme solicitado pelo usuário
          }
        } catch (error) {
          console.error("Erro ao carregar atividade:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar a atividade para edição.",
            variant: "destructive",
          });
        }
      }
      
      // Marcar como carregado para evitar execução repetida
      setActivityLoaded(true);
    };

    checkForDraft();
  }, []); // Dependências vazias para executar apenas uma vez

  // Função para restaurar rascunho
  const restoreDraft = () => {
    console.log("=== INICIANDO RESTORE DRAFT ===");
    if (draftData) {
      console.log("DraftData encontrado:", draftData);
      setFormData(draftData.formData);
      setLastSaved(draftData.lastSaved);

      let loadedQuestions: Question[] = [];

      // Tentar carregar preview das questões se existir
      try {
        const savedPreview = localStorage.getItem("criar-prova-5-preview");
        console.log("Preview no localStorage:", savedPreview ? "Encontrado" : "Não encontrado");
        if (savedPreview) {
          const previewData = JSON.parse(savedPreview);
          console.log("Preview data:", previewData);
          if (previewData.generatedQuestions) {
            loadedQuestions = previewData.generatedQuestions;
            console.log("Questões carregadas do preview:", loadedQuestions.length);
            setGeneratedQuestions(loadedQuestions);
            setLastSavedPreview(previewData.lastSaved);
            
            // Restaurar dados de múltiplas versões se existirem
            if (previewData.allVersions && Array.isArray(previewData.allVersions)) {
              setAllVersions(previewData.allVersions);
              setHasMultipleVersions(previewData.hasMultipleVersions || false);
              setSelectedVersionIndex(previewData.selectedVersionIndex || 0);
              setCurrentVersionGabarito(previewData.currentVersionGabarito || []);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar preview:", error);
      }

      // Tentar carregar o conteúdo mais recente do editor
      try {
        const savedEditor = localStorage.getItem("editor-atividade-5-latest");
        console.log("Editor no localStorage:", savedEditor ? "Encontrado" : "Não encontrado");
        if (savedEditor) {
          const editorData = JSON.parse(savedEditor);
          console.log("Editor data:", {
            hasContent: !!editorData.content,
            contentLength: editorData.content?.length || 0,
            contentPreview: editorData.content?.substring(0, 200) + "..."
          });
          if (editorData.content) {
            setEditorContent(editorData.content);
            setLastSavedEditor(new Date(editorData.timestamp).toLocaleString("pt-BR"));
            setShowEditor(true);
            console.log("Conteúdo do editor restaurado do localStorage");
          }
        } else if (loadedQuestions.length > 0) {
          // Se não há conteúdo salvo do editor, mas há questões carregadas, gerar HTML
          console.log("Gerando HTML a partir das questões carregadas:", loadedQuestions.length);
          const gabarito = draftData.formData.generateGabarito ? (previewData?.currentVersionGabarito || previewData?.gabarito || draftData.gabarito) : undefined;
          const htmlContent = questionsToHtml(draftData.formData, loadedQuestions, gabarito);
          console.log("HTML gerado:", htmlContent.substring(0, 200) + "...");
          setEditorContent(htmlContent);
          setShowEditor(true);
          console.log("Conteúdo do editor gerado a partir das questões salvas");
        }
      } catch (error) {
        console.error("Erro ao carregar conteúdo do editor:", error);
      }
    }
    console.log("=== FINALIZANDO RESTORE DRAFT ===");
    setShowDraftModal(false);
  };

  // Função para restaurar rascunho automaticamente (sem modal)
  const restoreDraftAutomatically = (draft: DraftData) => {
    console.log("=== INICIANDO RESTORE DRAFT AUTOMATICO ===");
    console.log("DraftData recebido:", draft);
    setFormData(draft.formData);
    setLastSaved(draft.lastSaved);

    let loadedQuestions: Question[] = [];

    // Tentar carregar preview das questões se existir
    try {
      const savedPreview = localStorage.getItem("criar-prova-5-preview");
      console.log("Preview no localStorage:", savedPreview ? "Encontrado" : "Não encontrado");
      if (savedPreview) {
        const previewData = JSON.parse(savedPreview);
        console.log("Preview data:", previewData);
        if (previewData.generatedQuestions) {
          loadedQuestions = previewData.generatedQuestions;
          console.log("Questões carregadas do preview:", loadedQuestions.length);
          setGeneratedQuestions(loadedQuestions);
          setLastSavedPreview(previewData.lastSaved);
          
          // Restaurar dados de múltiplas versões se existirem
          if (previewData.allVersions && Array.isArray(previewData.allVersions)) {
            setAllVersions(previewData.allVersions);
            setHasMultipleVersions(previewData.hasMultipleVersions || false);
            setSelectedVersionIndex(previewData.selectedVersionIndex || 0);
            setCurrentVersionGabarito(previewData.currentVersionGabarito || []);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao carregar preview:", error);
    }

    // Tentar carregar o conteúdo mais recente do editor
    try {
      const savedEditor = localStorage.getItem("editor-atividade-5-latest");
      console.log("Editor no localStorage:", savedEditor ? "Encontrado" : "Não encontrado");
      if (savedEditor) {
        const editorData = JSON.parse(savedEditor);
        console.log("Editor data:", {
          hasContent: !!editorData.content,
          contentLength: editorData.content?.length || 0,
          contentPreview: editorData.content?.substring(0, 200) + "..."
        });
        if (editorData.content) {
          setEditorContent(editorData.content);
          setLastSavedEditor(new Date(editorData.timestamp).toLocaleString("pt-BR"));
          setShowEditor(true);
          console.log("Conteúdo do editor restaurado do localStorage");
        }
      } else if (loadedQuestions.length > 0) {
        // Se não há conteúdo salvo do editor, mas há questões carregadas, gerar HTML
        console.log("Gerando HTML a partir das questões carregadas:", loadedQuestions.length);
        const gabarito = draft.formData.generateGabarito ? (previewData?.currentVersionGabarito || previewData?.gabarito) : undefined;
        console.log("Gerando HTML - loadedQuestions:", { formData_turma: draft.formData.turma, turmas_count: turmas?.length, versao: 1 });
        const htmlContent = questionsToHtml(draft.formData, loadedQuestions, gabarito, turmas, 1);
        console.log("HTML gerado:", htmlContent.substring(0, 200) + "...");
        setEditorContent(htmlContent);
        setShowEditor(true);
        console.log("Conteúdo do editor gerado a partir das questões salvas");
      }
    } catch (error) {
      console.error("Erro ao carregar conteúdo do editor:", error);
    }
    console.log("=== FINALIZANDO RESTORE DRAFT AUTOMATICO ===");
  };

  // Função para descartar rascunho
  const discardDraft = () => {
    clearDraft();
    localStorage.removeItem("criar-prova-5-preview");
    setDraftData(null);
    setShowDraftModal(false);
  };

  // Função para salvar atividade no Supabase
  const handleSaveActivity = async () => {


    if (!formData.title.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, adicione um título para a prova.",
        variant: "destructive",
      });
      return;
    }

    // Permitir salvar sem questões geradas quando estiver editando uma atividade existente
    if (generatedQuestions.length === 0 && !isEditMode) {
      toast({
        title: "Erro",
        description: "Por favor, gere as questões antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("FormData:", formData);
      console.log("Generated Questions:", generatedQuestions);

      // Converter questões para o formato JSON
      const questoesJson = generatedQuestions.map((q, index) => ({
        question: q.question,
        type: mapQuestionType(q.type),
        options: q.options || null,
        correctAnswer: String(q.correctAnswer || ""),
      }));

      console.log("Questões convertidas para JSON:", questoesJson);

      // Preparar dados da atividade com colunas corretas
      const atividadeData = {
        title: formData.title,
        description: formData.topics || null,
        language: formData.language,
        difficulty: formData.difficulty,
        topics: formData.topics,
        questions_count: formData.questionsCount,
        generate_multiple_versions: formData.generateMultipleVersions,
        versions_count: formData.versionsCount,
        question_types: formData.questionTypes,
        turma_id:
          formData.turma && formData.turma !== "none" ? formData.turma : null,
        material_id:
          formData.selectedMaterial && formData.selectedMaterial !== "none"
            ? formData.selectedMaterial
            : null,
        instructions_text: `Prova de ${formData.language} - Nível ${formData.difficulty}`,
        content_html: editorContent || null,
        content_json: { questions: questoesJson },
      } as any;

      console.log("Dados da atividade preparados:", atividadeData);

      let atividade;
      if (isEditMode) {
        // Atualizar atividade existente
        const atividadeId = searchParams.get("id");
        if (!atividadeId) {
          throw new Error("ID da atividade não encontrado para edição");
        }
        console.log("Chamando updateAtividade...");
        atividade = await updateAtividade(atividadeId, atividadeData);
        console.log("Atividade atualizada com sucesso:", atividade);
      } else {
        // Criar nova atividade
        console.log("Chamando saveAtividade...");
        atividade = await saveAtividade(atividadeData);
        console.log("Atividade criada com sucesso:", atividade);
      }

      toast({
        title: "Sucesso!",
        description: isEditMode ? "Atividade atualizada com sucesso!" : "Atividade salva com sucesso no Supabase!",
        variant: "default",
      });

      // Limpar dados salvos
      clearDraft();
      localStorage.removeItem("criar-atividade-5-preview");
      setLastSaved("");
      setLastSavedPreview("");

      // Redirecionar para atividades
      navigate("/atividades");
    } catch (error) {
      console.error("Erro ao salvar atividade:", error);
      console.error("Erro detalhado:", {
        message: error instanceof Error ? error.message : "Erro desconhecido",
        stack: error instanceof Error ? error.stack : undefined,
        atividadeError,
      });

      const description =
        error instanceof Error && error.message
          ? error.message
          : atividadeError || "Erro ao salvar a atividade. Tente novamente.";
      toast({
        title: "Erro",
        description,
        variant: "destructive",
      });
    }
  };

  // Função para mapear tipos de questão para o formato do Supabase
  const mapQuestionType = (
    type: string,
  ): "multipla_escolha" | "verdadeiro_falso" | "dissertativa" | "numerica" => {
    switch (type) {
      case "multipleChoice":
        return "multipla_escolha";
      case "trueFalse":
        return "verdadeiro_falso";
      case "fillBlanks":
      case "openQuestions":
        return "dissertativa";
      default:
        return "dissertativa";
    }
  };

  // Função para buscar conteúdo do arquivo material
  const fetchMaterialContent = async (material: any): Promise<string | null> => {
    try {
      if (!material?.file_url) return null;
      
      console.log("Buscando conteúdo do material:", material.title, material.file_url);
      
      // Fazer download do arquivo do Supabase Storage
      const response = await fetch(material.file_url);
      
      if (!response.ok) {
        console.warn("Erro ao buscar arquivo material:", response.status);
        return null;
      }
      
      const blob = await response.blob();
      
      // Processar diferentes tipos de arquivo
      if (material.file_type === '.txt' || material.file_type === 'txt') {
        return await blob.text();
      } else if (material.file_type === '.pdf' || material.file_type === 'pdf') {
        // Para PDF, tentamos extrair texto básico (pode não funcionar com todos os PDFs)
        const text = await blob.text();
        return text.length > 0 ? text : "Conteúdo PDF não pôde ser extraído automaticamente";
      } else {
        // Para outros tipos, tentamos ler como texto
        try {
          const text = await blob.text();
          return text.length > 50 ? text : null; // Só retorna se tiver conteúdo significativo
        } catch {
          return null;
        }
      }
    } catch (error) {
      console.error("Erro ao buscar conteúdo do material:", error);
      return null;
    }
  };

  // Função para gerar questões
  const handleGenerateExam = async () => {
    const validation = validateForm();
    
    if (!validation.isValid) {
      // Atualizar estado de erros para destacar campos
      setFieldErrors(validation.errors);
      
      // Focar no primeiro campo com erro
      if (validation.firstErrorField) {
        focusOnField(validation.firstErrorField);
      }
      
      // Exibir mensagem específica para cada campo
      if (validation.missingFields.length === 1) {
        toast({
          title: "Campo obrigatório",
          description: `O campo "${validation.missingFields[0]}" é obrigatório e precisa ser preenchido.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Campos obrigatórios",
          description: `Os seguintes campos são obrigatórios: ${validation.missingFields.join(", ")}.`,
          variant: "destructive",
        });
      }
      return;
    }
    
    // Limpar erros se validação passou
    setFieldErrors({});

    setIsGenerating(true);

    try {
      // Obter sessão do Supabase para autenticação
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Usuário não autenticado");
      }

      // Preparar dados para a Edge Function
      const materialSelecionado = formData.selectedMaterial !== "none" ? 
        materiaisDisponiveis.find(m => m.id === formData.selectedMaterial) : null;

      const turmaSelecionada = formData.turma !== "none" ? 
        turmasDisponiveis.find(t => t.value === formData.turma) : null;

      // Buscar conteúdo do material se selecionado
      let materialConteudoTexto = null;
      if (materialSelecionado) {
        console.log("Buscando conteúdo do material selecionado:", materialSelecionado);
        console.log("Material tem file_url?", !!materialSelecionado.file_url);
        materialConteudoTexto = await fetchMaterialContent(materialSelecionado);
        console.log("Conteúdo do material obtido:", materialConteudoTexto ? `${materialConteudoTexto.length} caracteres` : "Nenhum conteúdo");
      }

      // Gerar valores únicos para garantir variabilidade nas questões
      const timestamp = Date.now();
      const randomSeed = Math.floor(Math.random() * 100000);
      const sessionId = `${timestamp}-${randomSeed}`;
      
      console.log("ID de sessão único para esta geração:", sessionId);

      const edgeFunctionData = {
        title: formData.title,
        language: formData.language,
        difficulty: formData.difficulty,
        questionsCount: formData.questionsCount,
        questionTypes: formData.questionTypes,
        topics: formData.topics || null,
        generateMultipleVersions: formData.generateMultipleVersions,
        versionsCount: formData.versionsCount,
        generateGabarito: formData.generateGabarito,
        // Valores únicos para garantir variabilidade
        timestamp: timestamp,
        randomSeed: randomSeed,
        sessionId: sessionId,
        // Formato esperado pela edge function
        turmaNome: turmaSelecionada?.label || null,
        materialTitulo: materialSelecionado?.title || null,
        materialConteudo: materialSelecionado ? {
          assunto: materialSelecionado.subject || "",
          descricao: materialSelecionado.description || "",
          tipo: materialSelecionado.type || "",
          conteudoTexto: materialConteudoTexto || null // NOVO: Conteúdo real do arquivo
        } : null,
        // Dados extras para logging (não afetam a edge function)
        turma: {
          id: formData.turma !== "none" ? formData.turma : null,
          nome: turmaSelecionada?.label || null,
        },
        material: {
          id: formData.selectedMaterial !== "none" ? formData.selectedMaterial : null,
          title: materialSelecionado?.title || null,
          type: materialSelecionado?.type || null,
          subject: materialSelecionado?.subject || null,
          description: materialSelecionado?.description || null,
          conteudoTexto: materialConteudoTexto || null,
        },
      };

      console.log("Enviando dados para Edge Function:", JSON.stringify(edgeFunctionData, null, 2));
      console.log("Session token:", session.access_token ? "Presente" : "Ausente");

      // Chamar a Edge Function
      const { data, error } = await supabase.functions.invoke('generate-questions', {
        body: edgeFunctionData,
      });

      if (error) {
        console.error("Erro da Edge Function:", error);
        console.error("Detalhes do erro:", JSON.stringify(error, null, 2));
        throw new Error(`Erro ao gerar questões: ${error.message || JSON.stringify(error)}`);
      }

      console.log("=== RESPOSTA COMPLETA DA EDGE FUNCTION ===");
      console.log("Data recebida:", JSON.stringify(data, null, 2));
      
      // Processar resposta baseada no tipo (múltiplas versões ou versão única)
      let questionsToProcess = [];
      
      if (data.versions && Array.isArray(data.versions)) {
        // Múltiplas versões - armazenar todas e usar a primeira por padrão
        console.log("Múltiplas versões recebidas:", data.versions.length);
        console.log("Versões disponíveis:", data.versions);
        
        if (data.versions.length === 0 || !data.versions[0] || !Array.isArray(data.versions[0].questions)) {
          throw new Error("Nenhuma versão válida encontrada na resposta");
        }
        
        // Armazenar todas as versões nos estados
        setAllVersions(data.versions);
        setHasMultipleVersions(true);
        setSelectedVersionIndex(0);
        
        // Inicializar gabarito da primeira versão
        setCurrentVersionGabarito(data.versions[0].gabarito || []);
        
        questionsToProcess = data.versions[0].questions;
        console.log("Usando primeira versão. Total de questões:", questionsToProcess.length);
        console.log("Versões disponíveis para seleção:", data.versions.length);

        
      } else if (data.questions && Array.isArray(data.questions)) {
        // Versão única
        console.log("Versão única recebida:", data.questions.length, "questões");
        questionsToProcess = data.questions;
        
        // Limpar estados de múltiplas versões
        setAllVersions([]);
        setHasMultipleVersions(false);
        setSelectedVersionIndex(0);
        
        // Inicializar gabarito da versão única
        setCurrentVersionGabarito(data.gabarito || []);

        
      } else {
        console.error("Formato de resposta inválido:", data);
        throw new Error("Formato de resposta inválido: nem questions nem versions encontrados");
      }
      
      if (questionsToProcess.length === 0) {
        throw new Error("Nenhuma questão foi gerada");
      }
      
      console.log("Questões a processar:", questionsToProcess);
      console.log("Primeira questão:", questionsToProcess[0]);
      console.log("Tipo da primeira questão:", typeof questionsToProcess[0]);
      console.log("Conteúdo da primeira questão:", JSON.stringify(questionsToProcess[0], null, 2));

      // Converter questões para o formato esperado
      const generatedQuestions: Question[] = questionsToProcess.map((q: any, index: number) => {
        console.log(`Processando questão ${index + 1}:`, q);
        return {
          id: String(index + 1),
          type: q.type,
          question: q.question,
          options: q.options || null,
          correctAnswer: q.correctAnswer || "",
        };
      });

      console.log("=== QUESTÕES CONVERTIDAS ===");
      console.log("Total de questões:", generatedQuestions.length);
      console.log("Questões convertidas:", JSON.stringify(generatedQuestions, null, 2));
      setGeneratedQuestions(generatedQuestions);

      // Converter questões para HTML e mostrar no editor
      // IMPORTANTE: Usar o gabarito recém-recebido da edge function, não o estado anterior
      let gabaritoAtualizado;
      if (formData.generateGabarito) {
        if (data.versions && Array.isArray(data.versions)) {
          // Para múltiplas versões, usar o gabarito da primeira versão
          gabaritoAtualizado = data.versions[0].gabarito || [];
        } else {
          // Para versão única, usar o gabarito direto
          gabaritoAtualizado = data.gabarito || [];
        }
      } else {
        gabaritoAtualizado = undefined;
      }
      
      console.log("Gerando HTML - generatedQuestions:", { formData_turma: formData.turma, turmas_count: turmas?.length, versao: 1 });
      console.log("Gabarito atualizado para HTML:", gabaritoAtualizado);
      const htmlContent = questionsToHtml(formData, generatedQuestions, gabaritoAtualizado, turmas, 1);
      console.log("HTML gerado para o editor:", htmlContent);
      console.log("Tamanho do HTML:", htmlContent.length, "caracteres");
      
      setEditorContent(htmlContent);
      console.log("Estado editorContent atualizado");
      
      // Salvar imediatamente o conteúdo gerado no localStorage
      handleEditorSave(htmlContent);
      console.log("Conteúdo salvo imediatamente no localStorage");
      
      setShowEditor(true);
      console.log("showEditor definido como true");

      setIsConfigOpen(false); // Recolher configurações após gerar

      toast({
        title: "Sucesso!",
        description: `${generatedQuestions.length} questões geradas com sucesso!`,
        variant: "default",
      });

    } catch (error) {
      console.error("Erro ao gerar questões:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      
      toast({
        title: "Erro",
        description: `Falha ao gerar questões: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Função para focar no primeiro campo com erro
  const focusOnField = (fieldName: string) => {
    setTimeout(() => {
      const fieldMap: { [key: string]: string } = {
        'title': 'title',
        'language': 'language',
        'difficulty': 'difficulty',
        'questionTypes': 'multipleChoice' // Foca no primeiro checkbox dos tipos de questões
      };
      
      const elementId = fieldMap[fieldName];
      if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 100);
  };

  // Validação detalhada do formulário
  const validateForm = () => {
    const errors: {
      title?: boolean;
      language?: boolean;
      difficulty?: boolean;
      questionTypes?: boolean;
    } = {};
    
    const missingFields: string[] = [];
    let firstErrorField: string | null = null;
    
    if (!formData.title.trim()) {
      errors.title = true;
      missingFields.push("Título da Prova");
      if (!firstErrorField) firstErrorField = 'title';
    }
    
    if (!formData.language) {
      errors.language = true;
      missingFields.push("Idioma");
      if (!firstErrorField) firstErrorField = 'language';
    }
    
    if (!formData.difficulty) {
      errors.difficulty = true;
      missingFields.push("Nível de Dificuldade");
      if (!firstErrorField) firstErrorField = 'difficulty';
    }
    
    if (!Object.values(formData.questionTypes).some(Boolean)) {
      errors.questionTypes = true;
      missingFields.push("Tipos de Questões");
      if (!firstErrorField) firstErrorField = 'questionTypes';
    }
    
    return { errors, missingFields, isValid: missingFields.length === 0, firstErrorField };
  };
  
  // Validação do formulário (mantida para compatibilidade)
  const isFormValid = () => {
    return validateForm().isValid;
  };
  
  // Função para limpar erro de um campo específico
  const clearFieldError = (field: keyof typeof fieldErrors) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // Handlers para atualizar form data
  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateQuestionType = (
    type: keyof FormData["questionTypes"],
    checked: boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      questionTypes: {
        ...prev.questionTypes,
        [type]: checked,
      },
    }));
  };

  // Função para limpar preview
  const clearPreview = () => {
    localStorage.removeItem("criar-prova-5-preview");
    setLastSavedPreview("");
  };

  // Função para salvar conteúdo do editor
  const handleEditorSave = (content: string) => {
    console.log('handleEditorSave chamado com conteúdo:', content.substring(0, 200) + '...');
    console.log('Tamanho do conteúdo a ser salvo:', content.length);
    
    const saveData = {
      content,
      timestamp: new Date().toISOString(),
      formData,
      generatedQuestions,
    };

    localStorage.setItem("editor-atividade-5-latest", JSON.stringify(saveData));
    setLastSavedEditor(new Date().toLocaleString("pt-BR"));
    console.log('Conteúdo salvo no localStorage com sucesso');
  };

  // Função para voltar às configurações
  const handleBackToConfig = () => {
    setShowEditor(false);
    setIsConfigOpen(true);
  };

  const selectedLanguage = languages.find((l) => l.value === formData.language);
  const selectedDifficulty = difficultyLevels.find(
    (d) => d.value === formData.difficulty,
  );

  // Memoizar listas para evitar recriações desnecessárias
  const materiaisDisponiveis = useMemo(() => [
    {
      id: "none",
      title: "Nenhum Material (Opcional)",
      type: "none",
      subject: "",
      description: "Criar prova sem material base",
    },
    ...(materiais || []).map((material) => ({
      id: material.id,
      title: material.title,
      type: material.file_type,
      subject: material.subject || "",
      description: material.description || "",
      file_url: material.file_url, // CORREÇÃO: Incluir file_url para buscar conteúdo
    })),
  ], [materiais]);

  const turmasDisponiveis = useMemo(() => [
    { value: "none", label: "Nenhuma Turma (Opcional)" },
    ...(turmas || []).map((turma) => ({
      value: turma.id,
      label: turma.name,
    })),
  ], [turmas]);

  // Mostrar loading se estiver carregando dados iniciais
  if (materiaisLoading || turmasLoading) {
    return <LoadingSpinner message="Carregando dados..." fullScreen />;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? "Edição da Atividade" : "Criar Atividade"}
                </h1>
                <p className="text-gray-600 mt-1">
                  Configure e visualize sua atividade em tempo real
                </p>
              </div>
              {lastSavedEditor && (
                <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span>Salvo automaticamente às {lastSavedEditor}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Configurações Recolhíveis */}
        <div className="max-w-7xl mx-auto px-1 sm:px-4 py-2 sm:py-6">
          <Collapsible open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <Card className="mb-3 sm:mb-6">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer bg-gray-50 transition-colors px-2 sm:px-6 py-2 sm:py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Settings className="w-5 h-5 text-purple-600" />
                      <CardTitle className={isMobile ? "text-base" : "text-xl"}>Configurações da Atividade</CardTitle>
                    </div>
                    {isConfigOpen ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0 px-2 sm:px-6 pb-2 sm:pb-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-6">
                    {/* Coluna 1: Campos principais */}
                    <div className="lg:col-span-2">
                      <div className="space-y-1 sm:space-y-3">
                        {/* Linha 1: Título da Prova e Idioma */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 sm:gap-3">
                          <div>
                            <Label
                              htmlFor="title"
                              className="text-sm font-bold text-gray-900"
                            >
                              Título da Prova{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="title"
                              value={formData.title}
                              onChange={(e) => {
                                updateFormData("title", e.target.value);
                                if (fieldErrors.title) clearFieldError("title");
                              }}
                              onBlur={handleFieldBlur}
                              placeholder="Ex: Atividade de Inglês - Tempos Verbais"
                              className={`mt-1 rounded-lg focus:ring-0 ${
                                fieldErrors.title
                                  ? "border-2 border-red-500 focus:border-red-500"
                                  : "border border-purple-200"
                              }`}
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor="language"
                              className="text-sm font-bold text-gray-900"
                            >
                              Idioma <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={formData.language}
                              onValueChange={(value) => {
                                updateFormData("language", value);
                                if (fieldErrors.language) clearFieldError("language");
                              }}
                              onOpenChange={(open) => {
                                if (!open) handleFieldBlur();
                              }}
                            >
                              <SelectTrigger id="language" className={`mt-1 rounded-lg focus:ring-0 ${
                                fieldErrors.language
                                  ? "border-2 border-red-500 focus:border-red-500"
                                  : "border border-purple-200"
                              }`}>
                                <SelectValue placeholder="Selecione o idioma" />
                              </SelectTrigger>
                              <SelectContent>
                                {languages.map((lang) => (
                                  <SelectItem
                                    key={lang.value}
                                    value={lang.value}
                                  >
                                    <span className="flex items-center space-x-2">
                                      <span>{lang.flag}</span>
                                      <span>{lang.label}</span>
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Linha 2: Nível de Dificuldade e Turma */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 sm:gap-3">
                          <div>
                            <Label
                              htmlFor="difficulty"
                              className="text-sm font-bold text-gray-900"
                            >
                              Nível de Dificuldade{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={formData.difficulty}
                              onValueChange={(value) => {
                                updateFormData("difficulty", value);
                                if (fieldErrors.difficulty) clearFieldError("difficulty");
                              }}
                              onOpenChange={(open) => {
                                if (!open) handleFieldBlur();
                              }}
                            >
                              <SelectTrigger id="difficulty" className={`mt-1 rounded-lg focus:ring-0 ${
                                fieldErrors.difficulty
                                  ? "border-2 border-red-500 focus:border-red-500"
                                  : "border border-purple-200"
                              }`}>
                                <SelectValue placeholder="Selecione o nível" />
                              </SelectTrigger>
                              <SelectContent>
                                {difficultyLevels.map((level) => (
                                  <SelectItem
                                    key={level.value}
                                    value={level.value}
                                  >
                                    <span className="flex items-center space-x-2">
                                      <span className="font-medium">
                                        {level.label}
                                      </span>
                                      <span className="text-gray-500">
                                        ({level.description})
                                      </span>
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label
                              htmlFor="turma"
                              className="text-sm font-bold text-gray-900"
                            >
                              Turma
                            </Label>
                            <Select
                              value={formData.turma}
                              onValueChange={(value) =>
                                updateFormData("turma", value)
                              }
                              onOpenChange={(open) => {
                                if (!open) handleFieldBlur();
                              }}
                            >
                              <SelectTrigger className="mt-1 border-purple-200 rounded-lg  focus:ring-0">
                                <SelectValue placeholder="Selecione a turma" />
                              </SelectTrigger>
                              <SelectContent>
                                {turmasDisponiveis.map((turma) => (
                                  <SelectItem
                                    key={turma.value}
                                    value={turma.value}
                                  >
                                    {turma.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Linha 3: Material Base e Número de Questões */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 sm:gap-3">
                          <div>
                            <Label
                              htmlFor="material"
                              className="text-sm font-bold text-gray-900"
                            >
                              Material Base
                            </Label>
                            <Select
                              value={formData.selectedMaterial}
                              onValueChange={(value) =>
                                updateFormData("selectedMaterial", value)
                              }
                              onOpenChange={(open) => {
                                if (!open) handleFieldBlur();
                              }}
                            >
                              <SelectTrigger className="mt-1 border-purple-200 rounded-lg  focus:ring-0">
                                <SelectValue placeholder="Selecione um material" />
                              </SelectTrigger>
                              <SelectContent>
                                {materiaisDisponiveis.map((material) => (
                                  <SelectItem
                                    key={material.id}
                                    value={material.id}
                                  >
                                    <div className="flex flex-col">
                                      <span>{material.title}</span>
                                      {material.description && (
                                        <span className="text-xs text-gray-500">
                                          {material.description}
                                        </span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label
                              htmlFor="questionsCount"
                              className="text-sm font-bold text-gray-900"
                            >
                              Número de Questões
                            </Label>
                            <Input
                              id="questionsCount"
                              type="number"
                              min="1"
                              max="50"
                              value={formData.questionsCount}
                              onChange={(e) =>
                                updateFormData(
                                  "questionsCount",
                                  parseInt(e.target.value) || 10,
                                )
                              }
                              onBlur={handleFieldBlur}
                              className="mt-1 border-purple-200 rounded-lg  focus:ring-0"
                            />
                          </div>
                        </div>

                        {/* Linha 4: Tópicos e Conteúdo (apenas quando sem material) */}
                        {formData.selectedMaterial === "none" && (
                          <div>
                            <Label
                              htmlFor="topics"
                              className="text-sm font-bold text-gray-900"
                            >
                              Tópicos e Conteúdo
                            </Label>
                            <Textarea
                              id="topics"
                              value={formData.topics}
                              onChange={(e) =>
                                updateFormData("topics", e.target.value)
                              }
                              onBlur={handleFieldBlur}
                              placeholder="Descreva os tópicos que devem ser abordados na atividade..."
                              className="mt-1 min-h-[80px] border-purple-200 rounded-lg  focus:ring-0"
                            />
                          </div>
                        )}

                        {/* Linha 5: Configurações de Múltiplas Versões e Gabarito */}
                        <div className="bg-white border border-gray-200 rounded-lg p-1 sm:p-4 shadow-sm transition-shadow">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 sm:gap-4">
                            {/* Checkbox Gerar Múltiplas Versões */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Checkbox
                                  id="generateMultipleVersions"
                                  checked={formData.generateMultipleVersions}
                                  onCheckedChange={(checked) => updateFormData("generateMultipleVersions", checked as boolean)}
                                  onBlur={handleFieldBlur}
                                  className="w-5 h-5 border-2 border-indigo-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                />
                                <div>
                                <div>
                                    <Label htmlFor="generateMultipleVersions" className="text-sm font-semibold text-gray-800 cursor-pointer">
                                      Gerar Múltiplas Versões
                                    </Label>
                                    <p className="text-xs text-gray-500">
                                      Criar diferentes versões da atividade
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              {formData.generateMultipleVersions && (
                                <div className="ml-8 bg-indigo-50 px-3 py-2 rounded-md border border-indigo-200 w-fit">
                                  <Label htmlFor="versionsCount" className="text-xs font-medium text-indigo-700 block mb-1">
                                    Qtd:
                                  </Label>
                                  <Input
                                    id="versionsCount"
                                    type="number"
                                    min="2"
                                    max="10"
                                    value={formData.versionsCount}
                                    onChange={(e) => updateFormData("versionsCount", parseInt(e.target.value) || 2)}
                                    onBlur={handleFieldBlur}
                                    className="w-16 h-7 text-xs text-center border-indigo-300 rounded focus:border-indigo-500 focus:ring-indigo-500"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Checkbox Gerar Gabarito */}
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id="generateGabarito"
                                checked={formData.generateGabarito}
                                onCheckedChange={(checked) => updateFormData("generateGabarito", checked as boolean)}
                                onBlur={handleFieldBlur}
                                className="w-5 h-5 border-2 border-green-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                              />
                              <div>
                                <div>
                                  <Label htmlFor="generateGabarito" className="text-sm font-semibold text-gray-800 cursor-pointer">
                                    Gerar Gabarito
                                  </Label>
                                  <p className="text-xs text-gray-500">
                                    Incluir gabarito com as respostas
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Coluna 2: Tipos de Questões */}
                    <div className="space-y-1 sm:space-y-3">
                      <Label className="text-sm font-bold text-gray-900">
                        Tipos de Questões{" "}
                        <span className="text-red-500">*</span>
                      </Label>

                      <div className={`space-y-0.5 sm:space-y-2 p-1 sm:p-3 rounded-lg border-2 transition-colors ${
                        fieldErrors.questionTypes 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-transparent'
                      }`}>
                        {questionTypes.map((type) => {
                          const Icon = type.icon;
                          return (
                            <div
                              key={type.key}
                              className="flex items-start space-x-1 sm:space-x-2 p-1 sm:p-2 border border-purple-100 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                              onClick={() => {
                                updateQuestionType(
                                  type.key as keyof FormData["questionTypes"],
                                  !formData.questionTypes[
                                    type.key as keyof FormData["questionTypes"]
                                  ],
                                );
                                clearFieldError('questionTypes');
                              }}
                            >
                              <Checkbox
                                id={type.key}
                                checked={
                                  formData.questionTypes[
                                    type.key as keyof FormData["questionTypes"]
                                  ]
                                }
                                onCheckedChange={(checked) => {
                                  updateQuestionType(
                                    type.key as keyof FormData["questionTypes"],
                                    checked as boolean,
                                  );
                                  clearFieldError('questionTypes');
                                }}
                                onBlur={handleFieldBlur}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <Icon className="w-4 h-4 text-purple-600" />
                                  <span className="font-medium text-sm">
                                    {type.label}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {type.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>



                      {/* Botão para gerar/regerar prova */}
                      <div className="mt-4">
                        <Button
                          onClick={handleGenerateExam}
                          disabled={isGenerating}
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg"
                        >
                          {isGenerating ? (
                            <>
                              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                              Gerando Atividade...
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 mr-2" />
                              {generatedQuestions.length > 0
                                ? "Regerar"
                                : "Gerar Atividade com IA"}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Nota sobre campos obrigatórios */}
                  <div className="flex justify-end mt-4">
                    <p className="text-xs text-red-500">
                      * campos obrigatórios
                    </p>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Editor de Prova */}
          {console.log("Renderizando página - showEditor:", showEditor, "editorContent length:", editorContent?.length || 0)}
          {showEditor && (
            <div className="mt-3 sm:mt-6 flex-1 flex flex-col">
              {/* Header do Editor */}
              <div className="mb-2 sm:mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  {/* Seletor de Versões */}
                  {hasMultipleVersions && allVersions.length > 1 && (
                    <div className="flex items-center space-x-3">
                      <Label className="text-sm font-medium text-gray-700">
                        Versão da Atividade:
                      </Label>
                      <Select
                        value={selectedVersionIndex.toString()}
                        onValueChange={(value) => handleVersionChange(parseInt(value))}
                      >
                        <SelectTrigger className="w-48 border-purple-200 rounded-lg  focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {allVersions.map((_, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              <div className="flex items-center space-x-2">
                                <span>Versão {index + 1}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Badge variant="outline" className="text-xs">
                        {allVersions.length} versões disponíveis
                      </Badge>
                    </div>
                  )}
                  <div></div>
                </div>
              </div>

              {/* WordEditor */}
              <Card className="flex-1 flex flex-col">
                <WordEditor
                  initialContent={editorContent}
                  onSave={handleEditorSave}
                  onContentChange={setEditorContent}
                  className="flex-1"
                />
              </Card>

              {/* Botões de Ação */}
              <div className="flex justify-between mt-2 sm:mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Limpar todos os dados da atividade
                    setShowEditor(false);
                    setGeneratedQuestions([]);
                    setEditorContent("");
                    setLastSaved("");
                    setLastSavedPreview("");
                    setLastSavedEditor("");

                    // Limpar rascunho e dados salvos
                    clearDraft();
                    localStorage.removeItem("criar-atividade-5-preview");
                    localStorage.removeItem("editor-atividade-5-latest");

                    // Redirecionar para atividades
                    navigate("/atividades");
                  }}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  Voltar Sem Salvar
                </Button>

                <Button
                  onClick={handleSaveActivity}
                  disabled={atividadeLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {atividadeLoading ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Aprovar e Salvar
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}





          {/* Estado vazio - só mostrar se não estiver editando */}
          {generatedQuestions.length === 0 && !isGenerating && !isEditMode && (
            <Card className="text-center py-12">
              <CardContent>
                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Pronta para gerar sua atividade?
                </h3>
                <p className="text-gray-600 mb-6">
                  Preencha as configurações acima e clique em "Gerar Atividade com
                  IA" para começar.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de Confirmação para Restaurar Rascunho */}
      <AlertDialog open={showDraftModal} onOpenChange={setShowDraftModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <Save className="w-5 h-5 text-blue-600" />
              <span>Rascunho Encontrado</span>
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>
                  Encontramos um rascunho não salvo da sua atividade anterior.
                  Deseja continuar de onde parou ou começar uma nova atividade?
                </p>
                {draftData && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="text-sm">
                      <strong>Título:</strong>{" "}
                      {draftData.formData.title || "Sem título"}
                    </div>
                    <div className="text-sm">
                      <strong>Idioma:</strong>{" "}
                      {languages.find(
                        (l) => l.value === draftData.formData.language,
                      )?.label || "Não definido"}
                    </div>
                    <div className="text-sm">
                      <strong>Salvo em:</strong> {draftData.lastSaved}
                    </div>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={discardDraft}>
              Começar do Zero
            </AlertDialogCancel>
            <AlertDialogAction onClick={restoreDraft}>
              Continuar Rascunho
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Loading Overlay para geração de atividade */}
      <LoadingOverlay 
        isVisible={isGenerating}
        message="Atividade sendo gerada pela Inteligência Artificial..."
        subMessage="Aguarde um instante"
      />

    </Layout>
  );
}
