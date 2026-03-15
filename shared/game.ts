export interface AppInfo {
  name: string
  version: string
  platform: string
}

export interface GameApi {
  getAppInfo: () => Promise<AppInfo>
  toggleFullscreen: () => Promise<boolean>
}
