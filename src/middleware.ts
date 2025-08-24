import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can go here
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/login",
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/practice/:path*",
    "/history/:path*",
    "/api/practice/:path*",
    "/api/user/:path*",
  ],
}