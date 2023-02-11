/*
 * Created on Mon Jan 23 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */
import lodash from "lodash";
import express from "express";

import {
  createCheckoutInput,
  formatCheckoutQuery,
  formatCheckoutShippingAddressUpdate,
  formatCheckoutCustomerAttachMutation,
  formatCheckoutBillingAddressUpdate,
} from "@/utils/saleor";
import saleor from "@/lib/saleor";
import { logger } from "@/lib/logger";

import Errors from "@/lib/errors";
import User from "@/models/user.model";
import { CountryCode } from "@/graphql/generated/api";

/*
  GET /api/v1/store/products

  Request Query:
    - first: number
    - after: string
    - last: number
    - before: string

  Response:
    - error: boolean
    - message: string
    - products: Product[]
*/
const getProducts = async (req: express.Request, res: express.Response) => {
  const { first, after, last, before } = req.query;

  if (first && last) {
    return res.status(400).json({
      error: {
        traceback: "STORE_0",
        message: "INVALID_QUERY",
        humanMessage: "You can't use first and last at the same time",
      },
    });
  }

  if (after && before) {
    return res.status(400).json({
      error: {
        traceback: "STORE_1",
        message: "INVALID_QUERY",
        humanMessage: "You can't use after and before at the same time",
      },
    });
  }

  // convert first and last to number
  const params = {
    first: first ? Number(first) : 10,
    last: last ? Number(last) : null,
    after: after ? (after as string) : null,
    before: before ? (before as string) : null,
  };

  const response = await saleor.Products({ ...params, filter: { isPublished: true } });

  return res.status(200).json({
    message: "Products fetched successfully",
    pageInfo: response.products.pageInfo,
    products: response.products.edges.map((edge) => edge.node),
  });
};

/*
  GET /api/v1/store/product/:id

  Request Params:
    - id: string

  Response:
    - error: boolean
    - message: string
    - product: Product
*/
const getProductById = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json(Errors.MissingFields("STORE_2"));
  }

  const response = await saleor.Product({ id });

  return res.status(200).json({
    message: "Product fetched successfully",
    product: response.product,
  });
};

/*
  GET /api/v1/store/checkout

  Response:
    - error: boolean
    - message: string
    - checkout: Checkout
*/
const getCheckout = async (req: express.Request, res: express.Response) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(400).json(Errors.UserNotFound("STORE_3"));
  }

  if (!user.checkoutID) {
    return res.status(200).json({
      message: "Checkout fetched successfully",
      checkout: {},
    });
  }

  const response = await saleor.Checkout({ id: user.checkoutID });

  if (!response.checkout) {
    return res.status(500).json(Errors.InternalServerError("STORE_5"));
  }

  const checkout = formatCheckoutQuery(response);

  return res.status(200).json({
    message: "Checkout fetched successfully",
    checkout,
  });
};

/*
  POST /api/v1/store/checkout/add-product

  Request Body:
    - quantity: number
    - variantId: string

  Response:
    - error: boolean
    - message: string
    - checkout: Checkout
*/
const addProductToCheckout = async (req: express.Request, res: express.Response) => {
  const { quantity, variantId } = req.body;

  if (!quantity || !variantId) {
    return res.status(400).json(Errors.MissingFields("STORE_6"));
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(400).json(Errors.UserNotFound("STORE_7"));
  }

  if (!user.checkoutID) {
    const response = await saleor.CheckoutCreate({
      input: createCheckoutInput(user, quantity, variantId),
    });

    if (!response.checkoutCreate.checkout) {
      logger.error(JSON.stringify(response.checkoutCreate.errors));
      return res.status(500).json(Errors.InternalServerError("STORE_8"));
    }

    const attachCustomerResponse = await saleor.CheckoutCustomerAttach({
      id: response.checkoutCreate.checkout.id,
      customerId: user.customerID,
    });

    if (!attachCustomerResponse.checkoutCustomerAttach.checkout) {
      logger.error(JSON.stringify(attachCustomerResponse.checkoutCustomerAttach.errors));
      return res.status(500).json(Errors.InternalServerError("STORE_9"));
    }

    const checkout = formatCheckoutCustomerAttachMutation(attachCustomerResponse);

    user.checkoutID = checkout.id;

    try {
      await user.save();
    } catch (err) {
      logger.error(err);
      return res.status(500).json(Errors.InternalServerError("STORE_10"));
    }

    return res.status(200).json({
      message: "Checkout created successfully",
      checkout,
    });
  }

  const response = await saleor.CheckoutLinesAdd({
    id: user.checkoutID,
    lines: [
      {
        quantity,
        variantId,
      },
    ],
  });

  if (!response.checkoutLinesAdd.checkout) {
    logger.error(JSON.stringify(response.checkoutLinesAdd.errors));
    return res.status(500).json(Errors.InternalServerError("STORE_11"));
  }

  return res.status(200).json({
    message: "Product added to checkout successfully",
    checkout: response.checkoutLinesAdd.checkout,
  });
};

/*
  POST /api/v1/store/checkout/remove-product

  Request Body:
    - lineId: string

  Response:
    - error: boolean
    - message: string
    - checkout: Checkout
*/
const removeProductFromCheckout = async (req: express.Request, res: express.Response) => {
  const { lineId } = req.body;

  if (!lineId) {
    return res.status(400).json(Errors.MissingFields("STORE_12"));
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(400).json(Errors.UserNotFound("STORE_13"));
  }

  if (!user.checkoutID) {
    return res.status(400).json({
      error: {
        traceback: "STORE_14",
        message: "CHECKOUT_NOT_FOUND",
        humanMessage: "Checkout not found",
      },
    });
  }

  const response = await saleor.CheckoutLinesDelete({
    id: user.checkoutID,
    linesIds: [lineId],
  });

  if (!response.checkoutLinesDelete.checkout) {
    logger.error(JSON.stringify(response.checkoutLinesDelete.errors));
    return res.status(500).json(Errors.InternalServerError("STORE_15"));
  }

  return res.status(200).json({
    message: "Product removed from checkout successfully",
    checkout: response.checkoutLinesDelete.checkout,
  });
};

/*
  POST /api/v1/store/checkout/update-product

  Request Body:
    - lineId: string
    - quantity: number

  Response:
    - error: boolean
    - message: string
    - checkout: Checkout
*/
const updateProductInCheckout = async (req: express.Request, res: express.Response) => {
  const { lineId, quantity } = req.body;

  if (!lineId || !quantity) {
    return res.status(400).json(Errors.MissingFields("STORE_16"));
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(400).json(Errors.UserNotFound("STORE_17"));
  }

  if (!user.checkoutID) {
    return res.status(400).json({
      error: {
        traceback: "STORE_18",
        message: "CHECKOUT_NOT_FOUND",
        humanMessage: "Checkout not found",
      },
    });
  }

  const response = await saleor.CheckoutLinesUpdate({
    id: user.checkoutID,
    lines: [
      {
        lineId,
        quantity,
      },
    ],
  });

  if (!response.checkoutLinesUpdate.checkout) {
    logger.error(JSON.stringify(response.checkoutLinesUpdate.errors));
    return res.status(500).json(Errors.InternalServerError("STORE_19"));
  }

  return res.status(200).json({
    message: "Product updated in checkout successfully",
    checkout: response.checkoutLinesUpdate.checkout,
  });
};

/*
  POST /api/v1/store/checkout/update-address

  Request Body:
    - address1: string
    - address2: string
    - city: string
    - state: string
    - zip5: string

  Response:
    - error: boolean
    - message: string
    - checkout: Checkout
*/
const updateCheckoutAddress = async (req: express.Request, res: express.Response) => {
  const { address1, address2, city, state, zip5 } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(400).json(Errors.UserNotFound("STORE_20"));
  }

  if (!user.checkoutID) {
    return res.status(400).json({
      error: {
        traceback: "STORE_21",
        message: "CHECKOUT_NOT_FOUND",
        humanMessage: "Checkout not found",
      },
    });
  }

  const response = await saleor.CheckoutShippingAddressUpdate({
    id: user.checkoutID,
    shippingAddress: {
      streetAddress1: address1,
      streetAddress2: address2,
      city,
      country: CountryCode.Us,
      postalCode: zip5,
      countryArea: state,
    },
  });

  if (!response.checkoutShippingAddressUpdate.checkout) {
    logger.error(JSON.stringify(response.checkoutShippingAddressUpdate.errors));
    return res.status(500).json(Errors.InternalServerError("STORE_22"));
  }

  const checkout = formatCheckoutShippingAddressUpdate(response);

  return res.status(200).json({
    message: "Checkout address updated successfully",
    checkout,
  });
};

/*
  POST /api/v1/store/checkout/update-billing-address

  Request Body:
    - address1: string
    - address2: string
    - city: string
    - state: string
    - zip5: string

  Response:
    - error: boolean
    - message: string
    - checkout: Checkout
*/
const updateCheckoutBillingAddress = async (req: express.Request, res: express.Response) => {
  const { address1, address2, city, state, zip5 } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(400).json(Errors.UserNotFound("STORE_23"));
  }

  if (!user.checkoutID) {
    return res.status(400).json({
      error: {
        traceback: "STORE_24",
        message: "CHECKOUT_NOT_FOUND",
        humanMessage: "Checkout not found",
      },
    });
  }

  const response = await saleor.CheckoutBillingAddressUpdate({
    id: user.checkoutID,
    billingAddress: {
      streetAddress1: address1,
      streetAddress2: address2,
      city,
      country: CountryCode.Us,
      postalCode: zip5,
      countryArea: state,
    },
  });

  if (!response.checkoutBillingAddressUpdate.checkout) {
    logger.error(JSON.stringify(response.checkoutBillingAddressUpdate.errors));
    return res.status(500).json(Errors.InternalServerError("STORE_25"));
  }

  const checkout = formatCheckoutBillingAddressUpdate(response);

  return res.status(200).json({
    message: "Checkout billing address updated successfully",
    checkout,
  });
};

/*
  POST /api/v1/store/payment/create

  Response:
    - error: boolean
    - message: string
*/
const createPayment = async (req: express.Request, res: express.Response) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(400).json(Errors.UserNotFound("STORE_26"));
  }

  if (!user.checkoutID) {
    return res.status(400).json({
      error: {
        traceback: "STORE_27",
        message: "CHECKOUT_NOT_FOUND",
        humanMessage: "Checkout not found",
      },
    });
  }

  const checkout = await saleor.Checkout({
    id: user.checkoutID,
  });

  if (!checkout.checkout) {
    return res.status(500).json(Errors.InternalServerError("STORE_28"));
  }

  const response = await saleor.CheckoutPaymentCreate({
    id: user.checkoutID,
    input: {
      gateway: "saleor.payments.stripe",
      amount: checkout.checkout.totalPrice.gross.amount,
    },
  });

  if (!response.checkoutPaymentCreate.payment) {
    logger.error(JSON.stringify(response.checkoutPaymentCreate.errors));
    return res.status(500).json(Errors.InternalServerError("STORE_29"));
  }

  return res.status(200).json({
    message: "Payment intent created",
  });
};

/*
  POST /api/v1/store/payment/complete

  Response:
    - error: boolean
    - message: string
    -
*/
const completePayment = async (req: express.Request, res: express.Response) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(400).json(Errors.UserNotFound("STORE_30"));
  }

  if (!user.checkoutID) {
    return res.status(400).json({
      error: {
        traceback: "STORE_31",
        message: "CHECKOUT_NOT_FOUND",
        humanMessage: "Checkout not found",
      },
    });
  }

  const response = await saleor.CheckoutComplete({
    id: user.checkoutID,
  });

  if (
    lodash.isEmpty(response.checkoutComplete.order) &&
    !response.checkoutComplete.confirmationNeeded
  ) {
    logger.error(JSON.stringify(response.checkoutComplete.errors));
    return res.status(500).json(Errors.InternalServerError("STORE_32"));
  }

  if (response.checkoutComplete.confirmationNeeded) {
    return res.status(200).json({
      message: "Confirmation needed",
      confirmationData: response.checkoutComplete.confirmationData,
    });
  }

  // update the user's checkout ID
  user.checkoutID = undefined;

  try {
    await user.save();
  } catch (err) {
    logger.error(err);
    return res.status(500).json(Errors.InternalServerError("STORE_33"));
  }

  return res.status(200).json({
    message: "Checkout completed successfully",
    order: response.checkoutComplete.order,
  });
};

/*
  POST /api/v1/store/checkout/update-delivery 

  Request Body:
    - shippingMethodId: string

  Response:
    - error: boolean
    - message: string
    - checkout: Checkout
*/
const updateCheckoutDelivery = async (req: express.Request, res: express.Response) => {
  const { shippingMethodId } = req.body;

  if (!shippingMethodId) {
    return res.status(400).json(Errors.MissingFields("STORE_34"));
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(400).json(Errors.UserNotFound("STORE_35"));
  }

  if (!user.checkoutID) {
    return res.status(400).json({
      error: {
        traceback: "STORE_36",
        message: "CHECKOUT_NOT_FOUND",
        humanMessage: "Checkout not found",
      },
    });
  }

  const response = await saleor.CheckoutShippingMethodUpdate({
    id: user.checkoutID,
    shippingMethodId,
  });

  if (!response.checkoutShippingMethodUpdate.checkout) {
    logger.error(JSON.stringify(response.checkoutShippingMethodUpdate.errors));
    return res.status(500).json(Errors.InternalServerError("STORE_37"));
  }

  return res.status(200).json({
    message: "Checkout delivery updated successfully",
    checkout: response.checkoutShippingMethodUpdate.checkout,
  });
};

export default {
  getProductById,
  getProducts,

  getCheckout,
  addProductToCheckout,
  removeProductFromCheckout,
  updateProductInCheckout,
  updateCheckoutAddress,
  updateCheckoutBillingAddress,
  updateCheckoutDelivery,

  createPayment,
  completePayment,
};
