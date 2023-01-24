/*
 * Created on Mon Jan 23 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */
import express from "express";

import saleor from "@/lib/saleor";
import User from "@/models/user.model";
import { logger } from "@/lib/logger";
import { createCheckoutInput } from "@/utils/saleor";

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

export default {
  getProductById,
  getProducts,

  getCheckout,
  addProductToCheckout,
};
