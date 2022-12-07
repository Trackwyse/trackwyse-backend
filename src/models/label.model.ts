import mongoose from 'mongoose';
import validator from 'validator';

import config from '../config';

export interface LabelSchema extends Label, mongoose.Document {}

const labelSchema = new mongoose.Schema<LabelSchema>(
  {
    activated: { type: Boolean, required: true },
    isLost: { type: Boolean, required: true },

    name: {
      type: String,
      minlength: 1,
      maxlength: 50,
    },
    color: {
      type: String,
      minlength: 1,
      maxlength: 50,
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

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Label = mongoose.model<LabelSchema>('Label', labelSchema);
