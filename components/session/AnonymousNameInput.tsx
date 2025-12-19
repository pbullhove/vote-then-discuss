interface AnonymousNameInputProps {
  anonymousUserName: string
  onNameChange: (name: string) => void
}

export function AnonymousNameInput({
  anonymousUserName,
  onNameChange,
}: AnonymousNameInputProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white/70 p-5 shadow-sm">
      <label className="block font-medium text-[var(--foreground)] mb-2">
        Ditt navn <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={anonymousUserName}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Skriv inn navnet ditt..."
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:bg-white focus:outline-none shadow-sm"
      />
      <p className="text-sm text-[var(--muted-foreground)] mt-2">
        Navnet ditt vil bli vist sammen med svarene dine.
      </p>
    </div>
  )
}
