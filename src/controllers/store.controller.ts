/*
 * Created on Mon Jan 23 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */
import express from "express";

import saleor from "@/lib/saleor";
import { logger } from "@/lib/logger";
import { createCheckoutInput } from "@/utils/saleor";

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
      error: true,
      message: "You can't use first and last at the same time",
    });
  }

  if (after && before) {
    return res.status(400).json({
      error: true,
      message: "You can't use after and before at the same time",
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
    error: false,
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
    return res.status(400).json({
      error: true,
      message: "Product ID is required",
    });
  }

  const response = await saleor.Product({ id });

  return res.status(200).json({
    error: false,
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
    return res.status(400).json({
      error: true,
      message: "User not found",
    });
  }

  if (!user.checkoutID) {
    return res.status(400).json({
      error: true,
      message: "Checkout not found",
    });
  }

  const response = await saleor.Checkout({ id: user.checkoutID });

  return res.status(200).json({
    error: false,
    message: "Checkout fetched successfully",
    checkout: response.checkout,
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
    return res.status(400).json({
      error: true,
      message: "Quantity and variant ID are required",
    });
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(400).json({
      error: true,
      message: "User not found",
    });
  }

  if (!user.checkoutID) {
    const response = await saleor.CheckoutCreate({
      input: createCheckoutInput(user, quantity, variantId),
    });

    if (!response.checkoutCreate.checkout) {
      logger.error(JSON.stringify(response.checkoutCreate.errors));
      return res.status(500).json({
        error: true,
        message: "Error creating checkout",
      });
    }

    user.checkoutID = response.checkoutCreate.checkout.id;

    try {
      await user.save();
    } catch (err) {
      logger.error(err);
      return res.status(500).json({
        error: true,
        message: "Error creating checkout",
      });
    }

    return res.status(200).json({
      error: false,
      message: "Checkout created successfully",
      checkout: response.checkoutCreate.checkout,
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
    return res.status(500).json({
      error: true,
      message: "Error adding product to checkout",
    });
  }

  return res.status(200).json({
    error: false,
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
    return res.status(400).json({
      error: true,
      message: "Line ID is required",
    });
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(400).json({
      error: true,
      message: "User not found",
    });
  }

  if (!user.checkoutID) {
    return res.status(400).json({
      error: true,
      message: "Checkout not found",
    });
  }

  const response = await saleor.CheckoutLinesDelete({
    id: user.checkoutID,
    linesIds: [lineId],
  });

  if (!response.checkoutLinesDelete.checkout) {
    logger.error(JSON.stringify(response.checkoutLinesDelete.errors));
    return res.status(500).json({
      error: true,
      message: "Error removing product from checkout",
    });
  }

  return res.status(200).json({
    error: false,
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
    return res.status(400).json({
      error: true,
      message: "Line ID and quantity are required",
    });
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(400).json({
      error: true,
      message: "User not found",
    });
  }

  if (!user.checkoutID) {
    return res.status(400).json({
      error: true,
      message: "Checkout not found",
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
    return res.status(500).json({
      error: true,
      message: "Error updating product in checkout",
    });
  }

  return res.status(200).json({
    error: false,
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
    - country: string
    - zip5: string
    - firstName: string
    - lastName: string

  Response:
    - error: boolean
    - message: string
    - checkout: Checkout
*/
const updateCheckoutAddress = async (req: express.Request, res: express.Response) => {
  const { address1, address2, city, state, zip5 } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(400).json({
      error: true,
      message: "User not found",
    });
  }

  if (!user.checkoutID) {
    return res.status(400).json({
      error: true,
      message: "Checkout not found",
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
    return res.status(500).json({
      error: true,
      message: "Error updating checkout address",
    });
  }

  return res.status(200).json({
    error: false,
    message: "Checkout address updated successfully",
    checkout: response.checkoutShippingAddressUpdate.checkout,
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
};
