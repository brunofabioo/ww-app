import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
function questionsToHtml(formData: FormData, questions: Question[]): string {
  console.log("=== questionsToHtml INICIADA ===");
  console.log("questionsToHtml chamada com:", { formData, questions });
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
  const selectedTurma = formData.turma !== "none" ? 
    formData.turma : "_______";

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
        <p><strong>Turma:</strong> ${selectedTurma} | <strong>Número:</strong> _______</p>
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

      <div style="text-align: center; margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px;">
        <p style="font-size: 12px; color: #666;">Página 1 de 1</p>
      </div>
    </div>
  `;
  
  console.log("=== questionsToHtml FINALIZADA ===");
  console.log("HTML final gerado pela questionsToHtml:", finalHtml.substring(0, 500) + "...");
  console.log("Tamanho total do HTML:", finalHtml.length);
  console.log("Questões processadas no HTML:", questions.length);
  
  // Verificar se o HTML contém as questões reais
  const hasRealQuestions = questions.some(q => q.question && q.question.trim() !== "");
  console.log("HTML contém questões reais:", hasRealQuestions);
  
  if (!hasRealQuestions) {
    console.error("ERRO: HTML gerado não contém questões válidas!");
  }
  
  return finalHtml;
}

export default function CriarAtividade5() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditMode = searchParams.get("edit") === "true";
  const [formData, setFormData] = useState<FormData>({
    title: "",
    language: "",
    difficulty: "",
    turma: "",
    topics: "",
    selectedMaterial: "",
    questionsCount: 10,
    generateMultipleVersions: false,
    versionsCount: 2,
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

  // Auto save quando formData muda (com debounce)
  useEffect(() => {
    if (
      formData.title ||
      formData.language ||
      formData.difficulty ||
      formData.topics
    ) {
      const timeoutId = setTimeout(() => {
        saveDraft(1, formData);
        setLastSaved(new Date().toLocaleString("pt-BR"));
      }, 1000); // Debounce de 1 segundo

      return () => clearTimeout(timeoutId);
    }
  }, [formData]); // Removido saveDraft das dependências

  // Auto save para preview das questões (apenas quando questões mudam)
  useEffect(() => {
    if (generatedQuestions.length > 0) {
      const savePreviewData = () => {
        const previewData = {
          formData,
          generatedQuestions,
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
  }, [generatedQuestions]); // Removido formData das dependências

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
      // Verificar se é uma nova prova (não vem de edição)
      const isNew = !searchParams.get("edit");
      const atividadeId = searchParams.get("id");
      setIsNewExam(isNew);

      // CORREÇÃO: Verificar rascunho independente do modo (novo ou edição)
      if (hasDraft()) {
        const draft = loadDraft();
        if (draft) {
          console.log("=== RASCUNHO ENCONTRADO - RESTAURANDO AUTOMATICAMENTE ===");
          setDraftData(draft);
          // Restaurar automaticamente em vez de mostrar modal
          restoreDraftAutomatically(draft);
          return; // Sair da função para não executar lógica de edição
        }
      }
      
      if (!isNew) {
        // Se vem de edição com ID da atividade, carregar dados da atividade
        if (atividadeId) {
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
        // Se vem de edição (continuar edição de rascunho), carregar automaticamente
        else if (hasDraft()) {
          const draft = loadDraft();
          if (draft) {
            setFormData(draft.formData);
            setLastSaved(draft.lastSaved);

            // Tentar carregar preview das questões se existir
            try {
              const savedPreview = localStorage.getItem(
                "criar-atividade-5-preview",
              );
              if (savedPreview) {
                const previewData = JSON.parse(savedPreview);
                if (previewData.generatedQuestions) {
                  setGeneratedQuestions(previewData.generatedQuestions);
                  setLastSavedPreview(previewData.lastSaved);

                  // Converter questões para HTML e abrir no editor
                  const htmlContent = questionsToHtml(
                    draft.formData,
                    previewData.generatedQuestions,
                  );
                  setEditorContent(htmlContent);
                  setShowEditor(true);
                  setIsConfigOpen(false); // Recolher configurações se já há questões
                } else {
                  // Se não há questões geradas, manter configurações expandidas
                  setShowEditor(false);
                  setIsConfigOpen(true);
                }
              } else {
                // Se não há preview salvo, manter configurações expandidas
                setShowEditor(false);
                setIsConfigOpen(true);
              }
            } catch (error) {
              console.error("Erro ao carregar preview:", error);
              // Em caso de erro, manter configurações expandidas
              setShowEditor(false);
              setIsConfigOpen(true);
            }
          }
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
          const htmlContent = questionsToHtml(draftData.formData, loadedQuestions);
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
        const htmlContent = questionsToHtml(draft.formData, loadedQuestions);
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
    console.log("Iniciando salvamento da atividade...");

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
    if (!isFormValid()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

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

      if (!data || !data.questions || !Array.isArray(data.questions)) {
        throw new Error("Resposta inválida da Edge Function");
      }

      console.log("=== RESPOSTA COMPLETA DA EDGE FUNCTION ===");
      console.log("Data recebida:", JSON.stringify(data, null, 2));
      console.log("Questões brutas:", data.questions);
      console.log("Primeira questão:", data.questions[0]);
      console.log("Tipo da primeira questão:", typeof data.questions[0]);
      console.log("Conteúdo da primeira questão:", JSON.stringify(data.questions[0], null, 2));

      // Converter questões para o formato esperado
      const generatedQuestions: Question[] = data.questions.map((q: any, index: number) => {
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
      const htmlContent = questionsToHtml(formData, generatedQuestions);
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

  // Validação do formulário
  const isFormValid = () => {
    return (
      formData.title.trim() &&
      formData.language &&
      formData.difficulty &&
      Object.values(formData.questionTypes).some(Boolean)
    );
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

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
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
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Collapsible open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <Card className="mb-6">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Settings className="w-5 h-5 text-purple-600" />
                      <CardTitle>Configurações da Atividade</CardTitle>
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
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Coluna 1: Campos principais */}
                    <div className="lg:col-span-2">
                      <div className="space-y-3">
                        {/* Linha 1: Título da Prova e Idioma */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                              onChange={(e) =>
                                updateFormData("title", e.target.value)
                              }
                              placeholder="Ex: Atividade de Inglês - Tempos Verbais"
                              className="mt-1 border-purple-200 rounded-lg focus:border-purple-400 focus:ring-purple-400"
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
                              onValueChange={(value) =>
                                updateFormData("language", value)
                              }
                            >
                              <SelectTrigger className="mt-1 border-purple-200 rounded-lg focus:border-purple-400 focus:ring-purple-400">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                              onValueChange={(value) =>
                                updateFormData("difficulty", value)
                              }
                            >
                              <SelectTrigger className="mt-1 border-purple-200 rounded-lg focus:border-purple-400 focus:ring-purple-400">
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
                            >
                              <SelectTrigger className="mt-1 border-purple-200 rounded-lg focus:border-purple-400 focus:ring-purple-400">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                            >
                              <SelectTrigger className="mt-1 border-purple-200 rounded-lg focus:border-purple-400 focus:ring-purple-400">
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
                              className="mt-1 border-purple-200 rounded-lg focus:border-purple-400 focus:ring-purple-400"
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
                              placeholder="Descreva os tópicos que devem ser abordados na atividade..."
                              className="mt-1 min-h-[80px] border-purple-200 rounded-lg focus:border-purple-400 focus:ring-purple-400"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Coluna 2: Tipos de Questões */}
                    <div className="space-y-3">
                      <Label className="text-sm font-bold text-gray-900">
                        Tipos de Questões{" "}
                        <span className="text-red-500">*</span>
                      </Label>

                      <div className="space-y-2">
                        {questionTypes.map((type) => {
                          const Icon = type.icon;
                          return (
                            <div
                              key={type.key}
                              className="flex items-start space-x-2 p-2 border border-purple-100 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                              onClick={() =>
                                updateQuestionType(
                                  type.key as keyof FormData["questionTypes"],
                                  !formData.questionTypes[
                                    type.key as keyof FormData["questionTypes"]
                                  ],
                                )
                              }
                            >
                              <Checkbox
                                id={type.key}
                                checked={
                                  formData.questionTypes[
                                    type.key as keyof FormData["questionTypes"]
                                  ]
                                }
                                onCheckedChange={(checked) =>
                                  updateQuestionType(
                                    type.key as keyof FormData["questionTypes"],
                                    checked as boolean,
                                  )
                                }
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
                          disabled={!isFormValid() || isGenerating}
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
            <div className="mt-6 flex-1 flex flex-col">
              {/* Header do Editor */}
              <div className="mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
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
              <div className="flex justify-between mt-4">
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

          {/* Debug Supabase - Seção para testes */}
          {process.env.NODE_ENV === 'development' && (
            <Collapsible className="mb-6">
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Settings className="w-5 h-5 text-orange-600" />
                        <span>Debug Supabase (Desenvolvimento)</span>
                      </div>
                      <ChevronDown className="w-4 h-4" />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <DebugSupabase />
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
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
    </Layout>
  );
}
