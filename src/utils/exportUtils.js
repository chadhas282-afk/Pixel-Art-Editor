export const download = (url, name) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
};

export const exportFramePNG = (frames, currentFrameIndex, gridSize, scale, bgColor) => {
  const tmp = document.createElement('canvas');
  tmp.width = gridSize * scale; 
  tmp.height = gridSize * scale;
  const ctx = tmp.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  
    if (bgColor !== 'transparent') {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, tmp.width, tmp.height);
  }
  
  const frame = frames[currentFrameIndex];
  frame.forEach((color, i) => {
    if (!color) return;
    ctx.fillStyle = color;
    ctx.fillRect((i % gridSize) * scale, Math.floor(i / gridSize) * scale, scale, scale);
  });
  
  download(tmp.toDataURL('image/png'), `frame-${currentFrameIndex + 1}.png`);
};
export const exportSpritesheet = (frames, gridSize, scale, bgColor) => {
  const tmp = document.createElement('canvas');
  tmp.width = gridSize * frames.length * scale; 
  tmp.height = gridSize * scale;
  const ctx = tmp.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  
  if (bgColor !== 'transparent') {