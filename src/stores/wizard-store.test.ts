import { describe, it, expect, beforeEach } from "vitest";
import { useWizardStore } from "./wizard-store";

describe("WizardStore", () => {
  beforeEach(() => {
    useWizardStore.getState().clearProject();
  });

  it("should initialize with default state", () => {
    const state = useWizardStore.getState();

    expect(state.currentProjectId).toBeNull();
    expect(state.currentSectionIndex).toBe(0);
    expect(state.currentQuestionIndex).toBe(0);
    expect(state.answers).toEqual({});
    expect(state.aiSuggestions).toEqual({});
    expect(state.isLoading).toBe(false);
    expect(state.lastSavedAt).toBeNull();
  });

  it("should set current project", () => {
    useWizardStore.getState().setCurrentProject("project-123");

    expect(useWizardStore.getState().currentProjectId).toBe("project-123");
  });

  it("should navigate between sections", () => {
    const { setCurrentSection, nextSection, previousSection } = useWizardStore.getState();

    setCurrentSection(2);
    expect(useWizardStore.getState().currentSectionIndex).toBe(2);
    expect(useWizardStore.getState().currentQuestionIndex).toBe(0);

    nextSection();
    expect(useWizardStore.getState().currentSectionIndex).toBe(3);
    expect(useWizardStore.getState().currentQuestionIndex).toBe(0);

    previousSection();
    expect(useWizardStore.getState().currentSectionIndex).toBe(2);
    expect(useWizardStore.getState().currentQuestionIndex).toBe(0);
  });

  it("should navigate between questions", () => {
    const { setCurrentQuestion, nextQuestion, previousQuestion } = useWizardStore.getState();

    setCurrentQuestion(5);
    expect(useWizardStore.getState().currentQuestionIndex).toBe(5);

    nextQuestion();
    expect(useWizardStore.getState().currentQuestionIndex).toBe(6);

    previousQuestion();
    expect(useWizardStore.getState().currentQuestionIndex).toBe(5);

    useWizardStore.getState().setCurrentQuestion(0);
    previousQuestion();
    expect(useWizardStore.getState().currentQuestionIndex).toBe(0);
  });

  it("should save and retrieve answers", () => {
    const { saveAnswer, getAnswer } = useWizardStore.getState();

    saveAnswer("q1", "test answer");

    const answer = getAnswer("q1");
    expect(answer).toBeDefined();
    expect(answer?.questionId).toBe("q1");
    expect(answer?.answer).toBe("test answer");
    expect(answer?.answeredAt).toBeInstanceOf(Date);
    expect(useWizardStore.getState().lastSavedAt).toBeInstanceOf(Date);
  });

  it("should handle different answer types", () => {
    const { saveAnswer, getAnswer } = useWizardStore.getState();

    saveAnswer("q1", "string answer");
    saveAnswer("q2", ["option1", "option2"]);
    saveAnswer("q3", 42);
    saveAnswer("q4", true);

    expect(getAnswer("q1")?.answer).toBe("string answer");
    expect(getAnswer("q2")?.answer).toEqual(["option1", "option2"]);
    expect(getAnswer("q3")?.answer).toBe(42);
    expect(getAnswer("q4")?.answer).toBe(true);
  });

  it("should save and retrieve AI suggestions", () => {
    const { addAISuggestion, getAISuggestion } = useWizardStore.getState();

    addAISuggestion("q1", "AI suggested answer", 0.95);

    const suggestion = getAISuggestion("q1");
    expect(suggestion).toBeDefined();
    expect(suggestion?.questionId).toBe("q1");
    expect(suggestion?.suggestion).toBe("AI suggested answer");
    expect(suggestion?.confidence).toBe(0.95);
    expect(suggestion?.generatedAt).toBeInstanceOf(Date);
  });

  it("should set loading state", () => {
    const { setIsLoading } = useWizardStore.getState();

    setIsLoading(true);
    expect(useWizardStore.getState().isLoading).toBe(true);

    setIsLoading(false);
    expect(useWizardStore.getState().isLoading).toBe(false);
  });

  it("should reset wizard state", () => {
    const { setCurrentProject, saveAnswer, addAISuggestion, resetWizard } = useWizardStore.getState();

    setCurrentProject("project-123");
    saveAnswer("q1", "answer");
    addAISuggestion("q1", "suggestion", 0.8);

    resetWizard();

    const state = useWizardStore.getState();
    expect(state.currentProjectId).toBe("project-123");
    expect(state.currentSectionIndex).toBe(0);
    expect(state.currentQuestionIndex).toBe(0);
    expect(state.answers).toEqual({});
    expect(state.aiSuggestions).toEqual({});
    expect(state.lastSavedAt).toBeNull();
  });

  it("should clear entire project", () => {
    const { setCurrentProject, saveAnswer, clearProject } = useWizardStore.getState();

    setCurrentProject("project-123");
    saveAnswer("q1", "answer");

    clearProject();

    const state = useWizardStore.getState();
    expect(state.currentProjectId).toBeNull();
    expect(state.answers).toEqual({});
  });

  it("should prevent negative section index", () => {
    const { previousSection } = useWizardStore.getState();

    previousSection();
    expect(useWizardStore.getState().currentSectionIndex).toBe(0);
  });

  it("should prevent negative question index", () => {
    const { previousQuestion } = useWizardStore.getState();

    previousQuestion();
    expect(useWizardStore.getState().currentQuestionIndex).toBe(0);
  });
});
