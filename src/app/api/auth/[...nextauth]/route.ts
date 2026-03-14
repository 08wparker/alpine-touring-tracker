import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const authOptions: NextAuthOptions = {
  providers: [
    {
      id: 'strava',
      name: 'Strava',
      type: 'oauth',
      authorization: {
        url: 'https://www.strava.com/oauth/authorize',
        params: {
          scope: 'read,activity:read_all',
          approval_prompt: 'auto',
        },
      },
      token: {
        url: 'https://www.strava.com/oauth/token',
        async request({ params, provider }) {
          const response = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: process.env.STRAVA_CLIENT_ID!,
              client_secret: process.env.STRAVA_CLIENT_SECRET!,
              code: params.code as string,
              grant_type: 'authorization_code',
            }),
          })
          const tokens = await response.json()
          if (!response.ok) {
            throw new Error(`Strava token error: ${JSON.stringify(tokens)}`)
          }
          return { tokens }
        },
      },
      userinfo: 'https://www.strava.com/api/v3/athlete',
      clientId: process.env.STRAVA_CLIENT_ID,
      clientSecret: process.env.STRAVA_CLIENT_SECRET,
      profile(profile: any) {
        return {
          id: profile.id.toString(),
          name: `${profile.firstname} ${profile.lastname}`,
          email: profile.email,
          image: profile.profile,
        }
      },
    },
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
        token.provider = account.provider
      }

      // Google tokens don't need Strava-style refresh
      if (token.provider === 'google') {
        return token
      }

      // Return token if not expired
      if (token.expiresAt && Date.now() < (token.expiresAt as number) * 1000) {
        return token
      }

      // Strava token expired — refresh it
      if (token.refreshToken) {
        try {
          const response = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client_id: process.env.STRAVA_CLIENT_ID,
              client_secret: process.env.STRAVA_CLIENT_SECRET,
              grant_type: 'refresh_token',
              refresh_token: token.refreshToken,
            }),
          })

          const refreshed = await response.json()

          if (!response.ok) throw refreshed

          token.accessToken = refreshed.access_token
          token.refreshToken = refreshed.refresh_token ?? token.refreshToken
          token.expiresAt = refreshed.expires_at
        } catch (error) {
          console.error('Error refreshing Strava token:', error)
          token.error = 'RefreshTokenError'
        }
      }

      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.provider = token.provider as string
      if (token.sub) {
        session.user = session.user || {}
        session.user.id = token.sub
        session.user.name = token.name as string
        session.user.image = token.picture as string
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
