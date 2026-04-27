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
        await db.from('users').upsert(
          { id: user.id, discord_id: user.id, username: user.name, avatar: user.image },
          { onConflict: 'id' }
        );
        return true;
      }
      // For Discord: profile.id is the real Discord snowflake ID
      if (account?.provider === "discord" && profile?.id) {
        const discordId = String(profile.id);
        const { error } = await db.from('users').upsert(
          { id: discordId, discord_id: discordId, username: user.name, avatar: user.image },
          { onConflict: 'id' }
        );
        if (error) {
          console.error("Erro ao salvar usuário no banco:", error);
        }
      }
      return true;
    },

    // Store the Discord ID explicitly in the JWT token
    async jwt({ token, profile, account }) {
      if (account?.provider === "discord" && profile?.id) {
        token.discordId = String(profile.id);
        token.sub = String(profile.id); // Override sub with real Discord ID
      }
      return token;
    },

    // Expose the Discord ID on the session
    session({ session, token }) {
      if (session.user) {
        // Use our explicit discordId if available, otherwise fall back to sub
        session.user.id = (token.discordId as string) || token.sub || session.user.id;
      }
      return session;
    },
  },
})
