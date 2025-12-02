interface EmptyQuestionsStateProps {
  showQuestionInput: boolean
  newQuestionText: string
  isAddingQuestion: boolean
  onAddQuestionClick: () => void
  onCancelAddQuestion: () => void
  onQuestionTextChange: (text: string) => void
  onAddQuestion: () => void
  onQuestionInputKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
}

export function EmptyQuestionsState({
  showQuestionInput,
  newQuestionText,
  isAddingQuestion,
  onAddQuestionClick,
  onCancelAddQuestion,
  onQuestionTextChange,
  onAddQuestion,
  onQuestionInputKeyDown,
}: EmptyQuestionsStateProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
      <p className="text-gray-600 mb-4">Ingen spørsmål ennå. Legg til ditt første spørsmål!</p>
      <button
        onClick={onAddQuestionClick}
        className="bg-gray-800 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
      >
        + Legg til spørsmål
      </button>
      {showQuestionInput && (
        <div className="mt-6 text-left">
          <textarea
            value={newQuestionText}
            onChange={(e) => onQuestionTextChange(e.target.value)}
            onKeyDown={onQuestionInputKeyDown}
            placeholder="Skriv inn spørsmålet ditt..."
            className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg p-4 text-gray-800 focus:outline-none focus:border-gray-400 resize-none mb-3 shadow-sm"
            rows={3}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={onCancelAddQuestion}
              className="text-gray-600 hover:text-gray-800 font-medium px-4 py-2"
            >
              Avbryt
            </button>
            <button
              onClick={onAddQuestion}
              disabled={isAddingQuestion || !newQuestionText.trim()}
              className="bg-gray-800 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingQuestion ? 'Legger til...' : 'Legg til spørsmål'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
