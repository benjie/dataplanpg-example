import { grafast } from "grafast";
import { createWithPgClient } from "@dataplan/pg/adaptors/pg";
import { schema } from "./schema.ts";

const withPgClient = createWithPgClient({
  connectionString: "postgres:///dataplanpg-example",
});

const result = await grafast({
  schema,
  source: /* GraphQL */ `
    {
      users {
        id
        username
        createdAt
        posts {
          id
          body
        }
      }
      posts {
        id
        body
        createdAt
        author {
          id
          username
        }
      }
    }
  `,
  contextValue: {
    withPgClient,
    pgSettings: {},
  },
});

console.log(JSON.stringify(result, null, 2));
await withPgClient.release?.();
