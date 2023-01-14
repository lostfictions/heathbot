import { existsSync } from "fs";
import { parseEnv, z } from "znv";
import { config } from "dotenv";

config();

export const {
  NODE_ENV,
  DATA_DIR,
  MASTODON_SERVER,
  MASTODON_TOKEN,
  TWITTER_API_KEY,
  TWITTER_API_SECRET,
  TWITTER_ACCESS_TOKEN,
  TWITTER_ACCESS_SECRET,
  SENTRY_DSN,
} = parseEnv(
  // eslint-disable-next-line node/no-process-env
  process.env,
  {
    NODE_ENV: {
      schema: z.string().optional(),
    },
    DATA_DIR: {
      schema: z.string().min(1),
      defaults: { _: "persist" },
    },
    MASTODON_SERVER: {
      schema: z.string().url(),
      defaults: { _: "https://mastodon.social" },
    },
    MASTODON_TOKEN: {
      schema: z.string().min(1),
      defaults: { production: undefined, _: "unused" },
    },
    TWITTER_API_KEY: {
      schema: z.string().min(1),
      defaults: { production: undefined, _: "unused" },
    },
    TWITTER_API_SECRET: {
      schema: z.string().min(1),
      defaults: { production: undefined, _: "unused" },
    },
    TWITTER_ACCESS_TOKEN: {
      schema: z.string().min(1),
      defaults: { production: undefined, _: "unused" },
    },
    TWITTER_ACCESS_SECRET: {
      schema: z.string().min(1),
      defaults: { production: undefined, _: "unused" },
    },
    SENTRY_DSN: {
      schema: z.string().min(1).optional(),
    },
  }
);

if (!SENTRY_DSN && NODE_ENV === "production") {
  console.warn("SENTRY_DSN not provided! Sentry reporting will be disabled.");
}

if (!existsSync(DATA_DIR)) {
  throw new Error(`Data directory '${DATA_DIR}' doesn't exist!`);
}
