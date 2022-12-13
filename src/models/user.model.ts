import validator from 'validator';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

import config from '../config';

export interface UserSchema extends User, mongoose.Document {
  comparePassword: (password: string) => Promise<boolean>;
  generateVerificationToken: () => Promise<string>;
  generatePasswordResetToken: () => Promise<string>;
  sanitize: () => SanitizedUser;
}

const userSchema = new mongoose.Schema<UserSchema>(
  {
    firstName: {
      type: String,
      required: true,
      validate: [validator.isAlpha, 'Name must contain only letters'],
    },
    lastName: {
      type: String,
      required: true,
      validate: [validator.isAlpha, 'Name must contain only letters'],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [validator.isEmail, 'Must be a valid email'],
    },
    password: {
      type: String,
      required: true,
      min: [8, 'Password must be 8 characters or longer'],
      max: [128, 'Password must be 128 characters or less'],
    },
    verified: { type: Boolean, default: false },
    verificationToken: { type: String, required: false },
    verificationTokenExpires: { type: Date, required: false },
    passwordResetToken: { type: String, required: false },
    passwordResetTokenExpires: { type: Date, required: false },
    labels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Label' }],
    termsAccepted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Hash the password before saving
userSchema.pre('save', function (next) {
  let user = this;

  if (!user.isModified('password')) {
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

// Modify the error message for duplicate email
userSchema.post('save', function (err, doc, next) {
  if (err.name === 'MongoServerError' && err.code === 11000) {
    next(new Error('Email already exists'));
  } else {
    next(err);
  }
});

// Return whether the password hash matches the password
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  const isMatch = await bcrypt.compare(password, this.password);

  return isMatch;
};

// Generate a verification token and save it to the database
userSchema.methods.generateVerificationToken = async function (): Promise<string> {
  const token = crypto.randomInt(0, 1000000).toString();

  // Ensure that the number is 6 digits long by adding leading zeros if necessary
  const sixDigitNumber = token.padStart(6, '0');

  this.verificationToken = sixDigitNumber;
  this.verificationTokenExpires = new Date(Date.now() + config.TimeToVerify); // Time to verify in milliseconds

  await this.save();

  return sixDigitNumber;
};

// Generate a password reset token and save it to the database
userSchema.methods.generatePasswordResetToken = async function (): Promise<string> {
  const token = crypto.randomBytes(20).toString('hex');

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
    verified: this.verified,
    termsAccepted: this.termsAccepted,
    labels: this.labels,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model<UserSchema>('User', userSchema);
