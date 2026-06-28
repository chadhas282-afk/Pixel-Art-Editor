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
