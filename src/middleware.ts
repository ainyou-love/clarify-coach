import { auth } from "@/lib/auth/auth"

export default auth((req) => {
  // Additional middleware logic can go here
  if (!req.auth && req.nextUrl.pathname !== "/auth/login") {
    return Response.redirect(new URL("/auth/login", req.url))
  }
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/practice/:path*",
    "/history/:path*",
    "/api/practice/:path*",
    "/api/user/:path*",
  ],
}