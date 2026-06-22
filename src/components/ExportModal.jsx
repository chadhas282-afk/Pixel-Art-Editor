import React, { useState, useEffect, useRef } from 'react';
import { renderFrame } from '../utils/drawingTools';

const ExportModal = ({
  isOpen,
  onClose,
  onExportPNG,
  onExportSpritesheet,
  onExportAllFrames,
  onExportGIF,
  onExportJSON,
    gridSize,
  frames,
  currentFrameIndex,
}) => {
  const [exportType, setExportType] = useState('gif');
  const [scale, setScale] = useState(8);
  const [bgColor, setBgColor] = useState('transparent');
  const [customBgColor, setCustomBgColor] = useState('#ffffff');
  
  const previewCanvasRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !previewCanvasRef.current) return;
    const ctx = previewCanvasRef.current.getContext('2d');