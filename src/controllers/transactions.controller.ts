/*
 * Created on Mon Jan 16 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import express from "express";

import saleor from "@/lib/saleor";
import User from "@/models/user.model";

const getTransactions = async (req: express.Request, res: express.Response) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(400).json({
      error: true,
      message: "User not found",
    });
  }

  const response = await saleor.UserOrders({ id: user.customerID, first: 10 });

  return res.status(200).json({
    error: false,
    message: "Transactions fetched successfully",
    transactions: response.user.orders.edges.map((edge: any) => edge.node),
  });
};

export default {
  getTransactions,
};
