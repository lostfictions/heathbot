require("source-map-support").install();

import { makeHeathcliff } from "./heath";
import { twoot, Configs as TwootConfigs } from "twoot";
import { randomInArray } from "./util";

import {
  MASTODON_SERVER,
  MASTODON_TOKEN,
  isValidMastodonConfiguration,
  TWITTER_CONSUMER_KEY as consumerKey,
  TWITTER_CONSUMER_SECRET as consumerSecret,
  TWITTER_ACCESS_KEY as accessKey,
  TWITTER_ACCESS_SECRET as accessSecret,
  isValidTwitterConfiguration
} from "./env";

const twootConfigs: TwootConfigs = [];
if (isValidMastodonConfiguration) {
  twootConfigs.push({
    token: MASTODON_TOKEN,
    server: MASTODON_SERVER
  });
}
if (isValidTwitterConfiguration) {
  twootConfigs.push({
    consumerKey,
    consumerSecret,
    accessKey,
    accessSecret
  });
}

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
    const urls = await twoot(twootConfigs, status, [filename]);
    for (const url of urls) {
      console.log(`twooted at '${url}'!`);
    }
  } catch (e) {
    console.error("error while trying to twoot: ", e);
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
