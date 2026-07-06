import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  // OBRIGATÓRIO: Quando usamos Credentials com Prisma, a sessão deve ser via Token (JWT)
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // O 'user' só vem no momento exato em que o cara faz o login
      if (user) {
        token.roles = user.roles;
      }
      return token;
    },
    async session({ session, token }) {
      // Repassa os cargos do token invisível para a sessão do frontend
      if (session.user) {
        session.user.roles = token.roles;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login", 
  },
  pages: {
    signIn: "/login", 
  },
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // ADICIONANDO O LOGIN TRADICIONAL
    CredentialsProvider({
      name: "E-mail e Senha",
      credentials: {
        email: { label: "E-mail", type: "email", placeholder: "seu@email.com" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        // 1. Verifica se o usuário preencheu tudo
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Dados inválidos");
        }

        // 2. Busca o usuário no banco de dados
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        // 3. Se não achar, ou se o usuário só tiver login via Google/Discord (sem senha registrada)
        if (!user || !user.password) {
          throw new Error("Usuário não encontrado ou senha incorreta");
        }

        // 4. Compara a senha digitada com a senha criptografada do banco
        const passwordsMatch = await bcrypt.compare(credentials.password, user.password);

        if (!passwordsMatch) {
          throw new Error("Senha incorreta");
        }

        // 5. Se tudo der certo, retorna o usuário para a sessão
        return user;
      }
    })
  ],
  callbacks: {
    // Como mudamos para JWT, precisamos passar as 'roles' para o token primeiro...
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
      }
      return token;
    },
    // ...e depois do token para a sessão visual do site
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.roles = token.roles;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };