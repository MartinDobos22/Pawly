export interface AuthUser {
  uid: string;
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      appUserId?: string;
    }
  }
}
