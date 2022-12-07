import express from 'express';

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

export default { getLabels, addLabel, modifyLabel, deleteLabel };
