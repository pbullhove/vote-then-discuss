interface QuestionCardProps {
  questionNumber: number
  questionText: string
  answer: string
  onAnswerChange: (value: string) => void
}

export function QuestionCard({
  questionNumber,
  questionText,
  answer,
  onAnswerChange,
}: QuestionCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <label className="block text-gray-800 font-medium mb-2">
        Spørsmål {questionNumber}
      </label>
      <p className="text-gray-700 mb-4">{questionText}</p>
      <textarea
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Skriv svaret ditt her..."
        className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg p-4 text-gray-800 focus:outline-none focus:border-gray-400 resize-none shadow-sm"
        rows={4}
      />
    </div>
  )
}
