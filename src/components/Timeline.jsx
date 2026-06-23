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
        <button className="playback-btn" onClick={() => { setCurrentFrameIndex(0); setIsPlaying(false); }} data-tooltip="First">⏮</button>
          <button className="playback-btn" onClick={() => setCurrentFrameIndex(i => Math.max(0, i - 1))} data-tooltip="Prev">⏪</button>
          <button className={`playback-btn ${isPlaying ? 'playing' : ''}`} onClick={() => setIsPlaying(p => !p)} style={{ flex: 2 }}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button className="playback-btn" onClick={() => setCurrentFrameIndex(i => Math.min(frames.length - 1, i + 1))} data-tooltip="Next">⏩</button>
          <button className="playback-btn" onClick={() => { setCurrentFrameIndex(frames.length - 1); setIsPlaying(false); }} data-tooltip="Last">⏭</button>
        </div>
        <div style={{ marginTop: 10 }}>
          <div className="fps-row">
            <span className="fps-label">Speed</span>
            <span className="fps-value">{fps} FPS</span>
             </div>
          <input type="range" min="1" max="30" value={fps} onChange={e => setFps(parseInt(e.target.value))} />
        </div>
      </div>
      <div className="panel-section">
        <div className="section-label">Onion Skin</div>
        <div className="onion-controls">
          <label className="toggle-row">
            <input type="checkbox" checked={onionSkinning} onChange={e => setOnionSkinning(e.target.checked)} />
            <span className="toggle-label">Prev frame</span>
            <span className="toggle-badge" style={{ background: 'rgba(255,60,60,0.25)', color: '#ff6b6b' }}>●</span>
          </label>
          <label className="toggle-row">
            <input type="checkbox" checked={onionNext} onChange={e => setOnionNext(e.target.checked)} />
            <span className="toggle-label">Next frame</span>
            <span className="toggle-badge" style={{ background: 'rgba(60,60,255,0.25)', color: '#6b9bff' }}>●</span>
          </label>
        </div>
        {(onionSkinning || onionNext) && (
          <div style={{ marginTop: 8 }}>
            <div className="fps-row">
              <span className="fps-label">Opacity</span>
              <span className="fps-value">{Math.round(onionOpacity * 100)}%</span>
            </div>
            <input type="range" min="5" max="80" value={Math.round(onionOpacity * 100)}
              onChange={e => setOnionOpacity(e.target.value / 100)} />
          </div>
        )}
      </div>
      <div className="panel-section" style={{ flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span className="section-label" style={{ marginBottom: 0 }}>
            Frames <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-light)' }}>
              {currentFrameIndex + 1}/{frames.length}
            </span>
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="action-btn" style={{ padding: '4px 8px', fontSize: 10 }} onClick={addBlankFrame} data-tooltip="Add blank frame">
              + Blank
            </button>