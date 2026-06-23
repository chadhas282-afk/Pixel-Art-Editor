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
      }
    return () => clearInterval(interval);
  }, [isPlaying, fps, frames.length, currentFrameIndex]);
  useEffect(() => {
    const frame = isPlaying ? frames[playIndex] : frames[currentFrameIndex];
    if (frame) renderFrame(previewRef.current?.getContext('2d'), frame, GRID_SIZE, '#ffffff');
  }, [frames, currentFrameIndex, playIndex, isPlaying, GRID_SIZE]);
  useEffect(() => {
    frames.forEach((frame, i) => {
      const canvas = thumbRefs.current[i];