import validator from 'validator';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../config';

export interface UserSchema extends User, mongoose.Document {
  comparePassword: (password: string, next: any) => boolean;
  sanitize: () => SanitizedUser;
}

const userSchema = new mongoose.Schema<UserSchema>({
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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

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
userSchema.methods.comparePassword = function (password: string, next: any) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    if (err) return next(err);

    next(null, isMatch);
  });
};

userSchema.methods.sanitize = function () {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    verified: this.verified,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model<UserSchema>('User', userSchema);
