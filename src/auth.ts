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
        await db.from('users').upsert({ id: user.id, discord_id: user.id, username: user.name, avatar: user.image }, { onConflict: 'id' });
        return true;
      }
      if (profile?.id) {
        const { error } = await db.from('users').upsert({ id: profile.id, discord_id: profile.id, username: user.name, avatar: user.image }, { onConflict: 'id' });
        if (error) {
          console.error("Erro ao salvar usuário no banco:", error);
        }
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
