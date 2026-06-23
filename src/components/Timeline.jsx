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
      if (canvas) renderFrame(canvas.getContext('2d'), frame, GRID_SIZE, '#ffffff');
    });
  }, [frames, GRID_SIZE]);
  return (
    <aside className="timeline panel panel--right">
      <div className="panel-section">
        <div className="section-label">Preview</div>
        <div className="preview-box">
          <canvas
            ref={previewRef}
            width={GRID_SIZE} height={GRID_SIZE}
            className="preview-canvas"
          />
          {isPlaying && (
            <span className="preview-live-badge">● LIVE</span>
          )}
        </div>
      </div>
      <div className="panel-section">
        <div className="section-label">Playback</div>
        <div className="playback-controls"></div>