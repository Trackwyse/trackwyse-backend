/*
 * Created on Wed Jan 11 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import mongoose from "mongoose";
import validator from "validator";

export interface LabelSchema extends Label, mongoose.Document {
  resetData: () => void;
  removeLostData: () => void;
}

const labelSchema = new mongoose.Schema<LabelSchema>(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" } as any,
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
      validate: [validator.isMobilePhone, "Must be a valid phone number"],
    },

    foundNear: { type: String, required: false },
    foundDate: { type: Date, required: false },
    foundExactLocation: {
      type: {
        isValid: { type: Boolean, required: false },
        address1: { type: String, required: false },
        address2: { type: String, required: false },
        city: { type: String, required: false },
        state: { type: String, required: false },
        zip5: { type: String, required: false },
        latitude: { type: Number, required: false },
        longitude: { type: Number, required: false },
      },
      required: false,
    },
    foundRecoveryLocation: {
      type: {
        isValid: { type: Boolean, required: false },
        address1: { type: String, required: false },
        address2: { type: String, required: false },
        city: { type: String, required: false },
        state: { type: String, required: false },
        zip5: { type: String, required: false },
        latitude: { type: Number, required: false },
        longitude: { type: Number, required: false },
      },
      required: false,
    },
    foundRecoveryPossible: { type: Boolean, required: false },
    finderPhoneNumber: {
      type: String,
      minlength: 1,
      maxlength: 50,
      validate: [validator.isMobilePhone, "Must be a valid phone number"],
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

labelSchema.methods.resetData = function () {
  this.owner = undefined;
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

labelSchema.methods.removeLostData = function () {
  this.isLost = false;

  this.foundNear = undefined;
  this.foundDate = undefined;
  this.foundExactLocation = undefined;
  this.foundRecoveryLocation = undefined;
  this.foundRecoveryPossible = undefined;
  this.finderPhoneNumber = undefined;
};

export default mongoose.model<LabelSchema>("Label", labelSchema);
