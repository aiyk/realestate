import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible portion of the Auth.js config.
 * Providers are intentionally empty here; the full config in lib/auth.ts
 * adds the Credentials provider (which needs bcrypt + Prisma, both Node-only).
 *
 * Middleware imports THIS file so it can run on the Edge runtime.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  providers: [],
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth: session, request }) {
      const { pathname } = request.nextUrl;
      const isAuthed = !!session?.user;
      const gated = ["/account", "/checkout", "/admin", "/agent"];
      if (gated.some((p) => pathname.startsWith(p))) return isAuthed;
      return true;
    },
  },
} satisfies NextAuthConfig;
