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
        const displayBg = bgColor === 'transparent' ? null : (bgColor === 'custom' ? customBgColor : bgColor);
    renderFrame(ctx, frames[currentFrameIndex], gridSize, displayBg);
  }, [isOpen, frames, currentFrameIndex, gridSize, bgColor, customBgColor]);

  if (!isOpen) return null;

  const handleExport = () => {
    const finalBgColor = bgColor === 'transparent' ? 'transparent' : (bgColor === 'custom' ? customBgColor : bgColor);
    
    switch (exportType) {
      case 'png':
        onExportPNG(scale, finalBgColor);
                break;
      case 'spritesheet':
        onExportSpritesheet(scale, finalBgColor);
        break;
      case 'all':
        onExportAllFrames(scale, finalBgColor);
        break;
      case 'gif':
        onExportGIF(scale, finalBgColor);
        break;
              case 'json':
        onExportJSON();
        break;
      default:
        break;
    }
    onClose();
  };

  return (