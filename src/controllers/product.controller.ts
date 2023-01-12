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
import { getAddressString } from "@/utils/text";

import USPS from "@/lib/usps";
import User from "@/models/user.model";
import AppleMaps from "@/lib/applemaps";
import Label from "@/models/label.model";
import NotificationService from "@/lib/notifications";

/*
  POST /api/v1/labels/create
  Creates a label (TEMPORARY)

  Required Fields:
    - none

  Returns:
    - error
    - message
    - label
*/
const createLabel = async (req: express.Request, res: express.Response) => {
  const label = new Label();

  let labelDocument;

  try {
    labelDocument = await label.save();
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      error: true,
      message: "Error creating label",
    });
  }

  return res.status(200).json({
    error: false,
    message: "Label created successfully",
    label: labelDocument,
  });
};

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
      error: false,
      message: "No labels found",
      labels: [],
    });
  }

  const labelRecords = await Label.find({ _id: { $in: labels } });

  return res.status(200).json({
    error: false,
    message: "Labels retrieved successfully",
    labels: labelRecords,
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
    return res.status(400).json({
      error: true,
      message: "Label ID not provided",
    });
  }

  const label = await Label.findById(labelId);

  if (!label) {
    return res.status(404).json({
      error: true,
      message: "Label not found",
    });
  }

  if (label.activated) {
    return res.status(400).json({
      error: true,
      message: "Label already activated",
    });
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(401).json({
      error: true,
      message: "Unauthorized",
    });
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
    return res.status(500).json({
      error: true,
      message: "Error adding label",
    });
  }

  return res.status(200).json({
    error: false,
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
    return res.status(400).json({
      error: true,
      message: "Label ID not provided",
    });
  }

  if (req.user.labels.indexOf(labelId) === -1) {
    return res.status(401).json({
      error: true,
      message: "Unauthorized",
    });
  }

  const label = await Label.findById(labelId);

  if (!label) {
    return res.status(404).json({
      error: true,
      message: "Label not found",
    });
  }

  if (!label.activated) {
    return res.status(400).json({
      error: true,
      message: "Label not activated",
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
    return res.status(500).json({ error: true, message: "Error modifying label" });
  }

  return res.status(200).json({
    error: false,
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
    return res.status(400).json({
      error: true,
      message: "Label ID not provided",
    });
  }

  if (req.user.labels.indexOf(labelId) === -1) {
    return res.status(401).json({
      error: true,
      message: "Unauthorized",
    });
  }

  const label = await Label.findById(labelId);

  if (!label) {
    return res.status(404).json({
      error: true,
      message: "Label not found",
    });
  }

  if (!label.activated) {
    return res.status(400).json({
      error: true,
      message: "Label not activated",
    });
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(401).json({
      error: true,
      message: "Unauthorized",
    });
  }

  user.labels = user.labels.filter((id) => id.toString() !== labelId);
  label.resetData();

  try {
    await user.save();
    await label.save();
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: true, message: "Error deleting label" });
  }

  return res.status(200).json({
    error: false,
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
    return res.status(400).json({
      error: true,
      message: "Label ID not provided",
    });
  }

  if (req.user.labels.indexOf(labelId) === -1) {
    return res.status(401).json({
      error: true,
      message: "Unauthorized",
    });
  }

  const label = await Label.findById(labelId);

  if (!label) {
    return res.status(404).json({
      error: true,
      message: "Label not found",
    });
  }

  if (!label.activated) {
    return res.status(400).json({
      error: true,
      message: "Label not activated",
    });
  }

  label.removeLostData();

  try {
    await label.save();
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: true, message: "Error recovering label" });
  }

  return res.status(200).json({
    error: false,
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

  if (req.user?.labels.indexOf(req.params.labelId) !== -1 && req.user) {
    return res.status(401).json({
      error: true,
      message: "You cannot locate your own label",
    });
  }

  const label = await Label.findById(req.params.labelId);

  if (!label) {
    return res.status(404).json({
      error: true,
      message: "Label not found",
    });
  }

  if (!label.activated) {
    return res.status(400).json({
      error: true,
      message: "Label not activated",
    });
  }

  label.isLost = true;
  label.foundNear = geo.getRelativeLocation(ip);

  // Send Notification to Label Owner
  const user = await User.findById(label.owner);

  if (user && user.notificationPushTokens.length && user.notificationsEnabled) {
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
      return res.status(400).json({ error: true, message: "Invalid address" });
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
      return res.status(400).json({ error: true, message: "Invalid address" });
    }
  }

  label.foundDate = new Date();

  try {
    await label.save();
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: true, message: "Error finding label" });
  }

  return res.status(200).json({
    error: false,
    message: "Label found successfully",
    label,
  });
};

export default {
  getLabels,
  foundLabel,
  createLabel,
  addLabel,
  recoveredLabel,
  modifyLabel,
  deleteLabel,
};
