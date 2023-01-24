/*
 * Created on Tue Jan 24 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import { UserOrderDetailsQuery, CheckoutCreateInput } from "@/graphql/generated/api";
import { toTitleCase } from "./string";

export const formatTransaction = (transaction: UserOrderDetailsQuery) => {
  return {
    ...transaction.order,
    billingAddress: {
      address1: transaction.order.billingAddress?.streetAddress1,
      address2: transaction.order.billingAddress?.streetAddress2,
      city: toTitleCase(transaction.order.billingAddress?.city),
      state: transaction.order.billingAddress?.countryArea,
      zip5: transaction.order.billingAddress?.postalCode,
    },
    shippingAddress: {
      address1: transaction.order.shippingAddress?.streetAddress1,
      address2: transaction.order.shippingAddress?.streetAddress2,
      city: toTitleCase(transaction.order.shippingAddress?.city),
      state: transaction.order.shippingAddress?.countryArea,
      zip5: transaction.order.shippingAddress?.postalCode,
    },
    total: {
      gross: transaction.order.total.gross.amount,
      net: transaction.order.total.net.amount,
      tax: transaction.order.total.tax.amount,
    },
  };
};

export const createCheckoutInput = (
  user: User,
  quantity: string,
  variantId: string
): CheckoutCreateInput => {
  const input: CheckoutCreateInput = {
    email: user.email,
    lines: [
      {
        quantity: parseInt(quantity),
        variantId,
      },
    ],
  };

  if (user.address?.isValid) {
    input.shippingAddress = {
      firstName: user.firstName,
      lastName: user.lastName,

      streetAddress1: user.address.address1,
      streetAddress2: user.address.address2,
      city: user.address.city,
      countryArea: user.address.state,
      postalCode: user.address.zip5,
    };

    input.billingAddress = {
      firstName: user.firstName,
      lastName: user.lastName,
      streetAddress1: user.address.address1,
      streetAddress2: user.address.address2,
      city: user.address.city,
      countryArea: user.address.state,
      postalCode: user.address.zip5,
    };
  }

  return input;
};
