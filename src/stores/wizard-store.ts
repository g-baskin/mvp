import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface QuestionAnswer {
  questionId: string;
  answer: string | string[] | number | boolean;
  answeredAt: Date;
}

export interface AISuggestion {
  questionId: string;
  suggestion: string;
  confidence: number;
  generatedAt: Date;
}

export interface WizardState {
  currentProjectId: string | null;
  currentSectionIndex: number;
  currentQuestionIndex: number;
  answers: Record<string, QuestionAnswer>;
  aiSuggestions: Record<string, AISuggestion>;
  isLoading: boolean;
  lastSavedAt: Date | null;
}

export interface WizardActions {
  setCurrentProject: (projectId: string) => void;
  setCurrentSection: (sectionIndex: number) => void;
  setCurrentQuestion: (questionIndex: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  nextSection: () => void;
  previousSection: () => void;
  saveAnswer: (questionId: string, answer: QuestionAnswer["answer"]) => void;
  getAnswer: (questionId: string) => QuestionAnswer | undefined;
  addAISuggestion: (questionId: string, suggestion: string, confidence: number) => void;
  getAISuggestion: (questionId: string) => AISuggestion | undefined;
  setIsLoading: (isLoading: boolean) => void;
  resetWizard: () => void;
  clearProject: () => void;
}

export type WizardStore = WizardState & WizardActions;

const initialState: WizardState = {
  currentProjectId: null,
  currentSectionIndex: 0,
  currentQuestionIndex: 0,
  answers: {},
  aiSuggestions: {},
  isLoading: false,
  lastSavedAt: null,
};

export const useWizardStore = create<WizardStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentProject: (projectId: string) => {
        set({ currentProjectId: projectId });
      },

      setCurrentSection: (sectionIndex: number) => {
        set({
          currentSectionIndex: sectionIndex,
          currentQuestionIndex: 0,
        });
      },

      setCurrentQuestion: (questionIndex: number) => {
        set({ currentQuestionIndex: questionIndex });
      },

      nextQuestion: () => {
        set((state) => ({
          currentQuestionIndex: state.currentQuestionIndex + 1,
        }));
      },

      previousQuestion: () => {
        set((state) => ({
          currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1),
        }));
      },

      nextSection: () => {
        set((state) => ({
          currentSectionIndex: state.currentSectionIndex + 1,
          currentQuestionIndex: 0,
        }));
      },

      previousSection: () => {
        set((state) => ({
          currentSectionIndex: Math.max(0, state.currentSectionIndex - 1),
          currentQuestionIndex: 0,
        }));
      },

      saveAnswer: (questionId: string, answer: QuestionAnswer["answer"]) => {
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: {
              questionId,
              answer,
              answeredAt: new Date(),
            },
          },
          lastSavedAt: new Date(),
        }));
      },

      getAnswer: (questionId: string) => {
        return get().answers[questionId];
      },

      addAISuggestion: (questionId: string, suggestion: string, confidence: number) => {
        set((state) => ({
          aiSuggestions: {
            ...state.aiSuggestions,
            [questionId]: {
              questionId,
              suggestion,
              confidence,
              generatedAt: new Date(),
            },
          },
        }));
      },

      getAISuggestion: (questionId: string) => {
        return get().aiSuggestions[questionId];
      },

      setIsLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      resetWizard: () => {
        set({
          currentSectionIndex: 0,
          currentQuestionIndex: 0,
          answers: {},
          aiSuggestions: {},
          isLoading: false,
          lastSavedAt: null,
        });
      },

      clearProject: () => {
        set(initialState);
      },
    }),
    {
      name: "wizard-storage",
      partialize: (state) => ({
        currentProjectId: state.currentProjectId,
        currentSectionIndex: state.currentSectionIndex,
        currentQuestionIndex: state.currentQuestionIndex,
        answers: state.answers,
        aiSuggestions: state.aiSuggestions,
        lastSavedAt: state.lastSavedAt,
      }),
    }
  )
);
