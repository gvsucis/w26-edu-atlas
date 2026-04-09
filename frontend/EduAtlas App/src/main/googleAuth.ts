import http from 'node:http'
import crypto from 'node:crypto'
import { URL } from 'node:url'
import { shell } from 'electron'

const CLIENT_ID = '804585601793-c72dr1hveps8mpemautd42as19fkegd7.apps.googleusercontent.com'
const SCOPES = ['https://www.googleapis.com/auth/drive.file']

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

export async function startGoogleOAuth(): Promise<any> {
  return new Promise((resolve, reject) => {
    const server = http.createServer()

    server.listen(0, '127.0.0.1', async () => {
      const address = server.address()
      if (!address || typeof address === 'string') {
        reject(new Error('Failed to bind server'))
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
          const callbackUrl = new URL(req.url!, redirectUri)

          const code = callbackUrl.searchParams.get('code')
          const returnedState = callbackUrl.searchParams.get('state')

          if (!code || returnedState !== state) {
            throw new Error('Invalid OAuth response')
          }

          const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: CLIENT_ID,
              code,
              code_verifier: verifier,
              grant_type: 'authorization_code',
              redirect_uri: redirectUri
            })
          })

          const tokens = await tokenRes.json()

          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end('<h2>Google connected! You can close this.</h2>')

          server.close()
          resolve(tokens)

        } catch (err) {
          res.writeHead(500)
          res.end('OAuth failed')
          server.close()
          reject(err)
        }
      })

      await shell.openExternal(authUrl.toString())
    })
  })
}