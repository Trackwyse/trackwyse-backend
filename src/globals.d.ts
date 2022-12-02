declare namespace Express {
  export interface Request {
    user?: SanitizedUser;
  }
}

interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  verified: boolean;
  verificationToken: string;
  verificationTokenExpires: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface SanitizedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  verified: boolean;
  createdAt: Date;
}
