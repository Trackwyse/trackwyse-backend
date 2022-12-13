import express from 'express';

import geo from '../utils/geo';
import { User } from '../models/user.model';
import { Label } from '../models/label.model';
import { logger } from '../utils/logger';

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

  try {
    const labelDocument = await label.save();

    res.status(200).json({
      error: false,
      message: 'Label created successfully',
      label: labelDocument,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      error: true,
      message: 'Error creating label',
    });
  }
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

  console.log(labels);

  if (labels.length === 0 || !labels) {
    return res.status(200).json({
      error: false,
      message: 'No labels found',
      labels: [],
    });
  }

  const labelRecords = await Label.find({ _id: { $in: labels } });

  return res.status(200).json({
    error: false,
    message: 'Labels retrieved successfully',
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
*/
const addLabel = async (req: express.Request, res: express.Response) => {
  const labelId = req.params.labelId;

  if (!labelId) {
    return res.status(400).json({
      error: true,
      message: 'Label ID not provided',
    });
  }

  const label = await Label.findById(labelId);

  if (!label) {
    return res.status(404).json({
      error: true,
      message: 'Label not found',
    });
  }

  if (label.activated) {
    return res.status(400).json({
      error: true,
      message: 'Label already activated',
    });
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(401).json({
      error: true,
      message: 'Unauthorized',
    });
  }

  user.labels.push(labelId);
  label.activated = true;

  try {
    await user.save();
    await label.save();

    return res.status(200).json({
      error: false,
      message: 'Label added successfully',
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      error: true,
      message: 'Error adding label',
    });
  }
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
      message: 'Label ID not provided',
    });
  }

  if (req.user.labels.indexOf(labelId) === -1) {
    return res.status(401).json({
      error: true,
      message: 'Unauthorized',
    });
  }

  const label = await Label.findById(labelId);

  if (!label) {
    return res.status(404).json({
      error: true,
      message: 'Label not found',
    });
  }

  if (!label.activated) {
    return res.status(400).json({
      error: true,
      message: 'Label not activated',
    });
  }

  const { labelName, labelColor, labelMessage, phoneNumber } = req.body;

  if (labelName) label.name = labelName;
  if (labelColor) label.color = labelColor;
  if (labelMessage) label.message = labelMessage;
  if (phoneNumber) label.phoneNumber = phoneNumber;

  try {
    await label.save();

    return res.status(200).json({
      error: false,
      message: 'Label modified successfully',
      label,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
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
      message: 'Label ID not provided',
    });
  }

  if (req.user.labels.indexOf(labelId) === -1) {
    return res.status(401).json({
      error: true,
      message: 'Unauthorized',
    });
  }

  const label = await Label.findById(labelId);

  if (!label) {
    return res.status(404).json({
      error: true,
      message: 'Label not found',
    });
  }

  if (!label.activated) {
    return res.status(400).json({
      error: true,
      message: 'Label not activated',
    });
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(401).json({
      error: true,
      message: 'Unauthorized',
    });
  }

  user.labels = user.labels.filter((label) => label !== labelId);
  label.activated = false;

  try {
    await user.save();
    await label.save();

    return res.status(200).json({
      error: false,
      message: 'Label deleted successfully',
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      error: true,
      message: 'Error deleting label',
    });
  }
};

/*
  GET /api/v1/labels/:labelId
  Get label contact information if found

  Required Fields:
    - labelId

  Returns:
    - error
    - message
    - label
*/
const getLabel = async (req: express.Request, res: express.Response) => {
  const ip = (req.headers['x-forwarded-for'] as string) || (req.connection.remoteAddress as string);

  if (req.user?.labels.indexOf(req.params.labelId) !== -1 && req.user) {
    return res.status(401).json({
      error: true,
      message: 'You cannot locate your own label',
    });
  }

  const label = await Label.findById(req.params.labelId);

  if (!label) {
    return res.status(404).json({
      error: true,
      message: 'Label not found',
    });
  }

  if (!label.activated) {
    return res.status(400).json({
      error: true,
      message: 'Label not activated',
    });
  }

  label.isLost = true;
  label.foundNear = geo.getRelativeLocation(ip);

  try {
    await label.save();

    return res.status(200).json({
      error: false,
      message: 'Label found',
      label,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      error: true,
      message: 'Error finding label',
    });
  }
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
  if (req.user?.labels.indexOf(req.params.labelId) !== -1 && req.user) {
    return res.status(401).json({
      error: true,
      message: 'You cannot locate your own label',
    });
  }

  const label = await Label.findById(req.params.labelId);

  if (!label) {
    return res.status(404).json({
      error: true,
      message: 'Label not found',
    });
  }

  if (!label.activated) {
    return res.status(400).json({
      error: true,
      message: 'Label not activated',
    });
  }

  if (!label.isLost) {
    return res.status(400).json({
      error: true,
      message: 'Label not lost',
    });
  }

  const { phoneNumber, exactLocation, recoveryLocation } = req.body;

  if (phoneNumber) label.finderPhoneNumber = phoneNumber;
  if (exactLocation) label.foundExactLocation = exactLocation;
  if (recoveryLocation) {
    label.foundRecoveryLocation = recoveryLocation;
    label.foundRecoveryPossible = true;
  }

  label.foundDate = new Date();

  try {
    await label.save();

    return res.status(200).json({
      error: false,
      message: 'Label found successfully',
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

export default { getLabels, getLabel, foundLabel, createLabel, addLabel, modifyLabel, deleteLabel };
