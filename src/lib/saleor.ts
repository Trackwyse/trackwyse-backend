import { GraphQLClient } from "graphql-request";

import config from "../config";
import { getSdk } from "../graphql/__generated__/api";

const client = new GraphQLClient(config.SaleorGraphQLURL, {
  headers: {
    Authorization: `Bearer ${config.SaleorAccessToken}`,
  },
});

const sdk = getSdk(client);

export default sdk;
