import { useCallback } from 'react';
import { Question } from '@/components/QuestionCard';

interface ActivityData {
  id: string;
  title: string;
  subject: string;
  level: string;
  turma?: string;
  questionsCount: number;
  questions: Question[];
  createdAt: string;
  type: 'exam';
  status: 'active';
  topics: string;
  questionTypes: string[];
  material?: string;
}

const ACTIVITIES_KEY = 'saved-activities';

export function useActivitiesSave() {
  // Salvar atividade no localStorage
  const saveActivity = useCallback((activityData: ActivityData): boolean => {
    try {
      // Obter atividades existentes
      const existingActivities = localStorage.getItem(ACTIVITIES_KEY);
      let activities: ActivityData[] = [];
      
      if (existingActivities) {
        activities = JSON.parse(existingActivities);
      }
      
      // Adicionar nova atividade no início da lista
      activities.unshift(activityData);
      
      // Salvar de volta no localStorage
      localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
      
      console.log('Atividade salva com sucesso:', activityData.title);
      return true;
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
      return false;
    }
  }, []);
  
  // Obter todas as atividades salvas
  const getAllActivities = useCallback((): ActivityData[] => {
    try {
      const saved = localStorage.getItem(ACTIVITIES_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
      return [];
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
      return [];
    }
  }, []);
  
  // Deletar uma atividade
  const deleteActivity = useCallback((activityId: string): boolean => {
    try {
      const activities = getAllActivities();
      const filteredActivities = activities.filter(activity => activity.id !== activityId);
      localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(filteredActivities));
      console.log('Atividade deletada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao deletar atividade:', error);
      return false;
    }
  }, [getAllActivities]);
  
  return {
    saveActivity,
    getAllActivities,
    deleteActivity
  };
}

export type { ActivityData };