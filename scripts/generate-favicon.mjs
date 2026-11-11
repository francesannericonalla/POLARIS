// Generates a 64x64 PNG favicon using pure Node.js (no external deps)
// 4-pointed north-star on a dark maroon circle

import { writeFileSync } from 'fs';
import { createHash } from 'crypto';
import zlib from 'zlib';

const SIZE = 64;

// --- rasterise into RGBA pixel buffer ---
const pixels = new Uint8Array(SIZE * SIZE * 4);

function setPixel(x, y, r, g, b, a) {
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;
  const i = (y * SIZE + x) * 4;
  // alpha-blend over existing
  const srcA = a / 255;
  const dstA = pixels[i + 3] / 255;
  const outA = srcA + dstA * (1 - srcA);
  if (outA === 0) return;
  pixels[i]     = Math.round((r * srcA + pixels[i]     * dstA * (1 - srcA)) / outA);
  pixels[i + 1] = Math.round((g * srcA + pixels[i + 1] * dstA * (1 - srcA)) / outA);
  pixels[i + 2] = Math.round((b * srcA + pixels[i + 2] * dstA * (1 - srcA)) / outA);
  pixels[i + 3] = Math.round(outA * 255);
}

// anti-aliased circle fill
const cx = SIZE / 2, cy = SIZE / 2, cr = SIZE / 2 - 0.5;
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const alpha = Math.max(0, Math.min(1, cr - dist + 0.5));
    if (alpha > 0) {
      // dark maroon base #6B0F1A
      setPixel(x, y, 107, 15, 26, Math.round(alpha * 255));
      // vignette: darken edges
      const vign = Math.max(0, (dist / cr - 0.4) / 0.6);
      setPixel(x, y, 0, 0, 0, Math.round(alpha * vign * 80));
    }
  }
}

// 4-pointed star: point in direction angle, outer/inner radii
function starPoints(outerR, innerR) {
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }
  return pts;
}

// point-in-polygon
function insideStar(px, py, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i].x, yi = pts[i].y, xj = pts[j].x, yj = pts[j].y;
    const intersect = ((yi > py) !== (yj > py)) && (px < ((xj - xi) * (py - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// distance from point to line segment (for AA edges)
function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}

const outerR = SIZE * 0.29, innerR = SIZE * 0.09;
const starPts = starPoints(outerR, innerR);

for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const px = x + 0.5, py = y + 0.5;
    // check distance to circle first
    const distCirc = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
    if (distCirc > cr + 1) continue;

    // min distance to any star edge for AA
    let minEdge = Infinity;
    for (let i = 0; i < starPts.length; i++) {
      const j = (i + 1) % starPts.length;
      const d = distToSegment(px, py, starPts[i].x, starPts[i].y, starPts[j].x, starPts[j].y);
      if (d < minEdge) minEdge = d;
    }

    const inside = insideStar(px, py, starPts);
    const aa = Math.max(0, Math.min(1, inside ? 1 : 1 - (minEdge - 0)));

    if (aa > 0) {
      // gold base #D4AF37, brighter toward top arm
      const northness = Math.max(0, (cy - py) / outerR);
      const rr = Math.round(212 + northness * 43);
      const gg = Math.round(175 + northness * 60);
      const bb = Math.round(55  + northness * 65);
      setPixel(x, y, rr, gg, bb, Math.round(aa * 255));
    }
  }
}

// tiny center dot — bright cream
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const px = x + 0.5, py = y + 0.5;
    const d = Math.hypot(px - cx, py - cy);
    const a = Math.max(0, Math.min(1, 2.2 - d));
    if (a > 0) setPixel(x, y, 255, 243, 176, Math.round(a * 255));
  }
}

// --- encode as PNG ---
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (const b of buf) {
    crc ^= b;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// build raw scanlines (filter byte 0 + RGBA each row)
const raw = Buffer.alloc(SIZE * (1 + SIZE * 4));
for (let y = 0; y < SIZE; y++) {
  raw[y * (1 + SIZE * 4)] = 0; // filter None
  for (let x = 0; x < SIZE; x++) {
    const src = (y * SIZE + x) * 4;
    const dst = y * (1 + SIZE * 4) + 1 + x * 4;
    raw[dst]     = pixels[src];
    raw[dst + 1] = pixels[src + 1];
    raw[dst + 2] = pixels[src + 2];
    raw[dst + 3] = pixels[src + 3];
  }
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0); ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; ihdr[9] = 6; // bit depth 8, RGBA

const compressed = zlib.deflateSync(raw, { level: 9 });

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
  chunk('IHDR', ihdr),
  chunk('IDAT', compressed),
  chunk('IEND', Buffer.alloc(0)),
]);

writeFileSync('src/app/icon.png', png);
console.log('Written: src/app/icon.png');
