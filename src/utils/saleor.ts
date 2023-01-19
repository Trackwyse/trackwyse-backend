import { UserOrderDetailsQuery } from "@/graphql/generated/api";
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
