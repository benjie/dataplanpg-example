import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./src/schema.ts",
  ignoreNoDocuments: true,
  generates: {
    "./src/schema-generated.ts": {
      plugins: ["typescript", "grafast"],
      config: {
        overridesFile: "./schema-manual-types.ts",
      },
    },
  },
};

export default config;
