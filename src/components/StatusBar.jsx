import React from 'react';

const StatusBar = ({
  selectedTool,
  selectedColor,
  brushSize,
  hoverCell,
  zoom,
  undoCount,
  redoCount,
  currentFrameIndex,
  totalFrames,
  gridSize,
}) => {
    return (
    <footer className="status-bar">
      <div className="status-group">
        <span className="status-item tool-info">
          Tool: {selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)}
        </span>
        <span className="status-item color-info">
          <div className="status-color-swatch" style={{ background: selectedColor }} />
          {selectedColor.toUpperCase()}