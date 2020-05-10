export interface OdlInstane {
  id: string
  name: string
  url: string
  remark?: string
  auth?: {
    username: string
    password: string
  }
}

export interface RestconfModuleInfo {
  name: string
  revision: string
  namespace: string
}