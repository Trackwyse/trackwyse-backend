/*
 * Created on Wed Jan 11 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import validator from "validator";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

import config from "@/config";
import saleor from "@/lib/saleor";

export interface UserSchema extends User, mongoose.Document {
  comparePassword: (password: string) => Promise<boolean>;
  compareRefreshToken: (refreshToken: string) => Promise<boolean>;
  generateVerificationToken: () => Promise<string>;
  generatePasswordResetToken: () => Promise<string>;
  sanitize: () => SanitizedUser;
}

const userSchema = new mongoose.Schema<UserSchema>(
  {
    firstName: {
      type: String,
      required: true,
      validate: [validator.isAlpha, "Name must contain only letters"],
    },
    lastName: {
      type: String,
      required: true,
      validate: [validator.isAlpha, "Name must contain only letters"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [validator.isEmail, "Must be a valid email"],
    },
    password: {
      type: String,
      required: true,
      min: [8, "Password must be 8 characters or longer"],
      max: [128, "Password must be 128 characters or less"],
    },
    address: {
      type: {
        isValid: { type: Boolean, required: false },
        address1: { type: String, required: false },
        address2: { type: String, required: false },
        city: { type: String, required: false },
        state: { type: String, required: false },
        zip5: { type: String, required: false },
      },
      required: false,
    },
    role: { type: String, default: "user" },

    customerID: { type: String, required: false },

    subscriptionDate: { type: Date, required: false },
    subscriptionActive: { type: Boolean, default: false },
    subscriptionReceipt: {
      type: {
        bundleId: { type: String, required: false },
        productId: { type: String, required: false },
        transactionId: { type: String, required: false },
        purchaseDate: { type: Number, required: false },
        quantity: { type: Number, required: false },
        expirationDate: { type: Number, required: false },
        isTrialPeriod: { type: Boolean, required: false },
        isIntroOfferPeriod: { type: Boolean, required: false },
        environment: { type: String, required: false },
        originalPurchaseDate: { type: Number, required: false },
        applicationVersion: { type: String, required: false },
        originalApplicationVersion: { type: String, required: false },
      },
      default: {},
    },
    subscriptionPerks: {
      type: {
        freeLabelsRedeemable: { type: Boolean, default: true },
        freeLabelsLastRedeemed: { type: Date, required: false },
        freeLabelsNextRedeemable: { type: Date, default: Date.now },
      },
      default: {},
    },

    verified: { type: Boolean, default: false },
    verificationToken: { type: String, required: false },
    verificationTokenExpires: { type: Date, required: false },

    passwordResetToken: { type: String, required: false },
    passwordResetTokenExpires: { type: Date, required: false },

    notificationsEnabled: { type: Boolean, default: false },
    notificationPushTokens: [{ type: String, required: false }],

    refreshToken: { type: String, required: false },

    termsAccepted: { type: Boolean, default: false },

    labels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Label", default: [] }],
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction", default: [] }],
  },
  { timestamps: true }
);

// Hash the password before saving
userSchema.pre("save", function (next) {
  let user = this;

  if (!user.isModified("password")) {
    return next();
  }

  bcrypt.genSalt(config.SaltFactor, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);

      user.password = hash;
      next();
    });
  });
});

// Hash the refresh token before saving
userSchema.pre("save", function (next) {
  let user = this;

  if (!user.isModified("refreshToken")) {
    return next();
  }

  // if the refresh token was deleted, don't hash it
  if (user.refreshToken === undefined) {
    return next();
  }

  bcrypt.genSalt(config.SaltFactor, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(user.refreshToken, salt, (err, hash) => {
      if (err) return next(err);

      user.refreshToken = hash;
      next();
    });
  });
});

// Update the saleor user when email is changed
userSchema.post("save", async function (err, doc, next) {
  let user = this;

  if (!user.isModified("email")) {
    return next();
  }

  if (user.customerID === undefined) {
    const customer = await saleor.CustomerCreate({
      input: {
        email: user.email,
      },
    });

    if (!customer.customerCreate.user) {
      return next(new Error("Failed to create customer"));
    }

    user.customerID = customer.customerCreate.user.id;

    return next();
  }

  const customer = await saleor.CustomerUpdate({
    id: user.customerID,
    input: {
      email: user.email,
    },
  });

  if (!customer.customerUpdate.user) {
    return next(new Error("Failed to update customer"));
  }

  next();
});

// Modify the error message for duplicate email
userSchema.post("save", function (err, doc, next) {
  if (err.name === "MongoServerError" && err.code === 11000) {
    next(new Error("Email already exists"));
  } else {
    next(err);
  }
});

// Return whether the password hash matches the password
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  const isMatch = await bcrypt.compare(password, this.password);

  return isMatch;
};

// Return whether the refresh token hash matches the refresh token
userSchema.methods.compareRefreshToken = async function (refreshToken: string): Promise<boolean> {
  const isMatch = await bcrypt.compare(refreshToken, this.refreshToken);

  return isMatch;
};

// Generate a verification token and save it to the database
userSchema.methods.generateVerificationToken = async function (): Promise<string> {
  const token = crypto.randomInt(0, 1000000).toString();

  // Ensure that the number is 6 digits long by adding leading zeros if necessary
  const sixDigitNumber = token.padStart(6, "0");

  this.verificationToken = sixDigitNumber;
  this.verificationTokenExpires = new Date(Date.now() + config.TimeToVerify); // Time to verify in milliseconds

  await this.save();

  return sixDigitNumber;
};

// Generate a password reset token and save it to the database
userSchema.methods.generatePasswordResetToken = async function (): Promise<string> {
  const token = crypto.randomInt(0, 1000000).toString();

  this.passwordResetToken = token;
  this.passwordResetTokenExpires = new Date(Date.now() + config.TimeToVerify); // Time to reset in milliseconds

  await this.save();

  return token;
};

// Return a sanitized version of the user
userSchema.methods.sanitize = function () {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    address: this.address,

    verified: this.verified,
    termsAccepted: this.termsAccepted,
    notificationsEnabled: this.notificationsEnabled,

    subscriptionActive: this.subscriptionActive,

    labels: this.labels,
    createdAt: this.createdAt,
  };
};

export default mongoose.model<UserSchema>("User", userSchema);
