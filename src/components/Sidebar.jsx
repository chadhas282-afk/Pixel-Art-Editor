import React from 'react';
import { GRID_SIZES } from '../App';
import { BUILT_IN_PALETTES } from '../data/palettes';

const TOOLS = [
  { id: 'pencil',     icon: '✏️',  label: 'Pencil',   shortcut: 'P' },
  { id: 'eraser',     icon: '🧹',  label: 'Eraser',   shortcut: 'E' },
  { id: 'fill',       icon: '🪣',  label: 'Fill',     shortcut: 'G' },
  { id: 'eyedropper', icon: '💉',  label: 'Pick',     shortcut: 'I' },
  { id: 'line',       icon: '╱',   label: 'Line',     shortcut: 'L' },
  { id: 'rectangle',  icon: '▭',   label: 'Rect',     shortcut: 'R' },
  { id: 'ellipse',    icon: '◯',   label: 'Ellipse',  shortcut: 'O' },
  { id: 'spray',      icon: '✦',   label: 'Spray',    shortcut: 'A' },
  { id: 'dither',     icon: '░',   label: 'Dither',   shortcut: 'D' },
  { id: 'select',     icon: '⬚',   label: 'Select',   shortcut: 'S' },
];

const SYMMETRY_OPTIONS = [
  { id: 'none',  label: '✕',  tip: 'No symmetry' },
  { id: 'x',    label: '↔',  tip: 'Mirror horizontal' },
  { id: 'y',    label: '↕',  tip: 'Mirror vertical' },
  { id: 'both', label: '✦',  tip: 'Mirror both axes' },
];

const Sidebar = ({
  selectedTool, setSelectedTool,
  selectedColor, setSelectedColor,
  palette, setPalette,
  recentColors,
  undo, redo, canUndo, canRedo,
  clearCanvas,
  brushSize, setBrushSize,
  symmetryMode, setSymmetryMode,
  gridSize, onGridSizeChange,
}) => {
  const handleAddColor = () => {
    if (!palette.includes(selectedColor))
      setPalette(prev => [...prev, selectedColor]);
  };
  const handleRemoveColor = (color) => setPalette(prev => prev.filter(c => c !== color));

  return (
    <aside className="sidebar panel" style={{ overflowY: 'auto', scrollBehavior: 'smooth' }}>
      <div className="panel-section">
        <div className="section-label">Tools</div>
        <div className="tools-grid">
          {TOOLS.map(tool => (
            <button
              key={tool.id}
              className={`tool-btn ${selectedTool === tool.id ? 'active' : ''}`}
              onClick={() => setSelectedTool(tool.id)}
              data-tooltip={`${tool.label} (${tool.shortcut})`}
            >
              <span className="tool-icon">{tool.icon}</span>
              <span className="tool-name">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>