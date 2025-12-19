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
    <div className="rounded-xl border border-[var(--border)] bg-white/70 p-5 shadow-sm">
      <label className="block text-[var(--foreground)] font-medium mb-2">Nytt spørsmål</label>
      <textarea
        value={newQuestionText}
        onChange={(e) => onQuestionTextChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Skriv inn spørsmålet ditt..."
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:bg-white focus:outline-none resize-none mb-3"
        rows={3}
        autoFocus
      />
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-4 py-2"
        >
          Avbryt
        </button>
        <button
          onClick={onAdd}
          disabled={isAddingQuestion || !newQuestionText.trim()}
          className="rounded-lg border border-[var(--border)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--accent-muted)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isAddingQuestion ? 'Legger til...' : 'Legg til spørsmål'}
        </button>
      </div>
    </div>
  )
}
