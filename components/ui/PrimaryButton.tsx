import type { ButtonHTMLAttributes, DetailedHTMLProps } from 'react'

export const primaryButtonClass =
  'rounded-lg border border-[var(--border)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--accent-muted)] disabled:cursor-not-allowed disabled:opacity-60'

export const darkButtonClass =
  'rounded-lg border border-[var(--border)] bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60'

type PrimaryButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  className?: string
}

export function PrimaryButton({ className, ...props }: PrimaryButtonProps) {
  const mergedClassName = className ? `${primaryButtonClass} ${className}` : primaryButtonClass
  return <button className={mergedClassName} {...props} />
}
