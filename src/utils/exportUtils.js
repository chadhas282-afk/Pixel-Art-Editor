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
  