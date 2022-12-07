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
  passwordResetToken: string;
  passwordResetTokenExpires: Date;
  labels: string[];
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

interface Label {
  activated: boolean;
  isLost: boolean;

  name: string;
  color: string;
  message: string;
  phoneNumber: string;

  foundNear: string; // Based on IP address
  foundDate: Date; // When the label was found
  foundExactLocation: string; // Exact location of where the label was, if user provided it
  foundRecoveryLocation: string; // Where the user can recover the label, if user provided it
  foundRecoveryPossible: boolean; // If the user can recover the label

  createdAt: Date;
  updatedAt: Date;
}
