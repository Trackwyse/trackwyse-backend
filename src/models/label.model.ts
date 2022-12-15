import mongoose from 'mongoose';
import validator from 'validator';

import config from '../config';

export interface LabelSchema extends Label, mongoose.Document {
  resetData: () => void;
}

const labelSchema = new mongoose.Schema<LabelSchema>(
  {
    activated: { type: Boolean, default: false },
    isLost: { type: Boolean, default: false },

    name: {
      type: String,
      minlength: 1,
      maxlength: 50,
    },
    color: {
      type: {
        bg: { type: String, required: true },
        borderSelected: { type: String, required: true },
        borderUnselected: { type: String, required: true },
      },
      required: false,
    },
    message: {
      type: String,
      minlength: 1,
      maxlength: 500,
    },
    phoneNumber: {
      type: String,
      minlength: 1,
      maxlength: 50,
      validate: [validator.isMobilePhone, 'Must be a valid phone number'],
    },

    foundNear: { type: String, required: false },
    foundDate: { type: Date, required: false },
    foundExactLocation: { type: String, required: false },
    foundRecoveryLocation: { type: String, required: false },
    foundRecoveryPossible: { type: Boolean, required: false },
    finderPhoneNumber: {
      type: String,
      minlength: 1,
      maxlength: 50,
      validate: [validator.isMobilePhone, 'Must be a valid phone number'],
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

labelSchema.methods.resetData = function () {
  this.activated = false;
  this.isLost = false;

  this.name = undefined;
  this.color = undefined;
  this.message = undefined;
  this.phoneNumber = undefined;

  this.foundNear = undefined;
  this.foundDate = undefined;
  this.foundExactLocation = undefined;
  this.foundRecoveryLocation = undefined;
  this.foundRecoveryPossible = undefined;
  this.finderPhoneNumber = undefined;

  this.createdAt = new Date();
  this.updatedAt = new Date();
};

export const Label = mongoose.model<LabelSchema>('Label', labelSchema);
