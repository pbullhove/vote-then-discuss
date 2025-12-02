interface Answer {
  id: string
  answer_text: string
  user_id: string
}

interface AnswerCardProps {
  answer: Answer
  currentUserId: string
  submittedUserId: string
}

export function AnswerCard({ answer, currentUserId, submittedUserId }: AnswerCardProps) {
  const displayName = (() => {
    const userId = submittedUserId || currentUserId
    if (answer.user_id === userId) {
      return 'Deg'
    }
    if (answer.user_id.startsWith('anon_')) {
      const parts = answer.user_id.split('_')
      if (parts.length >= 3) {
        const name = parts.slice(1, -1).join('_')
        return name || 'Anonym'
      }
      return 'Anonym'
    }
    return `Bruker ${answer.user_id.slice(0, 8)}...`
  })()

  const isCurrentUser = (() => {
    const userId = submittedUserId || currentUserId
    return answer.user_id === userId
  })()

  return (
    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-gray-500 font-medium">{displayName}</span>
        {isCurrentUser && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Ditt svar
          </span>
        )}
      </div>
      <p className="text-gray-800">{answer.answer_text}</p>
    </div>
  )
}
