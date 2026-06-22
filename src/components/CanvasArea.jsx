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