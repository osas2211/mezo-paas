import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Add all routes inside the (in-app) directory that should be protected
const protectedRoutes = [
  "/dashboard",
  "/settings",
  "/billing",
  "/deployments",
  "/domains",
  "/integrations",
  "/projects",
]

const authRoutes = ["/login", "/sign-up"]

function isTokenExpired(token: string) {
  try {
    const payloadBase64 = token.split(".")[1]
    const decodedPayload = JSON.parse(atob(payloadBase64))
    const exp = decodedPayload.exp
    if (!exp) return false
    const now = Math.floor(Date.now() / 1000)
    return now >= exp
  } catch (error) {
    return true
  }
}

export default function middleware(request: NextRequest) {
  // Retrieve the access token from cookies
  const token = request.cookies.get("access_token")?.value
  const isExpired = token ? isTokenExpired(token) : true
  const { pathname } = request.nextUrl

  // Check if it's an auth route (e.g. /login, /sign-up)
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )

  // Redirect to dashboard if logged in and token is valid
  if (isAuthRoute && token && !isExpired) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )

  // Redirect to login if accessing a protected route without a token or if expired
  if (isProtectedRoute && (isExpired || !token)) {
    const response = NextResponse.redirect(new URL("/login", request.url))
    if (token) {
      response.cookies.delete("access_token")
    }
    return response
  }

  const response = NextResponse.next()

  // Prevent caching for protected routes to ensure middleware runs on back button
  if (isProtectedRoute) {
    response.headers.set(
      "Cache-Control",
      "no-store, max-age=0, must-revalidate",
    )
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
