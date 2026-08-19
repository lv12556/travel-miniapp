declare namespace Express {
  export interface Request {
    auth?: {
      userId: number
      openid: string
      adminId?: number
      role?: 'super_admin' | 'editor'
    }
  }
}
