import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import mongoose from "mongoose";
import dbConnect from "@/app/lib/mongoose";

// User model schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  image: String,
  createdAt: { type: Date, default: Date.now },
});

// Get User model (or create if it doesn't exist)
const User = mongoose.models.User || mongoose.model("User", UserSchema);

// Fallback secret for development - DO NOT USE IN PRODUCTION
const FALLBACK_SECRET = "development-secret-do-not-use-in-production";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          await dbConnect();

          // Find user with the email
          const user = await User.findOne({
            email: credentials?.email,
          });

          // Email Not found
          if (!user) {
            throw new Error("Email is not registered");
          }

          // Check password
          const isPasswordMatch = await compare(
            credentials!.password,
            user.password
          );

          // Incorrect password
          if (!isPasswordMatch) {
            throw new Error("Password is incorrect");
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  // Use environment variable or fallback to development secret
  secret: process.env.NEXTAUTH_SECRET || FALLBACK_SECRET,
});

export { handler as GET, handler as POST }; 