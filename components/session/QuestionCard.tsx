interface QuestionCardProps {
  questionText: string
  answer: string
  onAnswerChange: (value: string) => void
}

export function QuestionCard({ questionText, answer, onAnswerChange }: QuestionCardProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white/70 p-5 shadow-sm">
      <p className="block font-medium text-[var(--foreground)] mb-3">{questionText}</p>
      <textarea
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Skriv svaret ditt her..."
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:bg-white focus:outline-none"
        rows={4}
      />
    </div>
  )
}
