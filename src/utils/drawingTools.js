export function bresenhamLine(x0, y0, x1, y1, gridSize) {
  const pixels = [];
  let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
  let dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let cx = x0, cy = y0;
  while (true) {
    if (cx >= 0 && cx < gridSize && cy >= 0 && cy < gridSize)
      pixels.push(cy * gridSize + cx);
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; cx += sx; }
    if (e2 <= dx) { err += dx; cy += sy; }
  }
  return pixels;
}

export function getRectPixels(x0, y0, x1, y1, gridSize) {
  const pixels = new Set();
  const minX = Math.max(0, Math.min(x0, x1)), maxX = Math.min(gridSize - 1, Math.max(x0, x1));
  const minY = Math.max(0, Math.min(y0, y1)), maxY = Math.min(gridSize - 1, Math.max(y0, y1));
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
        if (x === minX || x === maxX || y === minY || y === maxY)
        pixels.add(y * gridSize + x);
    }
  }
  return [...pixels];
}

export function getFilledRectPixels(x0, y0, x1, y1, gridSize) {
  const pixels = [];
  const minX = Math.max(0, Math.min(x0, x1)), maxX = Math.min(gridSize - 1, Math.max(x0, x1));
  const minY = Math.max(0, Math.min(y0, y1)), maxY = Math.min(gridSize - 1, Math.max(y0, y1));
  for (let y = minY; y <= maxY; y++)
    for (let x = minX; x <= maxX; x++)
      pixels.push(y * gridSize + x);
  return pixels;
}

export function floodFill(frame, index, fillColor, gridSize) {
  const targetColor = frame[index];
  if (targetColor === fillColor) return frame;
  const newFrame = [...frame];
  const stack = [index];
  const visited = new Set();