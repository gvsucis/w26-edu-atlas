import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  checkHealth: (): Promise<boolean> => ipcRenderer.invoke('check-health'),

  googleAuth: (): Promise<{
    access_token?: string
    refresh_token?: string
    id_token?: string
    token_type?: string
    scope?: string
    expiry_date?: number
  }> => ipcRenderer.invoke('google-auth'),

  saveGoogleDoc: (
    payload: { title: string; content: string }
  ): Promise<{
    documentId: string
    title: string
    url: string
  }> => ipcRenderer.invoke('google-save-doc', payload)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
