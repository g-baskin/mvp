import { useWizardStore } from "./wizard-store";

export function WizardExample() {
  const {
    currentProjectId,
    currentSectionIndex,
    currentQuestionIndex,
    answers,
    isLoading,
    setCurrentProject,
    nextQuestion,
    previousQuestion,
    saveAnswer,
    getAnswer,
    addAISuggestion,
    getAISuggestion,
  } = useWizardStore();

  const handleStartProject = () => {
    setCurrentProject("project-123");
  };

  const handleAnswerQuestion = (questionId: string, answer: string) => {
    saveAnswer(questionId, answer);
    nextQuestion();
  };

  const handlePreviousQuestion = () => {
    previousQuestion();
  };

  const handleAISuggestion = (questionId: string) => {
    addAISuggestion(questionId, "AI generated suggestion", 0.95);
  };

  const currentAnswer = getAnswer("q1");
  const suggestion = getAISuggestion("q1");

  return (
    <div>
      <h1>Wizard Example</h1>
      <p>Project: {currentProjectId}</p>
      <p>Section: {currentSectionIndex}</p>
      <p>Question: {currentQuestionIndex}</p>
      <p>Total Answers: {Object.keys(answers).length}</p>
      <p>Loading: {isLoading ? "Yes" : "No"}</p>

      <button onClick={handleStartProject}>Start Project</button>
      <button onClick={() => handleAnswerQuestion("q1", "My answer")}>
        Answer Question
      </button>
      <button onClick={handlePreviousQuestion}>Previous Question</button>
      <button onClick={() => handleAISuggestion("q1")}>Get AI Suggestion</button>

      {currentAnswer && (
        <div>
          <h2>Current Answer</h2>
          <p>{currentAnswer.answer}</p>
        </div>
      )}

      {suggestion && (
        <div>
          <h2>AI Suggestion</h2>
          <p>{suggestion.suggestion}</p>
          <p>Confidence: {suggestion.confidence}</p>
        </div>
      )}
    </div>
  );
}
