import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

/**
 * In-memory user store. In production this would be replaced with a
 * database (Postgres via the schema.sql already in this repo).
 * Passwords are bcrypt-hashed. This store persists for the lifetime
 * of the serverless function.
 */
interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  plan: string;
  createdAt: string;
}

// We use a global so it survives hot reloads in dev
const globalUsers = globalThis as unknown as {
  __landscout_users?: StoredUser[];
};
if (!globalUsers.__landscout_users) {
  globalUsers.__landscout_users = [];
}
const users = globalUsers.__landscout_users;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        action: { label: "Action", type: "text" },
        plan: { label: "Plan", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toLowerCase().trim();

        // --- SIGNUP ---
        if (credentials.action === "signup") {
          const exists = users.find((u) => u.email === email);
          if (exists) {
            throw new Error("An account with this email already exists");
          }

          const passwordHash = await bcrypt.hash(credentials.password, 12);
          const newUser: StoredUser = {
            id: crypto.randomUUID(),
            name: credentials.name || email.split("@")[0],
            email,
            passwordHash,
            plan: credentials.plan || "scout",
            createdAt: new Date().toISOString(),
          };
          users.push(newUser);

          return {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            plan: newUser.plan,
          } as { id: string; name: string; email: string; plan: string };
        }

        // --- LOGIN ---
        const user = users.find((u) => u.email === email);
        if (!user) {
          throw new Error("No account found with this email");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          plan: user.plan,
        } as { id: string; name: string; email: string; plan: string };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.plan = (user as { plan?: string }).plan ?? "scout";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { plan?: string }).plan = token.plan as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "landscout-dev-secret-change-in-production",
};
