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