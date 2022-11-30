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
  firstName: string;
  lastName: string;
  email: string;
  verified: boolean;
  createdAt: Date;
}
