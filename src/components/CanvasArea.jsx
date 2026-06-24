import React, {
  useState, useRef, useEffect, useCallback, useLayoutEffect,
} from 'react';
import {
  bresenhamLine, getRectPixels, getFilledRectPixels,
  getEllipsePixels, floodFill,
    getBrushPixels, applySymmetry, getSprayPixels, getDitherPixels,
} from '../utils/drawingTools';

const BASE_PX = 20;

const CanvasArea = ({
  frame, frames, currentFrameIndex,
  paintFrame, commitFrame,
  selectedTool, selectedColor, setSelectedColor,
    GRID_SIZE,
  showGrid, setShowGrid,
  brushSize, symmetryMode,
  onionSkinning, onionOpacity, onionNext,
  addRecentColor,
  clipboard, setClipboard,
    onHoverCellChange, onZoomChange,
}) => {
  const CANVAS_PX = GRID_SIZE * BASE_PX;
  const [zoom, setZoom]   = useState(1);
  const [panX, setPanX]   = useState(0);
  const [panY, setPanY]   = useState(0);
    const viewRef = useRef({ zoom: 1, panX: 0, panY: 0 });
  viewRef.current = { zoom, panX, panY }; 
  const [isPanning,    setIsPanning]    = useState(false);
  const [spaceDown,    setSpaceDown]    = useState(false);
  const panStartRef    = useRef(null); 
    const strokeFrameRef = useRef(null);  
  const isDrawingRef   = useRef(false);

  const [startCell,     setStartCell]     = useState(null);
  const [previewPixels, setPreviewPixels] = useState([]);
  const [hoverCell,     setHoverCell]     = useState(null);

  const [selection, setSelection] = useState(null);
  useEffect(() => {
    if (onHoverCellChange) onHoverCellChange(hoverCell);
  }, [hoverCell, onHoverCellChange]);
  useEffect(() => {
    if (onZoomChange) onZoomChange(zoom);
      }, [zoom, onZoomChange]);
  const canvasRef = useRef(null);
  const areaRef   = useRef(null);
  useLayoutEffect(() => {
    if (!areaRef.current) return;
    const { width, height } = areaRef.current.getBoundingClientRect();
    const availW = width - 80, availH = height - 80;
        const fitZoom = Math.max(0.5, Math.min(8, Math.floor(Math.min(availW, availH) / CANVAS_PX * 4) / 4));
    const iz = fitZoom;
    setPanX((width  - CANVAS_PX * iz) / 2);
    setPanY((height - CANVAS_PX * iz) / 2);
    setZoom(iz);
    setPreviewPixels([]);
    setSelection(null);
        setHoverCell(null);
  }, [GRID_SIZE, CANVAS_PX]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const C = BASE_PX;

    ctx.clearRect(0, 0, CANVAS_PX, CANVAS_PX);
        for (let y = 0; y < GRID_SIZE; y++)
      for (let x = 0; x < GRID_SIZE; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#c0c0c4' : '#e8e8ec';
        ctx.fillRect(x * C, y * C, C, C);
      }
    if (onionSkinning && currentFrameIndex > 0) {
      const prev = frames[currentFrameIndex - 1];
      ctx.globalAlpha = onionOpacity;
      ctx.fillStyle = '#ff4466';
            prev.forEach((color, i) => {
        if (!color) return;
        const x = i % GRID_SIZE, y = Math.floor(i / GRID_SIZE);
        ctx.fillStyle = color;
        ctx.fillRect(x * C, y * C, C, C);
      });
      ctx.fillStyle = `rgba(255,60,60,${onionOpacity * 0.25})`;
      ctx.fillRect(0, 0, CANVAS_PX, CANVAS_PX);
      ctx.globalAlpha = 1;
    }
        if (onionNext && currentFrameIndex < frames.length - 1) {
      const next = frames[currentFrameIndex + 1];
      ctx.globalAlpha = onionOpacity;
      next.forEach((color, i) => {
        if (!color) return;
        const x = i % GRID_SIZE, y = Math.floor(i / GRID_SIZE);
        ctx.fillStyle = color;
        ctx.fillRect(x * C, y * C, C, C);
      });
      ctx.fillStyle = `rgba(60,60,255,${onionOpacity * 0.25})`;
      ctx.fillRect(0, 0, CANVAS_PX, CANVAS_PX);
      ctx.globalAlpha = 1;
    }
     if (onionNext && currentFrameIndex < frames.length - 1) {
      const next = frames[currentFrameIndex + 1];
      ctx.globalAlpha = onionOpacity;
      next.forEach((color, i) => {
        if (!color) return;
        const x = i % GRID_SIZE, y = Math.floor(i / GRID_SIZE);
        ctx.fillStyle = color;
        ctx.fillRect(x * C, y * C, C, C);
      });
      ctx.fillStyle = `rgba(60,60,255,${onionOpacity * 0.25})`;
      ctx.fillRect(0, 0, CANVAS_PX, CANVAS_PX);
      ctx.globalAlpha = 1;
    }
    frame.forEach((color, i) => {
      if (!color) return;
      ctx.fillStyle = color;
      const x = i % GRID_SIZE, y = Math.floor(i / GRID_SIZE);
      ctx.fillRect(x * C, y * C, C, C);
    });
    if (showGrid && BASE_PX * zoom >= 4) {
      ctx.strokeStyle = 'rgba(0,0,0,0.09)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= GRID_SIZE; x++) {
        ctx.beginPath(); ctx.moveTo(x * C, 0); ctx.lineTo(x * C, CANVAS_PX); ctx.stroke();
      }
      for (let y = 0; y <= GRID_SIZE; y++) {
        ctx.beginPath(); ctx.moveTo(0, y * C); ctx.lineTo(CANVAS_PX, y * C); ctx.stroke();
      }
    }
        if (previewPixels.length > 0) {
      ctx.globalAlpha = 0.75;
      previewPixels.forEach(i => {
        ctx.fillStyle = selectedColor;
        ctx.fillRect((i % GRID_SIZE) * C, Math.floor(i / GRID_SIZE) * C, C, C);
      });
      ctx.globalAlpha = 1;
    }
    if (hoverCell && !isPanning) {
      const { x: hx, y: hy } = hoverCell;
      let previewSet;
            if (['pencil', 'eraser', 'spray', 'dither'].includes(selectedTool)) {
        const bp = getBrushPixels(hx, hy, brushSize, GRID_SIZE);
        previewSet = applySymmetry(bp, symmetryMode, GRID_SIZE);
      } else {
        previewSet = [hy * GRID_SIZE + hx];
      }
      previewSet.forEach(i => {
        const x = i % GRID_SIZE, y = Math.floor(i / GRID_SIZE);
        ctx.fillStyle = selectedTool === 'eraser'
          ? 'rgba(255,80,80,0.4)'
          : selectedColor + '77';
                  ctx.fillRect(x * C, y * C, C, C);
        ctx.strokeStyle = 'rgba(255,255,255,0.65)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x * C + 0.5, y * C + 0.5, C - 1, C - 1);
      });
    }
    if (selection) {
      const { x1, y1, x2, y2 } = selection;
      const sx = Math.min(x1, x2) * C, sy = Math.min(y1, y2) * C;
      const sw = (Math.abs(x2 - x1) + 1) * C, sh = (Math.abs(y2 - y1) + 1) * C;
      ctx.setLineDash([5, 3]);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(sx + 0.75, sy + 0.75, sw - 1.5, sh - 1.5);
      ctx.strokeStyle = '#000000';
      ctx.lineDashOffset = 5;
            ctx.strokeRect(sx + 0.75, sy + 0.75, sw - 1.5, sh - 1.5);
      ctx.setLineDash([]); ctx.lineDashOffset = 0;
    }
    if (symmetryMode !== 'none') {
      ctx.save();
      ctx.strokeStyle = 'rgba(108,99,255,0.45)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 3]);
      const mid = CANVAS_PX / 2;
            if (symmetryMode === 'x' || symmetryMode === 'both') {
        ctx.beginPath(); ctx.moveTo(mid, 0); ctx.lineTo(mid, CANVAS_PX); ctx.stroke();
      }
      if (symmetryMode === 'y' || symmetryMode === 'both') {
        ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(CANVAS_PX, mid); ctx.stroke();
      }
      ctx.setLineDash([]); ctx.restore();
    }
  }, [
        frame, frames, currentFrameIndex, showGrid, previewPixels, hoverCell, selection,
    GRID_SIZE, CANVAS_PX, selectedColor, selectedTool, brushSize, symmetryMode,
    onionSkinning, onionOpacity, onionNext, isPanning, zoom,
  ]);

  const getCell = useCallback((e) => {
    if (!areaRef.current) return null;
    const { zoom: z, panX: px, panY: py } = viewRef.current;
    const rect = areaRef.current.getBoundingClientRect();
    const cx = Math.floor(((e.clientX - rect.left - px) / z) / BASE_PX);
    const cy = Math.floor(((e.clientY - rect.top  - py) / z) / BASE_PX);
    if (cx < 0 || cx >= GRID_SIZE || cy < 0 || cy >= GRID_SIZE) return null;
    return { x: cx, y: cy, index: cy * GRID_SIZE + cx };
  }, [GRID_SIZE]);

  const applyPixels = useCallback((frame, indices, tool, color) => {
    const next = [...frame];
    indices.forEach(i => {
      if (i < 0 || i >= next.length) return;
      next[i] = tool === 'eraser' ? null : color;
    });
    return next;
  }, []);

  const paintAt = useCallback((cell, tool) => {
    if (!cell || !strokeFrameRef.current) return;
    const { x, y } = cell;
    let pixels;
    if (tool === 'spray')  pixels = getSprayPixels(x, y, brushSize, GRID_SIZE);
    else if (tool === 'dither') pixels = getDitherPixels(x, y, brushSize, GRID_SIZE);
    else pixels = getBrushPixels(x, y, brushSize, GRID_SIZE);
    const all = applySymmetry(pixels, symmetryMode, GRID_SIZE);
    const next = applyPixels(strokeFrameRef.current, all, tool, selectedColor);
    strokeFrameRef.current = next;
    paintFrame(next);