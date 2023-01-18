/*
 * Created on Mon Jan 16 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import express from "express";

import User from "@/models/user.model";

const getTransactions = async (req: express.Request, res: express.Response) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(400).json({
      error: true,
      message: "User not found",
    });
  }
};

export default {
  getTransactions,
};
