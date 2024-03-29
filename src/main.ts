import { twoot } from "twoot";

import { makeHeathcliff } from "./heath";
import { randomInArray } from "./util";

import { MASTODON_SERVER, MASTODON_TOKEN } from "./env";

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
  try {
    const results = await twoot(
      {
        status,
        media: [{ path: filename, focus: "0,-1.0" }],
      },
      [
        {
          type: "mastodon",
          server: MASTODON_SERVER,
          token: MASTODON_TOKEN,
        },
      ],
    );

    for (const res of results) {
      if (res.type === "error") {
        console.error(`error while twooting:\n${res.message}\n`);
      } else if (res.type === "twitter") {
        console.log(
          `tweeted at 'https://twitter.com/${res.status.user.name}/${res.status.id}'!`,
        );
      } else {
        console.log(`tooted at '${res.status.url}'!`);
      }
    }
  } catch (e) {
    console.error("error while trying to twoot: ", e);
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
