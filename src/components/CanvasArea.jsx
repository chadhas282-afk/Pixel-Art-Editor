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
    }, [brushSize, symmetryMode, GRID_SIZE, selectedColor, applyPixels, paintFrame]);

  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    const onWheel = (e) => {
      e.preventDefault();
      const { zoom: z, panX: px, panY: py } = viewRef.current;
      const rect = area.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.15 : 0.87;
      const newZoom = Math.max(0.25, Math.min(20, z * factor));
      setPanX(px + (relX - px) * (1 - newZoom / z));
      setPanY(py + (relY - py) * (1 - newZoom / z));
      setZoom(newZoom);
      };
    area.addEventListener('wheel', onWheel, { passive: false });
    return () => area.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    const dn = (e) => { if (e.code === 'Space' && e.target.tagName !== 'INPUT') { e.preventDefault(); setSpaceDown(true); } };
    const up = (e) => { if (e.code === 'Space') setSpaceDown(false); };
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up); };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (!selection) return;
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
      const { x1, y1, x2, y2 } = selection;
      const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
      const w = maxX - minX + 1, h = maxY - minY + 1;

      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'x')) {
        e.preventDefault();
        const data = [];
        for (let dy = 0; dy < h; dy++)
          for (let dx = 0; dx < w; dx++)
        data.push(frame[(minY + dy) * GRID_SIZE + (minX + dx)] ?? null);
        setClipboard({ data, width: w, height: h });
        if (e.key === 'x') {
          const next = [...frame];
          for (let dy = 0; dy < h; dy++)
            for (let dx = 0; dx < w; dx++)
              next[(minY + dy) * GRID_SIZE + (minX + dx)] = null;
          commitFrame(next);
          setSelection(null);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboard) {
        e.preventDefault();
        const next = [...frame];
        for (let dy = 0; dy < clipboard.height; dy++)
          for (let dx = 0; dx < clipboard.width; dx++) {
            const c = clipboard.data[dy * clipboard.width + dx];
            const tx = minX + dx, ty = minY + dy;
            if (c && tx >= 0 && tx < GRID_SIZE && ty >= 0 && ty < GRID_SIZE)
              next[ty * GRID_SIZE + tx] = c;
          }
        commitFrame(next);
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const next = [...frame];
        for (let dy = 0; dy < h; dy++)
          for (let dx = 0; dx < w; dx++)
            next[(minY + dy) * GRID_SIZE + (minX + dx)] = null;
        commitFrame(next);
        setSelection(null);
      }
      if (e.key === 'Escape') setSelection(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selection, frame, clipboard, GRID_SIZE, setClipboard, commitFrame]);

  const handleMouseDown = useCallback((e) => {
    if (e.button === 1 || (e.button === 0 && spaceDown)) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY, panX, panY };
      return;
    }
    if (e.button !== 0) return;
    e.preventDefault();

    const cell = getCell(e);
    if (!cell) return;
    const { x, y, index } = cell;

    isDrawingRef.current = true;

    switch (selectedTool) {
      case 'eyedropper': {
        const c = frame[index];
        if (c) { setSelectedColor(c); addRecentColor(c); }
        isDrawingRef.current = false;
        return;
      }
      case 'fill': {
        const filled = floodFill(frame, index, selectedColor, GRID_SIZE);
        commitFrame(filled);
        addRecentColor(selectedColor);
        isDrawingRef.current = false;
        return;
      }
      case 'line': case 'rectangle': case 'ellipse':
        setStartCell({ x, y });
        return;
      case 'select':
        setSelection({ x1: x, y1: y, x2: x, y2: y });
        return;
      default:
        strokeFrameRef.current = [...frame];
        paintAt(cell, selectedTool);
    }
  }, [spaceDown, panX, panY, getCell, selectedTool, frame, selectedColor, setSelectedColor, addRecentColor, GRID_SIZE, commitFrame, paintAt]);

  const handleMouseMove = useCallback((e) => {
    if (isPanning && panStartRef.current) {
      setPanX(panStartRef.current.panX + (e.clientX - panStartRef.current.x));
      setPanY(panStartRef.current.panY + (e.clientY - panStartRef.current.y));
      return;
    }
    const cell = getCell(e);
    setHoverCell(cell);
    if (!isDrawingRef.current || !cell) return;
    const { x, y } = cell;

    switch (selectedTool) {
      case 'pencil': case 'eraser': case 'spray': case 'dither':
        paintAt(cell, selectedTool);
        break;
      case 'line':
        if (startCell) setPreviewPixels(bresenhamLine(startCell.x, startCell.y, x, y, GRID_SIZE));
        break;
      case 'rectangle':
        if (startCell) setPreviewPixels(e.shiftKey