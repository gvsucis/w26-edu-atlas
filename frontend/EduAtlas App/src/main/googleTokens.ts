import { app } from 'electron'
import { promises as fs } from 'node:fs'
import path from 'node:path'

export interface StoredGoogleTokens {
  access_token?: string
  refresh_token?: string
  scope?: string
  token_type?: string
  expiry_date?: number
  id_token?: string
}

function getTokenFilePath(): string {
  return path.join(app.getPath('userData'), 'google-tokens.json')
}

export async function saveGoogleTokens(tokens: StoredGoogleTokens): Promise<void> {
  const filePath = getTokenFilePath()

  let existing: StoredGoogleTokens = {}
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    existing = JSON.parse(raw) as StoredGoogleTokens
  } catch {
    existing = {}
  }

  const merged: StoredGoogleTokens = {
    ...existing,
    ...tokens,
    refresh_token: tokens.refresh_token ?? existing.refresh_token
  }

  await fs.writeFile(filePath, JSON.stringify(merged, null, 2), 'utf-8')
}

export async function getStoredGoogleTokens(): Promise<StoredGoogleTokens | null> {
  try {
    const raw = await fs.readFile(getTokenFilePath(), 'utf-8')
    return JSON.parse(raw) as StoredGoogleTokens
  } catch {
    return null
  }
}

export async function clearStoredGoogleTokens(): Promise<void> {
  try {
    await fs.unlink(getTokenFilePath())
  } catch {
  }
}