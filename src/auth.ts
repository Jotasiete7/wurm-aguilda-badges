import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"
import Credentials from "next-auth/providers/credentials"
import db from "./lib/db"

const isDev = process.env.NODE_ENV === 'development';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Discord,
    // DEV ONLY — removed automatically in production
    ...(isDev ? [Credentials({
      id: "teste_local",
      name: "Bypass Local",
      credentials: {},
      async authorize() {
        return { id: "dev_admin_123", name: "Administrador (Local)", image: "https://i.imgur.com/6M3h1q1.png" }
      }
    })] : []),
  ],
  callbacks: {
    async signIn({ user, profile, account }) {
      if (account?.provider === "teste_local") {
        db.prepare('INSERT OR IGNORE INTO users (id, discord_id, username, avatar) VALUES (?, ?, ?, ?)')
          .run(user.id, user.id, user.name, user.image);
        return true;
      }
      if (profile?.id) {
        db.prepare('INSERT OR IGNORE INTO users (id, discord_id, username, avatar) VALUES (?, ?, ?, ?)')
          .run(profile.id, profile.id, user.name, user.image);
      }
      return true;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
})
