import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import jwt from 'jsonwebtoken';

/**
 * Get base path from environment variable
 * @returns {string} Base path without trailing slash
 */
function getBasePath() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return basePath && basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
}

/**
 * Get full URL with base path
 * @param {string} path - Path to append
 * @returns {string} Full URL
 */
function getFullUrl(path) {
  const basePath = getBasePath();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return basePath ? `${basePath}${cleanPath}` : cleanPath;
}

/**
 * Validate NextAuth configuration
 * IMPORTANT: This must run BEFORE authOptions is created, as NextAuth reads
 * environment variables during initialization. Setting them here ensures
 * they're available when NextAuth initializes.
 */
function validateConfig() {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error(
      'NEXTAUTH_SECRET is not set. Please add it to your .env.local file.\n' +
      'Generate one using: openssl rand -base64 32'
    );
  }
  
  // Set NEXTAUTH_URL if not already set
  // CRITICAL: This must be set BEFORE NextAuth initializes, otherwise
  // NextAuth won't be able to set cookies correctly
  if (!process.env.NEXTAUTH_URL) {
    const basePath = getBasePath();
    // Always set a default URL - NextAuth needs this to set cookies correctly
    const defaultUrl = basePath 
      ? `http://localhost:3000${basePath}`
      : 'http://localhost:3000';
    
    console.warn(
      `⚠️  NEXTAUTH_URL is not set in .env.local. Using default: ${defaultUrl}\n` +
      '   For production, please add NEXTAUTH_URL to your .env.local file.\n' +
      `   Example: NEXTAUTH_URL=${defaultUrl}`
    );
    
    // CRITICAL: Set NEXTAUTH_URL before NextAuth initializes
    // This must be done here, before authOptions is created
    process.env.NEXTAUTH_URL = defaultUrl;
  } else {
    // Ensure NEXTAUTH_URL doesn't have trailing slash (can cause issues)
    process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL.replace(/\/$/, '');
  }
  
}

// Validate configuration BEFORE creating authOptions
// This ensures environment variables are set before NextAuth initializes
validateConfig();

/**
 * NextAuth configuration with JWT strategy
 * This handles authentication using email/password credentials
 * Configured to work with base path
 */
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'name@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide both email and password');
        }

        // TODO: Replace this with actual database/user validation
        // For now, this is a demo implementation
        // In production, you should:
        // 1. Query your database to find the user by email
        // 2. Verify the password (using bcrypt or similar)
        // 3. Return user object if valid, null if invalid

        // Example validation (replace with your actual user validation logic)
        const validUsers = [
          { id: '1', email: 'admin@example.com', password: '123456', name: 'Admin User', role: 'admin' },
          { id: '2', email: 'user@example.com', password: '123456', name: 'Regular User', role: 'user' },
        ];

        const user = validUsers.find(
          (u) => u.email === credentials.email && u.password === credentials.password
        );

        if (user) {
          // Return user object (password will not be included in JWT)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }

        // Return null if user data could not be retrieved
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    async encode({ token, secret, maxAge }) {
      const jwtClaims = {
        id: token.id,
        email: token.email,
        name: token.name,
        role: token.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + maxAge,
      };
      const encodedToken = jwt.sign(jwtClaims, secret, { algorithm: 'HS256' });
      return encodedToken;
    },
    async decode({ token, secret }) {
      const decodedToken = jwt.verify(token, secret, { algorithms: ['HS256'] });
      return decodedToken;
    },
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    // Use relative paths - NextAuth will automatically handle paths correctly
    // When basePath is empty, these work at root level
    // When basePath is set, NextAuth uses NEXTAUTH_URL to construct correct paths
    signIn: '/auth',
    error: '/auth',
  },
  // Explicitly configure cookies to ensure they work at root level
  // This is critical when basePath is empty - NextAuth needs explicit cookie configuration
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/', // Explicitly set to root path - critical for root level deployment
        secure: process.env.NODE_ENV === 'production',
        // Don't set domain - let browser handle it (localhost works without explicit domain)
      },
    },
    callbackUrl: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Host-' : ''}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  // Ensure NEXTAUTH_URL is set correctly
  // When basePath is empty: NEXTAUTH_URL=http://localhost:3000
  // When basePath is set: NEXTAUTH_URL=http://localhost:3000/basepath
  // NextAuth uses this to generate correct callback URLs and set cookies with correct paths
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

