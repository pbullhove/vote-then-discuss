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
    <div className="rounded-xl border border-[var(--border)] bg-white/70 p-8 text-center shadow-sm">
      <p className="text-[var(--muted-foreground)] mb-4">
        Ingen spørsmål ennå. Legg til ditt første spørsmål!
      </p>
      <button
        onClick={onAddQuestionClick}
        className="rounded-lg border border-[var(--border)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--accent-muted)]"
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
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:bg-white focus:outline-none resize-none mb-3"
            rows={3}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={onCancelAddQuestion}
              className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-4 py-2"
            >
              Avbryt
            </button>
            <button
              onClick={onAddQuestion}
              disabled={isAddingQuestion || !newQuestionText.trim()}
              className="rounded-lg border border-[var(--border)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--accent-muted)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAddingQuestion ? 'Legger til...' : 'Legg til spørsmål'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
