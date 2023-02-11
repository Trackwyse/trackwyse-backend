/*
 * Created on Wed Jan 11 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import express from "express";

import geo from "@/utils/geo";
import { logger } from "@/lib/logger";
import { colors } from "@/lib/constants";
import { getAddressString } from "@/utils/string";

import USPS from "@/lib/usps";
import Errors from "@/lib/errors";
import User from "@/models/user.model";
import AppleMaps from "@/lib/applemaps";
import Label from "@/models/label.model";
import NotificationService from "@/lib/notifications";

/*
  GET /api/v1/labels
  Gets all labels that belong to a user

  Required Fields:
    - None

  Returns:
    - error
    - message
    - labels
*/
const getLabels = async (req: express.Request, res: express.Response) => {
  const labels = req.user.labels;

  if (labels.length === 0 || !labels) {
    return res.status(200).json({
      message: "No labels found",
      labels: [],
    });
  }

  const labelDocuments = await Label.find({ uniqueID: { $in: labels } });

  return res.status(200).json({
    message: "Labels retrieved successfully",
    labels: labelDocuments,
  });
};

/*
  POST /api/v1/labels/add/:labelId
  Adds a label to a users account

  Required Fields:
    - labelId

  Returns:
    - error
    - message
    - label
*/
const addLabel = async (req: express.Request, res: express.Response) => {
  const labelId = req.params.labelId;

  if (!labelId) {
    return res.status(400).json(Errors.MissingFields("LABELS_0"));
  }

  const label = await Label.findOne({ uniqueID: { $eq: labelId } });

  if (!label) {
    return res.status(404).json({
      error: {
        traceback: "LABELS_1",
        message: "LABEL_NOT_FOUND",
        humanMessage: "Label could not be found.",
      },
    });
  }

  if (label.activated) {
    return res.status(400).json({
      error: {
        traceback: "LABELS_2",
        message: "LABEL_ALREADY_ACTIVATED",
        humanMessage: "Label has already been activated.",
      },
    });
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(401).json(Errors.UserNotFound("LABELS_3"));
  }

  user.labels.push(labelId);

  label.owner = user.id;
  label.activated = true;
  label.color = colors[0];

  try {
    await user.save();
    await label.save();
  } catch (err) {
    logger.error(err);
    return res.status(500).json(Errors.InternalServerError("LABELS_4"));
  }

  return res.status(200).json({
    message: "Label added successfully",
    label,
  });
};

/*
  PATCH /api/v1/labels/modify/:labelId
  Modifies a label

  Required Fields:
    - labelId
    - labelName (optional)
    - labelColor (optional)
    - labelMessage (optional)
    - phoneNumber (optional)

  Returns:
    - error
    - message
    - label
*/
const modifyLabel = async (req: express.Request, res: express.Response) => {
  const labelId = req.params.labelId;

  if (!labelId) {
    return res.status(400).json(Errors.MissingFields("LABELS_5"));
  }

  if (req.user.labels.indexOf(labelId) === -1) {
    return res.status(401).json({
      error: {
        traceback: "LABELS_6",
        message: "UNOWNED_LABEL",
        humanMessage: "You do not own this label.",
      },
    });
  }

  const label = await Label.findOne({ uniqueID: { $eq: labelId } });

  if (!label) {
    return res.status(404).json({
      error: {
        traceback: "LABELS_7",
        message: "LABEL_NOT_FOUND",
        humanMessage: "Label could not be found.",
      },
    });
  }

  if (!label.activated) {
    return res.status(400).json({
      error: {
        traceback: "LABELS_8",
        message: "LABEL_NOT_ACTIVATED",
        humanMessage: "Label has not been activated.",
      },
    });
  }

  const { labelName, labelColor, labelMessage, phoneNumber } = req.body;

  if (labelName) label.name = labelName;
  if (labelMessage) label.message = labelMessage;
  if (phoneNumber) label.phoneNumber = phoneNumber;

  // if label color is provided, check if it is a number and is in the range of the number of colors in the colors array
  if (labelColor) {
    // convert labelColor to a number
    const color = parseInt(labelColor, 10);
    if (typeof color === "number" && color >= 0 && color < colors.length) {
      label.color = colors[labelColor];
    }
  }

  try {
    await label.save();
  } catch (err) {
    logger.error(err);
    return res.status(500).json(Errors.InternalServerError("LABELS_9"));
  }

  return res.status(200).json({
    message: "Label modified successfully",
    label,
  });
};

/*
  DELETE /api/v1/labels/delete/:labelId
  Deletes a label

  Required Fields:
    - labelId

  Returns:
    - error
    - message
*/
const deleteLabel = async (req: express.Request, res: express.Response) => {
  const labelId = req.params.labelId;

  if (!labelId) {
    return res.status(400).json(Errors.MissingFields("LABELS_10"));
  }

  if (req.user.labels.indexOf(labelId) === -1) {
    return res.status(401).json({
      error: {
        traceback: "LABELS_11",
        message: "UNOWNED_LABEL",
        humanMessage: "You do not own this label.",
      },
    });
  }

  const label = await Label.findOne({ uniqueID: { $eq: labelId } });

  if (!label) {
    return res.status(404).json({
      error: {
        traceback: "LABELS_12",
        message: "LABEL_NOT_FOUND",
        humanMessage: "Label could not be found.",
      },
    });
  }

  if (!label.activated) {
    return res.status(400).json({
      error: {
        traceback: "LABELS_13",
        message: "LABEL_NOT_ACTIVATED",
        humanMessage: "Label has not been activated.",
      },
    });
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(401).json(Errors.UserNotFound("LABELS_14"));
  }

  user.labels = user.labels.filter((id) => id.toString() !== labelId);
  label.resetData();

  try {
    await user.save();
    await label.save();
  } catch (err) {
    logger.error(err);
    return res.status(500).json(Errors.InternalServerError("LABELS_15"));
  }

  return res.status(200).json({
    message: "Label deleted successfully",
  });
};

/*
  POST /api/v1/labels/recovered/:labelId
  Mark a label as no longer lost

  Required Fields:
    - labelId

  Returns:
    - error
    - message
*/
const recoveredLabel = async (req: express.Request, res: express.Response) => {
  const labelId = req.params.labelId;

  if (!labelId) {
    return res.status(400).json(Errors.MissingFields("LABELS_16"));
  }

  if (req.user.labels.indexOf(labelId) === -1) {
    return res.status(401).json({
      error: {
        traceback: "LABELS_17",
        message: "UNOWNED_LABEL",
        humanMessage: "You do not own this label.",
      },
    });
  }

  const label = await Label.findOne({ uniqueID: { $eq: labelId } });

  if (!label) {
    return res.status(404).json({
      error: {
        traceback: "LABELS_18",
        message: "LABEL_NOT_FOUND",
        humanMessage: "Label could not be found.",
      },
    });
  }

  if (!label.activated) {
    return res.status(400).json({
      error: {
        traceback: "LABELS_19",
        message: "LABEL_NOT_ACTIVATED",
        humanMessage: "Label has not been activated.",
      },
    });
  }

  label.removeLostData();

  try {
    await label.save();
  } catch (err) {
    logger.error(err);
    return res.status(500).json(Errors.InternalServerError("LABELS_20"));
  }

  return res.status(200).json({
    message: "Label recovered successfully",
    label,
  });
};

/*
  POST /api/v1/labels/found/:labelId
  Update contact's label to found

  Required Fields:
    - labelId
    - phoneNumber (optional)
    - exactLocation (optional)
    - recoveryLocation (optional)
*/
const foundLabel = async (req: express.Request, res: express.Response) => {
  const ip = (req.headers["x-forwarded-for"] as string) || (req.connection.remoteAddress as string);

  const label = await Label.findOne({ uniqueID: { $eq: req.params.labelId } });

  if (!label) {
    return res.status(404).json({
      error: {
        traceback: "LABELS_21",
        message: "LABEL_NOT_FOUND",
        humanMessage: "Label could not be found.",
      },
    });
  }

  if (!label.activated) {
    return res.status(400).json({
      error: {
        traceback: "LABELS_22",
        message: "LABEL_NOT_ACTIVATED",
        humanMessage: "Label has not been activated.",
      },
    });
  }

  label.isLost = true;
  label.foundNear = geo.getRelativeLocation(ip);

  // Send Notification to Label Owner
  const user = await User.findById(label.owner);

  if (user && user.notificationPushTokens.length && user.notificationsEnabled) {
    if (!label.hasBeenNotified) {
      try {
        NotificationService.sendNotification(user.notificationPushTokens, {
          title: "Your label has been located",
          body: `Your label "${label.name ?? "No Name"}" has been located near ${
            label.foundNear ?? "Unknown"
          }`,
          data: {
            type: "labelLocated",
            labelId: label.id,
          },
        });
      } catch (err) {
        logger.error(err);
        return res.status(500).json(Errors.InternalServerError("LABELS_23"));
      }
    }
  }

  const { phoneNumber, exactLocation, recoveryLocation } = req.body;

  if (phoneNumber) label.finderPhoneNumber = phoneNumber;

  if (exactLocation) {
    try {
      const address = await USPS.verify({
        Address1: exactLocation.address1 ?? label.foundExactLocation?.address1 ?? "",
        Address2: exactLocation.address2 ?? label.foundExactLocation?.address2 ?? "",
        City: exactLocation.city ?? label.foundExactLocation?.city ?? "",
        State: exactLocation.state ?? label.foundExactLocation?.state ?? "",
        Zip5: exactLocation.zip5 ?? label.foundExactLocation?.zip5 ?? "",
      });

      const geocodedAddress = await AppleMaps.geocode({
        q: getAddressString({
          address1: address.Address1,
          address2: address.Address2,
          city: address.City,
          state: address.State,
          zip5: address.Zip5,
        }),
      });

      label.foundExactLocation = {
        address1: address.Address1,
        address2: address.Address2,
        city: address.City,
        state: address.State,
        zip5: address.Zip5,
        latitude: geocodedAddress.results[0].coordinate.latitude,
        longitude: geocodedAddress.results[0].coordinate.longitude,
      };
    } catch (err) {
      logger.error(err);
      return res.status(400).json({
        error: {
          field: "address1",
          traceback: "LABELS_24",
          message: "INVALID_ADDRESS",
          humanMessage: "Invalid address",
        },
      });
    }
  }

  if (recoveryLocation) {
    try {
      const address = await USPS.verify({
        Address1: recoveryLocation.address1 ?? label.foundRecoveryLocation?.address1 ?? "",
        Address2: recoveryLocation.address2 ?? label.foundRecoveryLocation?.address2 ?? "",
        City: recoveryLocation.city ?? label.foundRecoveryLocation?.city ?? "",
        State: recoveryLocation.state ?? label.foundRecoveryLocation?.state ?? "",
        Zip5: recoveryLocation.zip5 ?? label.foundRecoveryLocation?.zip5 ?? "",
      });

      const geocodedAddress = await AppleMaps.geocode({
        q: getAddressString({
          address1: address.Address1,
          address2: address.Address2,
          city: address.City,
          state: address.State,
          zip5: address.Zip5,
        }),
      });

      label.foundRecoveryPossible = true;
      label.foundRecoveryLocation = {
        address1: address.Address1,
        address2: address.Address2,
        city: address.City,
        state: address.State,
        zip5: address.Zip5,
        latitude: geocodedAddress.results[0].coordinate.latitude,
        longitude: geocodedAddress.results[0].coordinate.longitude,
      };
    } catch (err) {
      logger.error(err);
      return res.status(400).json({
        error: {
          field: "address1",
          traceback: "LABELS_25",
          message: "INVALID_ADDRESS",
          humanMessage: "Invalid address",
        },
      });
    }
  }

  label.foundDate = new Date();
  label.hasBeenNotified = true;

  try {
    await label.save();
  } catch (err) {
    logger.error(err);
    return res.status(500).json(Errors.InternalServerError("LABELS_26"));
  }

  return res.status(200).json({
    message: "Label found successfully",
    label,
  });
};

export default {
  getLabels,
  foundLabel,
  addLabel,
  recoveredLabel,
  modifyLabel,
  deleteLabel,
};
