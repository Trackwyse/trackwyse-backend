/*
 * Created on Wed Jan 11 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import { Request, Response, NextFunction } from "express";

import jwt from "@/utils/jwt";
import User from "@/models/user.model";

/*
  Only used for the /auth/vX/refresh route
  Verifies that the 'jwt' cookie is present and valid

  If the cookie is valid, the user is attached to the request
 */
const authenticateRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.authorization) {
    const refreshToken = req.headers.authorization.split(" ")[1];

    const payload = jwt.verifyRefreshToken(refreshToken);

    const user = await User.findById(payload?.id);

    if (!user) {
      return res.status(401).json({
        error: {
          traceback: "AUTH_0",
          message: "UNAUTHORIZED_REQUEST",
          humanMessage: "Your session has expired. Please log in again.",
        },
      });
    }

    // Verify that the refresh token matches the one in the database
    const isRefreshTokenValid = await user.compareRefreshToken(refreshToken);

    if (!isRefreshTokenValid) {
      return res.status(401).json({
        error: {
          traceback: "AUTH_1",
          message: "UNAUTHORIZED_REQUEST",
          humanMessage: "Your session has expired. Please log in again.",
        },
      });
    }

    // Attach the user to the request, and continue
    const sanitizedUser = user.sanitize();

    req.user = sanitizedUser;
    return next();
  }

  return res.status(401).json({
    error: {
      traceback: "AUTH_2",
      message: "UNAUTHORIZED_REQUEST",
      humanMessage: "Your session has expired. Please log in again.",
    },
  });
};

/*
  Used for all routes except /auth/*
  Verifies that the 'authorization' header is present and valid

  If the header is valid, the user is attached to the request
  If the user is not verified, the request is rejected
*/
const authenticateVerifiedAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.authorization) {
    const accessToken = req.headers.authorization.split(" ")[1];

    const payload = jwt.verifyAccessToken(accessToken);

    if (payload === "expired") {
      return res.status(401).json({
        error: {
          traceback: "AUTH_3",
          message: "UNAUTHORIZED_REQUEST",
          humanMessage: "Your session has expired. Please log in again.",
        },
      });
    }

    const user = await User.findById(payload?.id);

    if (user) {
      const sanitizedUser = user.sanitize();

      if (!user.verified) {
        return res.status(401).json({
          error: {
            traceback: "AUTH_4",
            message: "Unverified Account",
            humanMessage: "Your account has not been verified.",
          },
        });
      }

      req.user = sanitizedUser;
      return next();
    }

    return res.status(401).json({
      error: {
        traceback: "AUTH_5",
        message: "UNAUTHORIZED_REQUEST",
        humanMessage: "Your session has expired. Please log in again.",
      },
    });
  }

  return res.status(401).json({
    error: {
      traceback: "AUTH_6",
      message: "UNAUTHORIZED_REQUEST",
      humanMessage: "Your session has expired. Please log in again.",
    },
  });
};

/*
  Used for ONLY the /auth/vX/verify route
  Verifies that the 'authorization' header is present and valid

  If the header is valid, the user is attached to the request
  If the user is verified, the request is rejected

  This is used to prevent users from verifying their account multiple times

  This is also used to prevent users from verifying their account before they have
  created an account
*/
const authenticateUnverifiedAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.headers.authorization) {
    const accessToken = req.headers.authorization.split(" ")[1];

    const payload = jwt.verifyAccessToken(accessToken);

    if (payload === "expired") {
      return res.status(401).json({
        error: {
          traceback: "AUTH_7",
          message: "UNAUTHORIZED_REQUEST",
          humanMessage: "Your session has expired. Please log in again.",
        },
      });
    }

    const user = await User.findById(payload?.id);

    if (user) {
      const sanitizedUser = user.sanitize();

      if (user.verified) {
        return res.status(401).json({
          error: {
            traceback: "AUTH_8",
            message: "ALREADY_VERIFIED",
            humanMessage: "Your account has already been verified.",
          },
        });
      }

      req.user = sanitizedUser;
      return next();
    }

    return res.status(401).json({
      error: {
        traceback: "AUTH_9",
        message: "UNAUTHORIZED_REQUEST",
        humanMessage: "Your session has expired. Please log in again.",
      },
    });
  }

  return res.status(401).json({
    error: {
      traceback: "AUTH_10",
      message: "UNAUTHORIZED_REQUEST",
      humanMessage: "Your session has expired. Please log in again.",
    },
  });
};

/*
  Used for ONLY the /auth/vX/me route
  Verifies that the 'authorization' header is present and valid

  If the header is valid, the user is attached to the request
  If the user is not verified, the request is rejected
*/
const authenticateAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.authorization) {
    const accessToken = req.headers.authorization.split(" ")[1];

    const payload = jwt.verifyAccessToken(accessToken);

    if (payload === "expired") {
      return res.status(401).json({
        error: {
          traceback: "AUTH_11",
          message: "UNAUTHORIZED_REQUEST",
          humanMessage: "Your session has expired. Please log in again.",
        },
      });
    }

    const user = await User.findById(payload?.id);

    if (user) {
      const sanitizedUser = user.sanitize();

      req.user = sanitizedUser;
      return next();
    }

    return res.status(401).json({
      error: {
        traceback: "AUTH_12",
        message: "UNAUTHORIZED_REQUEST",
        humanMessage: "Your session has expired. Please log in again.",
      },
    });
  }

  return res.status(401).json({
    error: {
      traceback: "AUTH_13",
      message: "UNAUTHORIZED_REQUEST",
      humanMessage: "Your session has expired. Please log in again.",
    },
  });
};

/*
  Used for ONLY the /admin/vX/* routes
  Verifies that the 'authorization' header is present and valid

  If the header is valid and the user has the admin tole, the user is attached to the request
  If the user is not verified, the request is rejected
*/
const authenticateAdminAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.authorization) {
    const accessToken = req.headers.authorization.split(" ")[1];

    const payload = jwt.verifyAccessToken(accessToken);

    if (payload === "expired") {
      return res.status(401).json({
        error: {
          traceback: "AUTH_14",
          message: "UNAUTHORIZED_REQUEST",
          humanMessage: "Your session has expired. Please log in again.",
        },
      });
    }

    const user = await User.findById(payload?.id);

    if (user) {
      const sanitizedUser = user.sanitize();

      if (!user.verified) {
        return res.status(401).json({
          error: {
            traceback: "AUTH_15",
            message: "UNVERIFIED_ACCOUNT",
            humanMessage: "Your account has not been verified.",
          },
        });
      }

      if (user.role !== "admin") {
        return res.status(401).json({
          error: {
            traceback: "AUTH_16",
            message: "UNAUTHORIZED_REQUEST",
            humanMessage: "Your session has expired. Please log in again.",
          },
        });
      }

      req.user = sanitizedUser;
      return next();
    }

    return res.status(401).json({
      error: {
        traceback: "AUTH_17",
        message: "UNAUTHORIZED_REQUEST",
        humanMessage: "Your session has expired. Please log in again.",
      },
    });
  }

  return res.status(401).json({
    error: {
      traceback: "AUTH_18",
      message: "UNAUTHORIZED_REQUEST",
      humanMessage: "Your session has expired. Please log in again.",
    },
  });
};

/*
  Used for ONLY the routes used to find labels.
  Verifies that the 'authorization' header is present and valid

  If the header is valid, the user is attached to the request
  If the user is not verified, the user is not attached to the request
*/
const attachAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.authorization) {
    const accessToken = req.headers.authorization.split(" ")[1];

    const payload = jwt.verifyAccessToken(accessToken);

    if (payload === "expired") {
      return res.status(401).json({
        error: {
          traceback: "AUTH_19",
          message: "UNAUTHORIZED_REQUEST",
          humanMessage: "Your session has expired. Please log in again.",
        },
      });
    }

    const user = await User.findById(payload?.id);

    if (user) {
      const sanitizedUser = user.sanitize();

      req.user = sanitizedUser;
      return next();
    }

    return next();
  }

  return next();
};

export default {
  attachAccessToken,
  authenticateRefreshToken,
  authenticateAccessToken,
  authenticateAdminAccessToken,
  authenticateVerifiedAccessToken,
  authenticateUnverifiedAccessToken,
};
