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
