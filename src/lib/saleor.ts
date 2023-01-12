/*
 * Created on Wed Jan 11 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import { GraphQLClient } from "graphql-request";

import config from "@/config";
import { getSdk } from "@/graphql/generated/api";

const client = new GraphQLClient(config.SaleorGraphQLURL, {
  headers: {
    Authorization: `Bearer ${config.SaleorAccessToken}`,
  },
});

const sdk = getSdk(client);

export default sdk;
