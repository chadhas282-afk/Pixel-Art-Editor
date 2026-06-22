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