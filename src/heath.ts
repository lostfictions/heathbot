import fs from "fs";
import path from "path";
import { tmpdir } from "os";

import { createCanvas, loadImage, Image } from "canvas";

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

  const c = createCanvas(small.width, small.height);
  const ctx = c.getContext("2d");
  ctx.quality = "best";

  ctx.drawImage(small, 0, 0);

  const destHeight = (small.width / big.width) * (big.height * 0.1);

  ctx.drawImage(
    big,
    0,
    big.height * 0.9,
    big.width,
    big.height * 0.1,
    0,
    small.height - destHeight,
    small.width,
    destHeight
  );

  filenameIndex += 1;
  const filename = path.join(outDir, `heathcliff_${filenameIndex}.png`);

  const out = fs.createWriteStream(filename);
  const stream = c.createPNGStream();
  stream.pipe(out);

  return new Promise<string>((res, rej) => {
    out.on("finish", () => res(filename));
    out.on("error", e => rej(e));
  });
}

function detectBottom(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): number {
  // TODO: 20% instead of 10
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
