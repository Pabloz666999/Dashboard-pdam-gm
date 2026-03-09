export { default } from "next-auth/middleware"

export const config = {
  matcher: ["/((?!login|api|image|_next/static|_next/image|favicon.ico).*)"],
}