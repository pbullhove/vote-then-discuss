import { AnswerCard } from './AnswerCard'

interface Question {
  id: string
  question_text: string
  question_order: number
}

interface Answer {
  id: string
  answer_text: string
  user_id: string
}

interface AnswersViewProps {
  questions: Question[]
  submittedAnswers: Record<string, Answer[]>
  currentUserId: string
  submittedUserId: string
}

export function AnswersView({
  questions,
  submittedAnswers,
  currentUserId,
  submittedUserId,
}: AnswersViewProps) {
  return (
    <>
      {questions.map((question, index) => {
        const questionAnswers = submittedAnswers[question.id] || []
        return (
          <div key={question.id} className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Spørsmål {index + 1}: {question.question_text}
            </h3>
            <div className="space-y-3">
              {questionAnswers.length === 0 ? (
                <p className="text-gray-500 italic">Ingen svar ennå.</p>
              ) : (
                questionAnswers.map((answer) => (
                  <AnswerCard
                    key={answer.id}
                    answer={answer}
                    currentUserId={currentUserId}
                    submittedUserId={submittedUserId}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </>
  )
}
