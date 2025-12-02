interface QuestionInputProps {
  newQuestionText: string
  isAddingQuestion: boolean
  onQuestionTextChange: (text: string) => void
  onCancel: () => void
  onAdd: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
}

export function QuestionInput({
  newQuestionText,
  isAddingQuestion,
  onQuestionTextChange,
  onCancel,
  onAdd,
  onKeyDown,
}: QuestionInputProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <label className="block text-gray-800 font-medium mb-2">
        Nytt spørsmål
      </label>
      <textarea
        value={newQuestionText}
        onChange={(e) => onQuestionTextChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Skriv inn spørsmålet ditt..."
        className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg p-4 text-gray-800 focus:outline-none focus:border-gray-400 resize-none mb-3 shadow-sm"
        rows={3}
        autoFocus
      />
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-800 font-medium px-4 py-2"
        >
          Avbryt
        </button>
        <button
          onClick={onAdd}
          disabled={isAddingQuestion || !newQuestionText.trim()}
          className="bg-gray-800 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAddingQuestion ? 'Legger til...' : 'Legg til spørsmål'}
        </button>
      </div>
    </div>
  )
}
