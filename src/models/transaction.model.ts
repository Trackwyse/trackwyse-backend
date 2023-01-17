/*
 * Created on Mon Jan 16 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import mongoose from "mongoose";

export interface TransactionSchema extends Transaction, mongoose.Document {}

const transactionSchema = new mongoose.Schema<TransactionSchema>(
  {
    transactionID: { type: String, required: true },
    created: { type: Date, required: true },
    status: { type: String, required: true },
    billingAddress: {
      type: {
        address1: { type: String, required: true },
        address2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip5: { type: String, required: true },
      },
      required: true,
    },
    shippingAddress: {
      type: {
        address1: { type: String, required: true },
        address2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip5: { type: String, required: true },
      },
      required: true,
    },
    items: [
      {
        name: String,
        quantity: Number,
      },
    ],

    events: [
      {
        date: Date,
        type: { type: String },
      },
    ],
    total: {
      type: {
        gross: { type: Number, required: true },
        net: { type: Number, required: true },
        tax: { type: Number, required: true },
      },
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<TransactionSchema>("Transaction", transactionSchema);
