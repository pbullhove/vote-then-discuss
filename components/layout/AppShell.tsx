'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

type AppShellProps = {
  title: string
  description?: string
  actions?: ReactNode
  userMenu?: ReactNode
  children: ReactNode
}

const navItems = [
  { href: '/workspace', label: 'Arbeidsområde' },
  { href: '/create-session', label: 'Ny økt' },
]

export function AppShell({ title, description, actions, userMenu, children }: AppShellProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex">
        <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col border-r border-[var(--border)] bg-white/80 backdrop-blur-md">
          <div className="px-5 py-6 border-b border-[var(--border)]">
            <div className="text-xs font-medium text-[var(--muted-foreground)]">Vote Then Discuss</div>
            <div className="mt-1 text-lg font-semibold">Arbeidsområde</div>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                    ? 'bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)]'
                    : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                    }`}
                >
                  <span>•</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
          <div className="px-4 py-4 border-t border-[var(--border)]">
            <div className="rounded-lg bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
              Hold rommet ditt ryddig og strukturert.
            </div>
          </div>
        </aside>

        <main className="flex-1 lg:pl-64">
          <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-white/80 backdrop-blur-md">
            <div className="px-4 sm:px-6 py-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    Vote Then Discuss
                  </div>
                  <h1 className="text-2xl font-semibold leading-snug truncate">{title}</h1>
                  {description ? (
                    <p className="text-sm text-[var(--muted-foreground)] mt-1 max-w-2xl">
                      {description}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  {actions}
                  {userMenu}
                </div>
              </div>
              <div className="flex items-center gap-2 lg:hidden overflow-x-auto pb-1">
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/' && pathname.startsWith(item.href))

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`whitespace-nowrap rounded-full border px-3 py-1 text-sm transition-colors ${isActive
                        ? 'border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)]'
                        : 'border-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
                        }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          </header>

          <div className="px-4 sm:px-6 py-6 space-y-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
