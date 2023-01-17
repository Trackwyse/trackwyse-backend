import express from "express";

import User from "@/models/user.model";
import Transaction from "@/models/transaction.model";

const getTransactions = async (req: express.Request, res: express.Response) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(400).json({
      error: true,
      message: "User not found",
    });
  }

  const transactions = user.transactions;

  const transactionDocuments = await Transaction.find({
    _id: { $in: transactions },
  });

  return res.status(200).json({
    error: false,
    message: "Transactions retrieved successfully",
    transactions: transactionDocuments,
  });
};

export default {
  getTransactions,
};
