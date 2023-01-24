/*
 * Created on Mon Jan 23 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */
import express from "express";

import saleor from "@/lib/saleor";

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

export default {
  getProducts,
};
