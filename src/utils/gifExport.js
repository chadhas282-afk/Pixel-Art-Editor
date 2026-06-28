function lzwEncode(indexStream, colorDepth) {
  const clearCode = 1 << colorDepth;
  const eofCode = clearCode + 1;
  let codeSize = colorDepth + 1;
  let maxCode = 1 << codeSize;
  const table = new Map();
  const output = [];
  let buf = 0, bufBits = 0;
  const emit = (code) => {
    buf |= code << bufBits;
    bufBits += codeSize;
    while (bufBits >= 8) { output.push(buf & 0xff); buf >>= 8; bufBits -= 8; }
  };
  const reset = () => {
    table.clear();
    codeSize = colorDepth + 1;
    maxCode = 1 << codeSize;
    for (let i = 0; i < clearCode; i++) table.set(String(i), i);
  };
  reset();
  emit(clearCode);
  let prefix = '';
  for (let i = 0; i < indexStream.length; i++) {
    const k = String(indexStream[i]);
    const pk = prefix ? prefix + ',' + k : k;
    if (table.has(pk)) { prefix = pk; continue; }
    emit(table.get(prefix !== '' ? prefix : k));
    const nextCode = table.size;
    if (nextCode < 4096) { table.set(pk, nextCode); }
    if (nextCode >= maxCode && codeSize < 12) { codeSize++; maxCode <<= 1; }
    if (nextCode >= 4096) { emit(clearCode); reset(); }
    prefix = k;
  }
  if (prefix !== '') emit(table.get(prefix));
  emit(eofCode);
  if (bufBits > 0) output.push(buf & 0xff);
  return output;
}

function writeSubBlocks(bytes) {
  const out = [];
  let i = 0;
  while (i < bytes.length) {
    const len = Math.min(255, bytes.length - i);
    out.push(len);
    for (let j = 0; j < len; j++) out.push(bytes[i++]);
  }
  out.push(0);
  return out;
}

function quantizeFrame(frame, bgColor) {
  const colorMap = new Map();
  const transparent = bgColor === 'transparent';
  if (transparent) {
    colorMap.set('transparent', 0);
  } else {
    colorMap.set(bgColor.toLowerCase(), 0);
  }
  let nextIndex = 1;

  const indices = frame.map(color => {
    if (!color) return 0;
    const key = color.toLowerCase();
    if (!colorMap.has(key)) {
      if (nextIndex < 256) colorMap.set(key, nextIndex++);
      else return colorMap.get(key) ?? 0;
    }
    return colorMap.get(key);
  });

  const numColors = Math.max(2, nextIndex);
  let colorDepth = 1;
  while ((1 << colorDepth) < numColors) colorDepth++;
  const paletteSize = 1 << colorDepth;
  const palette = new Uint8Array(paletteSize * 3);

  if (transparent) {
    palette[0] = 0; palette[1] = 0; palette[2] = 0;
  } else {
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    palette[0] = r; palette[1] = g; palette[2] = b;
  }

  colorMap.forEach((idx, key) => {
    if (idx === 0) return;
    if (key === 'transparent') return;
    const r = parseInt(key.slice(1, 3), 16);
    const g = parseInt(key.slice(3, 5), 16);
    const b = parseInt(key.slice(5, 7), 16);
    palette[idx * 3] = r; palette[idx * 3 + 1] = g; palette[idx * 3 + 2] = b;
  });

  return { indices, palette, colorDepth };
}

function hexToRGB(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

export function encodeGIF(frames, gridSize, fps, scale = 4, bgColor = 'transparent') {
  const w = gridSize * scale;
  const h = gridSize * scale;
  const delay = Math.round(100 / fps);
  const transparent = bgColor === 'transparent';
  const bytes = [];

  const push = (...vals) => bytes.push(...vals);
  const pushStr = (s) => { for (let i = 0; i < s.length; i++) bytes.push(s.charCodeAt(i)); };
  const pushU16LE = (v) => { bytes.push(v & 0xff, (v >> 8) & 0xff); };
  pushStr('GIF89a');
  const globalColorSet = new Set();
  frames.forEach(frame => frame.forEach(c => { if (c) globalColorSet.add(c.toLowerCase()); }));
  const globalColors = [...globalColorSet].slice(0, 255);
  const globalColorMap = new Map();
  if (transparent) { globalColorMap.set('transparent', 0); }
  else { globalColorMap.set(bgColor.toLowerCase(), 0); }
  globalColors.forEach((c, i) => globalColorMap.set(c, i + 1));

  let gColorDepth = 1;
  while ((1 << gColorDepth) < globalColorMap.size + 1) gColorDepth++;
  const gPaletteSize = 1 << gColorDepth;
  const gPalette = new Uint8Array(gPaletteSize * 3);
  globalColorMap.forEach((idx, key) => {
    if (idx === 0 || key === 'transparent') return;
    const [r, g, b] = hexToRGB(key);
    gPalette[idx * 3] = r; gPalette[idx * 3 + 1] = g; gPalette[idx * 3 + 2] = b;
  });
  pushU16LE(w); pushU16LE(h);
  const packed = 0x80 | ((gColorDepth - 1) << 4) | (gColorDepth - 1);
  push(packed, 0, 0); 
  for (let i = 0; i < gPalette.length; i++) push(gPalette[i]);
  pushStr('\x21\xff\x0bNETSCAPE2.0');
  push(3, 1); pushU16LE(0); push(0);
  frames.forEach(frame => {
    const indexStream = new Array(w * h);
    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const gx = Math.floor(px / scale);
        const gy = Math.floor(py / scale);
        const cell = frame[gy * gridSize + gx];
        const key = cell ? cell.toLowerCase() : 'transparent';
        const idx = globalColorMap.has(key) ? globalColorMap.get(key) : 0;
        indexStream[py * w + px] = idx;
      }
    }

    push(0x21, 0xf9, 0x04);
    const disposeMethod = transparent ? 2 : 0;
    push((disposeMethod << 2) | (transparent ? 1 : 0));
    pushU16LE(delay);
    push(transparent ? 0 : 0, 0);
    push(0x2c);
    pushU16LE(0); pushU16LE(0); pushU16LE(w); pushU16LE(h);
    push(0);
    push(Math.max(2, gColorDepth));
    const lzw = lzwEncode(indexStream, Math.max(2, gColorDepth));
    const subBlocks = writeSubBlocks(lzw);
    bytes.push(...subBlocks);
  });

  push(0x3b);

  return new Uint8Array(bytes);
}

export function downloadGIF(frames, gridSize, fps, scale = 4, bgColor = 'transparent', filename = 'animation.gif') {
  const data = encodeGIF(frames, gridSize, fps, scale, bgColor);
  const blob = new Blob([data], { type: 'image/gif' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
