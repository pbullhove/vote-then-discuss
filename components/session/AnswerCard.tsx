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
    <div className="rounded-lg border border-[var(--border)] bg-white/80 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <span className="block text-xs font-medium text-[var(--muted-foreground)]">
            {displayName}
          </span>
          <p className="mt-1 text-[var(--foreground)] whitespace-pre-wrap">{answer.answer_text}</p>
        </div>
        {isCurrentUser && (
          <span className="self-center rounded-full border border-[var(--border)] bg-[var(--muted)] px-2 py-1 text-xs font-medium text-[var(--foreground)]">
            Ditt svar
          </span>
        )}
      </div>
    </div>
  )
}
