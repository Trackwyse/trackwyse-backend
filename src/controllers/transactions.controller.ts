/*
 * Created on Mon Jan 16 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import express from "express";

import Errors from "@/lib/errors";
import saleor from "@/lib/saleor";
import User from "@/models/user.model";
import { formatTransaction } from "@/utils/saleor";

/*
  GET /api/v1/transactions

  Request Query:
    - first: number
    - after: string
    - last: number
    - before: string

  Response:
    - error: boolean
    - message: string
    - transactions: Transaction[]
*/
const getTransactions = async (req: express.Request, res: express.Response) => {
  const { first, after, last, before } = req.query;

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(400).json(Errors.UserNotFound("TRANSACTIONS_0"));
  }

  if (first && last) {
    return res.status(400).json({
      error: {
        traceback: "TRANSACTIONS_1",
        message: "INVALID_QUERY",
        humanMessage: "You can't use first and last at the same time",
      },
    });
  }

  if (after && before) {
    return res.status(400).json({
      error: {
        traceback: "TRANSACTIONS_2",
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

  const response = await saleor.UserOrders({ id: user.customerID, ...params });

  return res.status(200).json({
    error: false,
    message: "Transactions fetched successfully",
    pageInfo: response.user.orders.pageInfo,
    transactions: response.user.orders.edges.map((edge: any) => edge.node),
  });
};

/*
  GET /api/v1/transactions/:id

  Request Params:
    - id: string

  Response:
    - error: boolean
    - message: string
    - transaction: Transaction
*/
const getTransaction = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json(Errors.MissingFields("TRANSACTIONS_3"));
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(400).json(Errors.UserNotFound("TRANSACTIONS_4"));
  }

  const response = await saleor.UserOrderDetails({ id });

  const transaction = formatTransaction(response);

  return res.status(200).json({
    message: "Transaction fetched successfully",
    transaction,
  });
};

export default {
  getTransactions,
  getTransaction,
};
