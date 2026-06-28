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