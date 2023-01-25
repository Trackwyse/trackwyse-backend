/*
 * Created on Tue Jan 24 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import {
  UserOrderDetailsQuery,
  CheckoutCreateInput,
  CountryCode,
  CheckoutCreateMutation,
  CheckoutQuery,
  CheckoutShippingAddressUpdateMutation,
} from "@/graphql/generated/api";
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

export const formatCheckoutQuery = (checkout: CheckoutQuery) => {
  return {
    ...checkout.checkout,
    billingAddress: {
      address1: checkout.checkout.billingAddress?.streetAddress1,
      address2: checkout.checkout.billingAddress?.streetAddress2,
      city: toTitleCase(checkout.checkout.billingAddress?.city),
      state: checkout.checkout.billingAddress?.countryArea,
      zip5: checkout.checkout.billingAddress?.postalCode,
    },
    shippingAddress: {
      address1: checkout.checkout.shippingAddress?.streetAddress1,
      address2: checkout.checkout.shippingAddress?.streetAddress2,
      city: toTitleCase(checkout.checkout.shippingAddress?.city),
      state: checkout.checkout.shippingAddress?.countryArea,
      zip5: checkout.checkout.shippingAddress?.postalCode,
    },
  };
};

export const formatCheckoutMutation = (checkout: CheckoutCreateMutation) => {
  return {
    ...checkout.checkoutCreate.checkout,
    billingAddress: {
      address1: checkout.checkoutCreate.checkout.billingAddress?.streetAddress1,
      address2: checkout.checkoutCreate.checkout.billingAddress?.streetAddress2,
      city: toTitleCase(checkout.checkoutCreate.checkout.billingAddress?.city),
      state: checkout.checkoutCreate.checkout.billingAddress?.countryArea,
      zip5: checkout.checkoutCreate.checkout.billingAddress?.postalCode,
    },
    shippingAddress: {
      address1: checkout.checkoutCreate.checkout.shippingAddress?.streetAddress1,
      address2: checkout.checkoutCreate.checkout.shippingAddress?.streetAddress2,
      city: toTitleCase(checkout.checkoutCreate.checkout.shippingAddress?.city),
      state: checkout.checkoutCreate.checkout.shippingAddress?.countryArea,
      zip5: checkout.checkoutCreate.checkout.shippingAddress?.postalCode,
    },
  };
};

export const formatCheckoutShippingAddressUpdate = (
  checkout: CheckoutShippingAddressUpdateMutation
) => {
  return {
    ...checkout.checkoutShippingAddressUpdate.checkout,
    shippingAddress: {
      address1: checkout.checkoutShippingAddressUpdate.checkout.shippingAddress?.streetAddress1,
      address2: checkout.checkoutShippingAddressUpdate.checkout.shippingAddress?.streetAddress2,
      city: toTitleCase(checkout.checkoutShippingAddressUpdate.checkout.shippingAddress?.city),
      state: checkout.checkoutShippingAddressUpdate.checkout.shippingAddress?.countryArea,
      zip5: checkout.checkoutShippingAddressUpdate.checkout.shippingAddress?.postalCode,
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
      country: CountryCode.Us, // TODO: Make this dynamic
      postalCode: user.address.zip5,
    };

    input.billingAddress = {
      firstName: user.firstName,
      lastName: user.lastName,
      streetAddress1: user.address.address1,
      streetAddress2: user.address.address2,
      city: user.address.city,
      countryArea: user.address.state,
      country: CountryCode.Us, // TODO: Make this dynamic
      postalCode: user.address.zip5,
    };
  }

  return input;
};
