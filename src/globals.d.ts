/*
 * Created on Wed Jan 11 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

declare namespace Express {
  export interface Request {
    user?: SanitizedUser;
  }
}

type UserRole = "user" | "admin";

interface User {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  address: UserAddress;

  customerID: string; // Saleor customer ID
  checkoutID: string; // Saleor checkout ID

  subscriptionDate: Date;
  subscriptionActive: boolean;
  subscriptionReceipt: SubscriptionReceipt;
  subscriptionPerks: SubscriptionPerks;

  verified: boolean;
  verificationToken: string;
  verificationTokenExpires: Date;

  passwordResetToken: string;
  passwordResetTokenExpires: Date;

  notificationsEnabled: boolean;
  notificationPushTokens: string[];

  refreshToken: string;
  termsAccepted: boolean;

  labels: string[];

  createdAt: Date;
  updatedAt: Date;
}

interface SanitizedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  address: UserAddress;

  verified: boolean;
  termsAccepted: boolean;
  notificationsEnabled: boolean;

  subscriptionActive: boolean;

  labels: string[];
  createdAt: Date;
}

interface Label {
  owner: string;
  activated: boolean;
  isLost: boolean;
  uniqueID: string;

  name: string;
  color: Color;
  message: string;
  phoneNumber: string;

  foundNear: string; // Based on IP address
  foundDate: Date; // When the label was found
  foundExactLocation: LabelAddress; // Exact location of where the label was, if user provided it
  foundRecoveryLocation: LabelAddress; // Where the user can recover the label, if user provided it
  foundRecoveryPossible: boolean; // If the user can recover the label
  finderPhoneNumber: string; // Phone number of the person who found the label
  hasBeenNotified: boolean; // If the user has been notified of the label being found

  createdAt: Date;
  updatedAt: Date;
}

interface Color {
  bg: string;
  borderSelected: string;
  borderUnselected: string;
}

interface SubscriptionReceipt {
  bundleId: string;
  productId: string;
  transactionId: string;
  purchaseDate: number;
  quantity: number;
  expirationDate?: number;
  isTrialPeriod?: boolean;
  isIntroOfferPeriod?: boolean;
  environment?: string;
  originalPurchaseDate?: number;
  applicationVersion?: string;
  originalApplicationVersion?: string;
}

interface SubscriptionPerks {
  freeLabelsRedeemable: boolean;
  freeLabelsLastRedeemed: Date;
  freeLabelsNextRedeemable: Date;
}

interface Address {
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip5: string;
}

interface UserAddress extends Address {
  isValid: boolean;
}

interface LabelAddress extends Address {
  latitude: number;
  longitude: number;
}
