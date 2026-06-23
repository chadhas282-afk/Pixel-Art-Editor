import React, { useEffect, useRef, useState, useCallback } from 'react';
import { renderFrame } from '../utils/drawingTools';

const Timeline = ({
  frames, currentFrameIndex, setCurrentFrameIndex,
  addFrame, addBlankFrame, deleteFrame, moveFrame,
  fps, setFps, isPlaying, setIsPlaying,
  GRID_SIZE,
  onionSkinning, setOnionSkinning,
    onionOpacity, setOnionOpacity,
  onionNext, setOnionNext,
  onOpenExportModal,
}) => {
  const previewRef  = useRef(null);
  const thumbRefs   = useRef([]);
  const [playIndex, setPlayIndex] = useState(0);
  useEffect(() => {
    let interval;
    if (isPlaying && frames.length > 1) {
      interval = setInterval(() => setPlayIndex(p => (p + 1) % frames.length), 1000 / fps);
    } else {
      setPlayIndex(currentFrameIndex);