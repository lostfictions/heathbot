import fs from "fs";
import path from "path";
import { tmpdir } from "os";

import {
  createCanvas,
  loadImage,
  Image,
  type CanvasRenderingContext2D,
} from "canvas";

import { randomInArray } from "./util";
import { DATA_DIR } from "./env";

const imgDir = path.join(DATA_DIR, "heathcliff");
const outDir = tmpdir();

let filenames: string[] = [];
if (!fs.existsSync(imgDir)) {
  throw new Error(`Heathcliff source directory '${imgDir}' not found!`);
} else {
  filenames = fs.readdirSync(imgDir);
  if (filenames.length === 0) {
    throw new Error(`No files in image directory '${imgDir}'!`);
  }
}

async function load(files: string[]): Promise<[Image, string[]]> {
  const nextFiles = files.slice();

  let img: Image;
  do {
    const fn = randomInArray(nextFiles);
    nextFiles.splice(nextFiles.indexOf(fn), 1);
    img = await loadImage(path.join(imgDir, fn));
  } while (img.width > img.height); // NO SUNDAYS

  return [img, nextFiles];
}

let filenameIndex = 0;

export async function makeHeathcliff(): Promise<string> {
  const [i, nextFiles] = await load(filenames);
  const [j] = await load(nextFiles);

  // always shrink the larger image rather than blow up the small one.
  const [small, big] = i.width < j.width ? [i, j] : [j, i];

  const smallCanvas = createCanvas(small.width, small.height);
  const smallCtx = smallCanvas.getContext("2d");
  smallCtx.quality = "best";
  smallCtx.drawImage(small, 0, 0);
  const smallBottom =
    detectBottom(smallCtx, smallCanvas.width, smallCanvas.height) + 5;

  const bigCanvas = createCanvas(big.width, big.height);
  const bigCtx = bigCanvas.getContext("2d");
  bigCtx.quality = "best";
  bigCtx.drawImage(big, 0, 0);
  const bigBottom = detectBottom(bigCtx, bigCanvas.width, bigCanvas.height) + 5;

  const shrinkAmount = small.width / big.width;
  const captionHeight = Math.floor(
    (bigCanvas.height - bigBottom) * shrinkAmount
  );

  const destCanvas = createCanvas(small.width, smallBottom + captionHeight);
  const destCtx = destCanvas.getContext("2d");
  destCtx.quality = "best";
  destCtx.drawImage(small, 0, 0);
  destCtx.drawImage(
    big,
    0,
    bigBottom,
    bigCanvas.width,
    bigCanvas.height - bigBottom,
    0,
    smallBottom,
    small.width,
    captionHeight
  );

  filenameIndex += 1;
  const filename = path.join(outDir, `heathcliff_${filenameIndex}.png`);

  const out = fs.createWriteStream(filename);
  const stream = destCanvas.createPNGStream();
  stream.pipe(out);

  return new Promise<string>((res, rej) => {
    out.on("finish", () => res(filename));
    out.on("error", (e) => rej(e));
  });
}

function detectBottom(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): number {
  const sliceHeight = Math.ceil(height * 0.15);

  const imageData = ctx.getImageData(
    0,
    height - sliceHeight,
    width,
    sliceHeight
  );

  let darkestRow = 0;
  let darkestValue = Number.POSITIVE_INFINITY;

  for (let row = sliceHeight; row >= 0; row--) {
    let rowSum = 0;

    for (let col = 0; col < width * 4 - 4; col += 4) {
      const offset = row * width * 4;
      rowSum += imageData.data[offset + col + 0];
      rowSum += imageData.data[offset + col + 1];
      rowSum += imageData.data[offset + col + 2];
    }

    if (darkestValue > rowSum) {
      darkestValue = rowSum;
      darkestRow = row;
    }
  }

  ctx.putImageData(imageData, 0, height - sliceHeight);

  return height - sliceHeight + darkestRow;
}
