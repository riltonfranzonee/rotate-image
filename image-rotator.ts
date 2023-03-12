import fs from "fs";

type Pixels = number[][];

const readXBytesFromOffsetLE = ({
  offset,
  buffer,
  x,
}: {
  offset: number;
  x: number;
  buffer: Buffer;
}) => {
  let num: number = 0;

  for (let i = 0; i < x; i++) {
    const byte = buffer[i + offset];
    num += byte << (i * 8);
  }

  return num;
};

const rotateImage = () => {
  let imageBuffer = fs.readFileSync("images/teapot.bmp");

  const offset = readXBytesFromOffsetLE({ x: 4, offset: 10, buffer: imageBuffer });
  const width = readXBytesFromOffsetLE({ x: 4, offset: 18, buffer: imageBuffer });
  const height = readXBytesFromOffsetLE({ x: 4, offset: 22, buffer: imageBuffer });

  let headerBytes = imageBuffer.subarray(0, offset);
  let dataBytes = imageBuffer.subarray(offset);

  const pixels: Pixels = [];

  let i = 0;
  for (const [, byte] of dataBytes.entries()) {
    if (i % 3 === 0) {
      pixels.push([byte]);
    } else {
      pixels[pixels.length - 1].push(byte);
    }
    i++;
  }

  const rows: Pixels[] = [];

  let j = 0;
  pixels.forEach((pixel) => {
    if (j % height === 0) {
      rows.push([pixel]);
    } else {
      rows[rows.length - 1].push(pixel);
    }
    j++;
  });

  let newRows: Pixels[] = [];

  rows.forEach((row, i) => {
    row.forEach((_, j) => {
      if (!newRows[j]) newRows.push([]);
      newRows[j][i] = rows[i][j];
    });
  });

  newRows.reverse();

  const newImage = Buffer.concat([
    headerBytes,
    Buffer.from(newRows.flat().flat()),
  ]);

  fs.writeFileSync("./images/output.bmp", newImage);
};

rotateImage();
