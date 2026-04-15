import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { getStoredGoogleTokens, saveGoogleTokens, type StoredGoogleTokens } from './googleTokens'

const CLIENT_ID = '804585601793-c72dr1hveps8mpemautd42as19fkegd7.apps.googleusercontent.com'
const CLIENT_SECRET = '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'

export interface SaveGoogleDocInput {
  title: string
  content: string
}

export interface SaveGoogleDocResult {
  documentId: string
  title: string
  url: string
}

function createOAuthClient(): OAuth2Client {
  return new OAuth2Client({
    clientId: CLIENT_ID,
    clientSecret : CLIENT_SECRET
  })
}

function normalizeGoogleTokens(tokens: {
  access_token?: string | null
  refresh_token?: string | null
  scope?: string | null
  token_type?: string | null
  id_token?: string | null
  expiry_date?: number | null
}): StoredGoogleTokens {
  return {
    access_token: tokens.access_token ?? undefined,
    refresh_token: tokens.refresh_token ?? undefined,
    scope: tokens.scope ?? undefined,
    token_type: tokens.token_type ?? undefined,
    id_token: tokens.id_token ?? undefined,
    expiry_date: tokens.expiry_date ?? undefined
  }
}

export async function saveContentAsGoogleDoc(
  input: SaveGoogleDocInput
): Promise<SaveGoogleDocResult> {
  const tokens = await getStoredGoogleTokens()

  if (!tokens) {
    throw new Error('No Google account is connected.')
  }

  const auth = createOAuthClient()
  auth.setCredentials(tokens)

  auth.on('tokens', async (newTokens) => {
    await saveGoogleTokens({
      ...normalizeGoogleTokens(tokens),
      ...normalizeGoogleTokens(newTokens),
      refresh_token: newTokens.refresh_token ?? tokens.refresh_token ?? undefined
    })
  })

  const docs = google.docs({
    version: 'v1',
    auth
  })

  const created = await docs.documents.create({
    requestBody: {
      title: input.title
    }
  })

  const documentId = created.data.documentId
  if (!documentId) {
    throw new Error('Google Docs did not return a document ID.')
  }

  await docs.documents.batchUpdate({
    documentId,
    requestBody: {
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: input.content
          }
        }
      ]
    }
  })

  return {
    documentId,
    title: input.title,
    url: `https://docs.google.com/document/d/${documentId}/edit`
  }
}