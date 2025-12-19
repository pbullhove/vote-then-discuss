import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const nextParam = url.searchParams.get('next') ?? '/'
  // Prevent open redirects: only allow relative paths.
  const nextPath = nextParam.startsWith('/') ? nextParam : `/${nextParam}`

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
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
        return NextResponse.redirect(`${url.origin}${nextPath}`)
      }

      if (forwardedHost) {
        const proto = forwardedProto ?? 'https'
        return NextResponse.redirect(`${proto}://${forwardedHost}${nextPath}`)
      }

      return NextResponse.redirect(`${url.origin}${nextPath}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${url.origin}/auth/auth-code-error`)
}

