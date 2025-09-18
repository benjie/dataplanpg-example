import { makeGrafastSchema, grafast, context, object } from "grafast";
import { createWithPgClient } from "@dataplan/pg/adaptors/pg";
import {
  makeRegistryBuilder,
  PgExecutor,
  recordCodec,
  TYPES,
  type PgResourceOptions,
} from "@dataplan/pg";
import { sql } from "pg-sql2";

const withPgClient = createWithPgClient({
  connectionString: "postgres:///dataplanpg-example",
});

const executor = new PgExecutor({
  name: "main",
  context: () =>
    object({
      withPgClient: context().get("withPgClient"),
      pgSettings: context().get("pgSettings"),
    }),
});

const usersCodec = recordCodec({
  executor,
  name: "users",
  identifier: sql`users`,
  attributes: {
    id: {
      codec: TYPES.int,
      notNull: true,
    },
    username: {
      codec: TYPES.citext,
      notNull: true,
    },
    created_at: {
      codec: TYPES.timestamptz,
      notNull: true,
    },
  },
});

const postsCodec = recordCodec({
  executor,
  name: "posts",
  identifier: sql`posts`,
  attributes: {
    id: {
      codec: TYPES.int,
      notNull: true,
    },
    author_id: {
      codec: TYPES.int,
      notNull: true,
    },
    body: {
      codec: TYPES.text,
      notNull: true,
    },
    created_at: {
      codec: TYPES.timestamptz,
      notNull: true,
    },
  },
});

const usersResourceOptions = {
  executor,
  name: "users",
  from: sql`users`,
  codec: usersCodec,
  uniques: [
    {
      isPrimary: true,
      attributes: ["id"],
    },
    {
      attributes: ["username"],
    },
  ],
} satisfies PgResourceOptions;
const postsResourceOptions = {
  executor,
  name: "posts",
  from: sql`posts`,
  codec: postsCodec,
  uniques: [
    {
      isPrimary: true,
      attributes: ["id"],
    },
  ],
} satisfies PgResourceOptions;
const pgRegistry = makeRegistryBuilder()
  .addExecutor(executor)
  .addCodec(usersCodec)
  .addCodec(postsCodec)
  .addResource(usersResourceOptions)
  .addResource(postsResourceOptions)
  .addRelation(postsCodec, "author", usersResourceOptions, {
    isReferencee: false,
    isUnique: true,
    localAttributes: ["author_id"],
    remoteAttributes: ["id"],
  })
  .addRelation(usersCodec, "posts", postsResourceOptions, {
    isReferencee: true,
    isUnique: false,
    localAttributes: ["id"],
    remoteAttributes: ["author_id"],
  })
  .build();

const {
  pgResources: { users, posts },
} = pgRegistry;

const schema = makeGrafastSchema({
  typeDefs: /* GraphQL */ `
    scalar Datetime
    type Query {
      users: [User]
      posts: [Post]
    }
    type User {
      id: Int!
      username: String!
      createdAt: Datetime!
      posts: [Post]
    }
    type Post {
      id: Int!
      author: User
      body: String!
      createdAt: Datetime!
    }
  `,
  objects: {
    Query: {
      plans: {
        users() {
          return users.find();
        },
        posts() {
          return posts.find();
        },
      },
    },
    User: {
      plans: {
        createdAt($user) {
          return $user.get("created_at");
        },
        posts($user) {
          const $userId = $user.get("id");
          return posts.find({ author_id: $userId });
        },
      },
    },
    Post: {
      plans: {
        createdAt($post) {
          return $post.get("created_at");
        },
        author($post) {
          const $authorId = $post.get("author_id");
          return users.get({ id: $authorId });
        },
      },
    },
  },
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
