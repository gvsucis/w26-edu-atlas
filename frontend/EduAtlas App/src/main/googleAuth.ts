import http from 'node:http'
import crypto from 'node:crypto'
import { URL } from 'node:url'
import { shell } from 'electron'
import { saveGoogleTokens, type StoredGoogleTokens } from './googleTokens'

const CLIENT_ID = '804585601793-c72dr1hveps8mpemautd42as19fkegd7.apps.googleusercontent.com'
const CLIENT_SECRET = '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'
const SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/drive.file'
]

function base64url(buffer: Buffer): string {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function createPKCE() {
  const verifier = base64url(crypto.randomBytes(64))
  const challenge = base64url(
    crypto.createHash('sha256').update(verifier).digest()
  )
  return { verifier, challenge }
}

function createState() {
  return base64url(crypto.randomBytes(24))
}

export async function startGoogleOAuth(): Promise<StoredGoogleTokens> {
  return await new Promise((resolve, reject) => {
    const server = http.createServer()

    server.listen(0, '127.0.0.1', async () => {
      const address = server.address()
      if (!address || typeof address === 'string') {
        reject(new Error('Failed to bind local OAuth callback server'))
        return
      }

      const redirectUri = `http://127.0.0.1:${address.port}`
      const { verifier, challenge } = createPKCE()
      const state = createState()

      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      authUrl.searchParams.set('client_id', CLIENT_ID)
      authUrl.searchParams.set('redirect_uri', redirectUri)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('scope', SCOPES.join(' '))
      authUrl.searchParams.set('access_type', 'offline')
      authUrl.searchParams.set('prompt', 'consent')
      authUrl.searchParams.set('state', state)
      authUrl.searchParams.set('code_challenge', challenge)
      authUrl.searchParams.set('code_challenge_method', 'S256')

      server.on('request', async (req, res) => {
        try {
          if (!req.url) {
            throw new Error('Missing callback URL.')
          }

          const callbackUrl = new URL(req.url, redirectUri)
          const code = callbackUrl.searchParams.get('code')
          const returnedState = callbackUrl.searchParams.get('state')
          const oauthError = callbackUrl.searchParams.get('error')

          if (oauthError) {
            throw new Error(`Google OAuth error: ${oauthError}`)
          }

          if (!code || returnedState !== state) {
            throw new Error('Invalid OAuth callback or state mismatch.')
          }

          const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              client_id: CLIENT_ID,
              client_secret: CLIENT_SECRET,
              code,
              code_verifier: verifier,
              grant_type: 'authorization_code',
              redirect_uri: redirectUri
            })
          })

          console.log('OAuth CLIENT_ID:', CLIENT_ID)
          console.log('OAuth SCOPES:', SCOPES)
          console.log('OAuth redirect URI:', redirectUri)

          if (!tokenRes.ok) {
            const text = await tokenRes.text()
            console.error('Token exchange failed response:', text)
            console.error('Token exchange failed for CLIENT_ID:', CLIENT_ID)
            throw new Error(`Token exchange failed: ${text}`)
            }

          const tokens = (await tokenRes.json()) as StoredGoogleTokens

          await saveGoogleTokens(tokens)

          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end('<h2>Google connected successfully. You can close this window.</h2>')

          server.close()
          resolve(tokens)
        } catch (error) {
          try {
            res.writeHead(500, { 'Content-Type': 'text/html' })
            res.end('<h2>Google OAuth failed. You can close this window.</h2>')
          } catch {
            // no-op
          }

          server.close()
          reject(error)
        }
      })

      await shell.openExternal(authUrl.toString())
    })

    server.on('error', reject)
  })
}