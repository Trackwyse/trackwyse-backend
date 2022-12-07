import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Label } from '../models/label.model';

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
  const labelId = uuidv4();

  const label = new Label({ id: labelId });

  try {
    const labelDocument = await label.save();

    res.status(200).json({
      error: false,
      message: 'Label created successfully',
      label: labelDocument,
    });
  } catch (error) {
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
const getLabels = (req: express.Request, res: express.Response) => {};

/*
  POST /api/v1/labels/add/:labelId
  Adds a label to a users account

  Required Fields:
    - labelId

  Returns:
    - error
    - message
*/
const addLabel = (req: express.Request, res: express.Response) => {};

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
*/
const modifyLabel = (req: express.Request, res: express.Response) => {};

/*
  DELETE /api/v1/labels/delete/:labelId
  Deletes a label

  Required Fields:
    - labelId

  Returns:
    - error
    - message
*/
const deleteLabel = (req: express.Request, res: express.Response) => {};

export default { getLabels, createLabel, addLabel, modifyLabel, deleteLabel };
