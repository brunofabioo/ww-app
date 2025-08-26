import { useEffect, useRef, useCallback } from 'react';

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

interface DraftData {
  timestamp: number;
  currentStep: number;
  formData: FormData;
  lastSaved: string;
}

const DRAFT_KEY = 'criar-prova-draft';
const SAVE_DELAY = 1000; // 1 segundo de delay para debounce

// Function to get all drafts from localStorage (for listing in Atividades)
export const getAllDrafts = (): DraftData[] => {
  try {
    const drafts: DraftData[] = [];
    
    // Check for the main draft key
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      const draftData: DraftData = JSON.parse(saved);
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      
      // Only include drafts newer than 7 days
      if (draftData.timestamp > sevenDaysAgo) {
        drafts.push(draftData);
      } else {
        // Clean up expired draft
        localStorage.removeItem(DRAFT_KEY);
      }
    }
    
    return drafts;
  } catch (error) {
    console.error('Failed to get all drafts:', error);
    return [];
  }
};

// Function to delete a specific draft by timestamp
export const deleteDraft = (timestamp: number): boolean => {
  try {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      const draftData: DraftData = JSON.parse(saved);
      if (draftData.timestamp === timestamp) {
        localStorage.removeItem(DRAFT_KEY);
        console.log('Rascunho excluído com sucesso');
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Erro ao excluir rascunho:', error);
    return false;
  }
};

export function useDraftSave() {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');

  // Salvar rascunho no LocalStorage
  const saveDraft = useCallback((currentStep: number, formData: FormData) => {
    // Debounce: cancela o save anterior se ainda não executou
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const draftData: DraftData = {
        timestamp: Date.now(),
        currentStep,
        formData,
        lastSaved: new Date().toLocaleString('pt-BR')
      };

      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
        lastSavedRef.current = draftData.lastSaved;
        console.log('Rascunho salvo automaticamente:', draftData.lastSaved);
      } catch (error) {
        console.error('Erro ao salvar rascunho:', error);
      }
    }, SAVE_DELAY);
  }, []);

  // Carregar rascunho do LocalStorage
  const loadDraft = useCallback((): DraftData | null => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        const draftData: DraftData = JSON.parse(savedDraft);
        // Verificar se o rascunho não é muito antigo (7 dias)
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        if (draftData.timestamp > sevenDaysAgo) {
          return draftData;
        } else {
          // Remove rascunho antigo
          localStorage.removeItem(DRAFT_KEY);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar rascunho:', error);
    }
    return null;
  }, []);

  // Limpar rascunho
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      lastSavedRef.current = '';
      console.log('Rascunho removido');
    } catch (error) {
      console.error('Erro ao limpar rascunho:', error);
    }
  }, []);

  // Verificar se existe rascunho
  const hasDraft = useCallback((): boolean => {
    return loadDraft() !== null;
  }, [loadDraft]);

  // Obter último horário salvo
  const getLastSaved = useCallback((): string => {
    return lastSavedRef.current;
  }, []);

  // Cleanup do timeout quando o componente desmonta
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
    getLastSaved
  };
}

export type { DraftData, FormData as DraftFormData };