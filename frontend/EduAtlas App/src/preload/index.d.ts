import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      checkHealth: () => Promise<boolean>
      googleAuth: () => Promise<{
        access_token?: string
        refresh_token?: string
        id_token?: string
        token_type?: string
        scope?: string
        expiry_date?: number
      }>
      saveGoogleDoc: (payload: {
        title: string
        content: string
      }) => Promise<{
        documentId: string
        title: string
        url: string
      }>
    }
  }
}
