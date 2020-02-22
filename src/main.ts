require("source-map-support").install();

import { createReadStream } from "fs";

import { twoot } from "twoot";
import Masto from "masto";

import { makeHeathcliff } from "./heath";
import { randomInArray } from "./util";

import {
  MASTODON_SERVER,
  MASTODON_TOKEN,
  isValidMastodonConfiguration,
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  TWITTER_ACCESS_KEY,
  TWITTER_ACCESS_SECRET,
  isValidTwitterConfiguration
} from "./env";

const messages = [
  `Today's Heathcliff:`,
  `Heathcliff comic for today:`,
  `It's Heathcliff!`,
  `Here's Heathcliff!`
];

async function makeTwoot(): Promise<{ filename: string; status: string }> {
  return {
    filename: await makeHeathcliff(),
    status: randomInArray(messages)
  };
}

async function doTwoot(): Promise<void> {
  const { filename, status } = await makeTwoot();
  try {
    if (isValidTwitterConfiguration) {
      const url = await twoot(
        [
          {
            consumerKey: TWITTER_CONSUMER_KEY,
            consumerSecret: TWITTER_CONSUMER_SECRET,
            accessKey: TWITTER_ACCESS_KEY,
            accessSecret: TWITTER_ACCESS_SECRET
          }
        ],
        status,
        [filename]
      );
      console.log(`tweeted at '${url}'!`);
    }
  } catch (e) {
    console.error("error while trying to tweet: ", e);
  }

  try {
    if (isValidMastodonConfiguration) {
      const masto = await Masto.login({
        uri: MASTODON_SERVER,
        accessToken: MASTODON_TOKEN
      });

      const { id } = await masto.uploadMediaAttachment({
        file: createReadStream(filename),
        focus: "0,-1.0"
      });

      const { uri } = await masto.createStatus({
        status,
        visibility: "public",
        media_ids: [id]
      });

      console.log(`tooted at '${uri}'!`);
    }
  } catch (e) {
    console.error("error while trying to toot: ", e);
  }
}

if (process.argv.slice(2).includes("local")) {
  const loop = () =>
    makeTwoot().then(({ filename, status }) => {
      console.log(`${status} file://${filename}`);
      setTimeout(loop, 1000);
    });
  loop();
} else {
  doTwoot().then(() => process.exit(0));
}
