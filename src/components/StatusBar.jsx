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
          </span>
        <span className="status-item">Brush: {brushSize === 1 ? '1px' : `${brushSize * 2 - 1}px`}</span>
      </div>
      
      <div className="status-group status-center">
        {hoverCell ? (
          <span className="status-item">
            X: {hoverCell.x} Y: {hoverCell.y}
            </span>
        ) : (
          <span className="status-item">Cursor outside canvas</span>
        )}
      </div>
      
      <div className="status-group status-right">
        <span className="status-item">History: {undoCount}U / {redoCount}R</span>
        <span className="status-item">Grid: {gridSize}x{gridSize}</span>