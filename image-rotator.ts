import fs from "fs";

type Pixels = number[][];

const readXBytesFromOffsetLE = ({ offset, x }: { offset: number; x: number }, buffer: Buffer) => {
  let num: number = 0;

  for (let i = 0; i < x; i++) {
    const byte = buffer[i + offset];
    num += byte << (i * 8);
  }

  return num;
};

const rotateImage = (image: string) => {
  const imageBuffer = fs.readFileSync(image);

  const offset = readXBytesFromOffsetLE({ x: 4, offset: 10 }, imageBuffer);
  const width = readXBytesFromOffsetLE({ x: 4, offset: 18 }, imageBuffer);
  const bitsPerPixel = readXBytesFromOffsetLE({ x: 2, offset: 28 }, imageBuffer);
  const bytesPerPixel =  bitsPerPixel / 8;

  const dataBytes = imageBuffer.subarray(offset);

  let pixels: Pixels = [];
  const rows: Pixels[] = [];

  for (const [idx, byte] of dataBytes.entries()) {
    if (idx % bytesPerPixel === 0) pixels.push([]);
    pixels[pixels.length - 1].push(byte);
  }

  pixels.forEach((pixel, idx) => {
    if (idx % width === 0) rows.push([]);
    rows[rows.length - 1].push(pixel);
  });

  const newImageRows: Pixels[] = [];

  rows.forEach((row, i) => {
    row.forEach((_, j) => {
      if (!newImageRows[j]) newImageRows.push([]);
      newImageRows[j][i] = rows[i][j];
    });
  });

  newImageRows.reverse();

  const newImage = Buffer.concat([
    imageBuffer.subarray(0, offset),
    Buffer.from(newImageRows.flat().flat()),
  ]);

  fs.writeFileSync("./images/output.bmp", newImage);
};

rotateImage("images/teapot.bmp");
