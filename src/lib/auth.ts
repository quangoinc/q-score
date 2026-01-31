import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const ALLOWED_DOMAIN = "quangoinc.com";
const ALLOWED_EMAILS = ["almondmil.kk4@gmail.com", "gageprod@gmail.com"];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Only allow @quangoinc.com emails or specific allowed emails
      const email = user.email;
      if (!email) return false;

      // Check if email is in the allowed list
      if (ALLOWED_EMAILS.includes(email.toLowerCase())) {
        return true;
      }

      // Check if email domain is allowed
      const domain = email.split("@")[1];
      if (domain !== ALLOWED_DOMAIN) {
        return false;
      }

      return true;
    },
    async session({ session }) {
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
