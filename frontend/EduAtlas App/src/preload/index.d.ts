import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      checkHealth: () => Promise<boolean>
      googleAuth: () => Promise<any>
    }
  }
}
