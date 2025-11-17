import { auth } from '@/auth'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // Protected routes
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')
  const isAuthRoute = pathname.startsWith('/auth')

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL('/auth/login', req.url))
  }

  // Redirect to dashboard if accessing auth pages while logged in
  if (isAuthRoute && isLoggedIn) {
    return Response.redirect(new URL('/dashboard', req.url))
  }

  // Admin route protection
  if (pathname.startsWith('/admin') && req.auth?.user?.role !== 'admin') {
    return Response.redirect(new URL('/dashboard', req.url))
  }
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|resultados).*)',
  ],
}
