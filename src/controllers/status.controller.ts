import express from "express";

/*
  GET /status/validClients
  Returns a list of valid clients

  Request Body:
    - None

  Response Body:
    - error: boolean
    - message: string
    - versions: string[]
*/
export const getValidClients = async (req: express.Request, res: express.Response) => {
  const versions = ["1.0.7"];

  res.status(200).json({
    error: false,
    message: "Valid clients",
    versions,
  });
};

export default { getValidClients };
