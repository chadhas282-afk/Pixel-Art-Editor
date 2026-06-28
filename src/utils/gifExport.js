function lzwEncode(indexStream, colorDepth) {
  const clearCode = 1 << colorDepth;
  const eofCode = clearCode + 1;
  let codeSize = colorDepth + 1;
  let maxCode = 1 << codeSize;
  const table = new Map();
  const output = [];
  let buf = 0, bufBits = 0;