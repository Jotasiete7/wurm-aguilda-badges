import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"
import db from "./lib/db"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Discord],
  callbacks: {
    async signIn({ user, profile }) {
      if (profile?.id) {
        const stmt = db.prepare('INSERT OR IGNORE INTO users (id, discord_id, username, avatar) VALUES (?, ?, ?, ?)');
        stmt.run(profile.id, profile.id, user.name, user.image);
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
