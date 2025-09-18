import { PgSelectSingleStep, PgSelectStep } from "@dataplan/pg";
import { pgRegistry } from "./registry.ts";

const { users, posts } = pgRegistry.pgResources;

// IMPORTANT: Steps must represent the nullable version (suitable for returning
// from a plan resolver). Should you wish to specify a different (non-nullable)
// version that's suitable as a field plan resolver's first argument, use the
// `source:` key in addition to specifying `nullable:`.
export type Overrides = {
  User: {
    nullable: PgSelectSingleStep<typeof users>;
    list: PgSelectStep<typeof users>;
  };
  Post: {
    nullable: PgSelectSingleStep<typeof posts>;
    list: PgSelectStep<typeof posts>;
  };
};
