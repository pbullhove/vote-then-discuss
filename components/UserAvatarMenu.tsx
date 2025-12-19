'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'

type UserAvatarMenuProps = {
  user: User
  onSignOut: () => Promise<void>
}

export function UserAvatarMenu({ user, onSignOut }: UserAvatarMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const { displayName, avatarUrl, initials } = useMemo(() => {
    const metadata = (user.user_metadata || {}) as Record<string, string | undefined>
    const nameFromMetadata =
      metadata.name ||
      metadata.full_name ||
      metadata.fullName ||
      metadata.user_name ||
      metadata.preferred_username

    const derivedName = nameFromMetadata || user.email?.split('@')[0] || 'Bruker'
    const derivedAvatar = metadata.avatar_url || metadata.picture
    const derivedInitials =
      derivedName
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('')
        .slice(0, 2) || 'U'

    return {
      displayName: derivedName,
      avatarUrl: derivedAvatar,
      initials: derivedInitials,
    }
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleToggle = () => setIsOpen((prev) => !prev)

  const handleSignOut = async () => {
    setIsOpen(false)
    await onSignOut()
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/70 px-2 text-left shadow-sm transition hover:bg-[var(--muted)]"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <div className="relative h-8 w-8 overflow-hidden rounded-full bg-[var(--muted)] text-sm font-semibold text-[var(--foreground)]">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`Profilbilde for ${displayName}`}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">{initials}</div>
          )}
        </div>
        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-sm font-medium text-[var(--foreground)]">{displayName}</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl border border-[var(--border)] bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]"
          >
            Logg ut
          </button>
        </div>
      )}
    </div>
  )
}

