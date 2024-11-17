import { twoot } from "twoot";

import { makeHeathcliff } from "./heath";
import { randomInArray } from "./util";

import {
  BSKY_PASSWORD,
  BSKY_USERNAME,
  MASTODON_SERVER,
  MASTODON_TOKEN,
} from "./env";

const messages = [
  `Today's Heathcliff:`,
  `Heathcliff comic for today:`,
  `It's Heathcliff!`,
  `Here's Heathcliff!`,
];

async function makeTwoot(): Promise<{ filename: string; status: string }> {
  return {
    filename: await makeHeathcliff(),
    status: randomInArray(messages),
  };
}

async function doTwoot(): Promise<void> {
  const { status, filename } = await makeTwoot();

  const results = await twoot(
    { status, media: [{ path: filename, focus: "0,-1.0" }] },
    [
      { type: "mastodon", server: MASTODON_SERVER, token: MASTODON_TOKEN },
      { type: "bsky", username: BSKY_USERNAME, password: BSKY_PASSWORD },
    ],
  );

  for (const res of results) {
    if (res.type === "error") {
      console.error(`error while twooting:\n${res.message}\n`);
    } else if (res.type === "bsky") {
      console.log(`skeeted at '${res.status.uri}'!`);
    } else {
      console.log(`tooted at '${res.status.url}'!`);
    }
  }
}

if (process.argv.slice(2).includes("local")) {
  const loop = async () => {
    const { filename, status } = await makeTwoot();
    console.log(`${status} file://${filename}`);
    setTimeout(() => {
      void loop();
    }, 1000);
  };

  void loop();
} else {
  doTwoot()
    .then(() => process.exit(0))
    .catch((e) => {
      throw e;
    });
}
