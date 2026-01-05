import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const nextParam = url.searchParams.get('next') ?? '/'
  // Prevent open redirects: only allow relative paths.
  const nextPath = nextParam.startsWith('/') ? nextParam : `/${nextParam}`

  console.log('[auth] /auth/callback GET', {
    origin: url.origin,
    pathname: url.pathname,
    hasCode: Boolean(code),
    codeLength: code?.length ?? 0,
    nextParam,
    nextPath,
    hostHeader: request.headers.get('host'),
    forwardedHost: request.headers.get('x-forwarded-host'),
    forwardedProto: request.headers.get('x-forwarded-proto'),
  })

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    console.log('[auth] /auth/callback exchangeCodeForSession result', {
      hasError: Boolean(error),
      error: error ? { message: error.message, name: error.name, status: error.status } : null,
    })
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') // original host before load balancer
      const forwardedProto = request.headers.get('x-forwarded-proto')
      const host = request.headers.get('host') ?? url.host

      // Always redirect back to localhost when running locally, even if a proxy
      // provides a prod x-forwarded-host.
      const isLocalHost =
        host === 'localhost' ||
        host.startsWith('localhost:') ||
        host === '127.0.0.1' ||
        host.startsWith('127.0.0.1:') ||
        host === '0.0.0.0' ||
        host.startsWith('0.0.0.0:') ||
        host === '[::1]' ||
        host.startsWith('[::1]:') ||
        host.endsWith('.localhost')

      if (isLocalHost) {
        const destination = `${url.origin}${nextPath}`
        console.log('[auth] /auth/callback redirect (localhost)', { host, destination })
        return NextResponse.redirect(destination)
      }

      if (forwardedHost) {
        const proto = forwardedProto ?? 'https'
        const destination = `${proto}://${forwardedHost}${nextPath}`
        console.log('[auth] /auth/callback redirect (forwardedHost)', {
          host,
          forwardedHost,
          forwardedProto,
          destination,
        })
        return NextResponse.redirect(destination)
      }

      const destination = `${url.origin}${nextPath}`
      console.log('[auth] /auth/callback redirect (default)', { host, destination })
      return NextResponse.redirect(destination)
    }
  }

  // return the user to an error page with instructions
  console.warn('[auth] /auth/callback missing code or exchange failed; redirecting to error', {
    origin: url.origin,
  })
  return NextResponse.redirect(`${url.origin}/auth/auth-code-error`)
}

