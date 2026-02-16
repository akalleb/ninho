function getBasePath() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return basePath && basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
}

function ensureConfig() {
  if (!process.env.NEXTAUTH_URL) {
    const basePath = getBasePath();
    process.env.NEXTAUTH_URL = basePath ? `http://localhost:3000${basePath}` : 'http://localhost:3000';
  } else {
    process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL.replace(/\/$/, '');
  }
}

async function getNextAuthHandler() {
  if (!process.env.NEXTAUTH_SECRET) {
    return null;
  }

  ensureConfig();

  const [{ default: NextAuth }, { default: CredentialsProvider }, { default: jwt }] = await Promise.all([
    import('next-auth'),
    import('next-auth/providers/credentials'),
    import('jsonwebtoken'),
  ]);

  const authOptions = {
    providers: [
      CredentialsProvider({
        name: 'Credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          return null;
        },
      }),
    ],
    session: {
      strategy: 'jwt',
      maxAge: 30 * 24 * 60 * 60,
    },
    jwt: {
      secret: process.env.NEXTAUTH_SECRET,
      maxAge: 30 * 24 * 60 * 60,
      async encode({ token, secret, maxAge }) {
        const jwtClaims = {
          id: token.id,
          email: token.email,
          name: token.name,
          role: token.role,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + maxAge,
        };
        return jwt.sign(jwtClaims, secret, { algorithm: 'HS256' });
      },
      async decode({ token, secret }) {
        return jwt.verify(token, secret, { algorithms: ['HS256'] });
      },
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.role = user.role;
        }
        return token;
      },
      async session({ session, token }) {
        if (token && session?.user) {
          session.user.id = token.id;
          session.user.email = token.email;
          session.user.name = token.name;
          session.user.role = token.role;
        }
        return session;
      },
    },
    pages: {
      signIn: '/auth',
      error: '/auth',
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
  };

  return NextAuth(authOptions);
}

export async function GET(request, context) {
  const handler = await getNextAuthHandler();
  if (!handler) {
    return new Response('NextAuth não configurado', { status: 501 });
  }
  return handler(request, context);
}

export async function POST(request, context) {
  const handler = await getNextAuthHandler();
  if (!handler) {
    return new Response('NextAuth não configurado', { status: 501 });
  }
  return handler(request, context);
}
