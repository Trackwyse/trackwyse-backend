import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "https://trackwyse.saleor.cloud/graphql/",
  documents: "src/graphql/**/*.graphql",
  generates: {
    "src/graphql/generated/api.ts": {
      plugins: [
        "typescript",
        "typescript-resolvers",
        "typescript-operations",
        "typescript-graphql-request",
      ],
    },
  },
};

export default config;
