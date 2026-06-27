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
    while (stack.length > 0) {
        const curr = stack.pop();
        if (visited.has(curr)) continue;
        visited.add(curr);
        if (newFrame[curr] !== targetColor) continue;
        newFrame[curr] = fillColor;
        const x = curr % gridSize, y = Math.floor(curr / gridSize);
        if (x > 0) stack.push(curr - 1);
        if (x < gridSize - 1) stack.push(curr + 1);
        if (y > 0) stack.push(curr - gridSize);
        if (y < gridSize - 1) stack.push(curr + gridSize);
    }
    return newFrame;
}

export function getBrushPixels(cx, cy, brushSize, gridSize) {
    const pixels = [];
    const r = brushSize - 1;
    for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
            if (r > 1 && dx * dx + dy * dy > r * r + 0.5) continue;
            const nx = cx + dx, ny = cy + dy;
            if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize)
                pixels.push(ny * gridSize + nx);
        }
    }
    return [...new Set(pixels)];
}

export function applySymmetry(pixels, symmetryMode, gridSize) {
    if (symmetryMode === 'none') return pixels;
    const result = new Set(pixels);
    pixels.forEach(idx => {
        const x = idx % gridSize, y = Math.floor(idx / gridSize);
        const mx = gridSize - 1 - x, my = gridSize - 1 - y;
        if (symmetryMode === 'x' || symmetryMode === 'both') result.add(y * gridSize + mx);
        if (symmetryMode === 'y' || symmetryMode === 'both') result.add(my * gridSize + x);
        if (symmetryMode === 'both') result.add(my * gridSize + mx);
    });
    return [...result];
}

export function getSprayPixels(cx, cy, brushSize, gridSize) {
    const pixels = new Set();
    const r = Math.max(2, brushSize * 2);
    const count = Math.max(6, brushSize * 8);
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * r;
        const nx = cx + Math.round(Math.cos(angle) * dist);
        const ny = cy + Math.round(Math.sin(angle) * dist);
        if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize)
            pixels.add(ny * gridSize + nx);
    }
    return [...pixels];
}

export function getDitherPixels(cx, cy, brushSize, gridSize) {
    const pixels = [];
    const r = brushSize - 1;
    for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
            if (r > 1 && dx * dx + dy * dy > r * r + 0.5) continue;
            const nx = cx + dx, ny = cy + dy;
            if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && (nx + ny) % 2 === 0)
                pixels.push(ny * gridSize + nx);
        }
    }
    return pixels;
}

export function getEllipsePixels(x0, y0, x1, y1, gridSize) {
  const pixels = new Set();
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const rx = Math.abs(x1 - x0) / 2, ry = Math.abs(y1 - y0) / 2;
  if (rx === 0 && ry === 0) { pixels.add(Math.round(cy) * gridSize + Math.round(cx)); return [...pixels]; }
  const addPt = (x, y) => {
    const px = Math.round(x), py = Math.round(y);
    if (px >= 0 && px < gridSize && py >= 0 && py < gridSize)
        pixels.add(py * gridSize + px);
  };
  const steps = Math.max(rx, ry) * Math.PI * 4;
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    addPt(cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry);
  }
  return [...pixels];
}

export function flipFrameH(frame, gridSize) {
  const newFrame = [...frame];
  for (let y = 0; y < gridSize; y++)
    for (let x = 0; x < Math.floor(gridSize / 2); x++) {
      const l = y * gridSize + x, r = y * gridSize + (gridSize - 1 - x);
      [newFrame[l], newFrame[r]] = [newFrame[r], newFrame[l]];
    }
  return newFrame;
}

export function flipFrameV(frame, gridSize) {
  const newFrame = [...frame];
  for (let y = 0; y < Math.floor(gridSize / 2); y++)
    for (let x = 0; x < gridSize; x++) {
      const t = y * gridSize + x, b = (gridSize - 1 - y) * gridSize + x;
      [newFrame[t], newFrame[b]] = [newFrame[b], newFrame[t]];
    }
  return newFrame;
}

export function rotateFrame90(frame, gridSize) {
  const newFrame = new Array(gridSize * gridSize).fill(null);
  for (let y = 0; y < gridSize; y++)
    for (let x = 0; x < gridSize; x++)
      newFrame[x * gridSize + (gridSize - 1 - y)] = frame[y * gridSize + x];
  return newFrame;
}
