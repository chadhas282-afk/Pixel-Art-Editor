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
      <div className="panel-section">
        <div className="section-label">Brush Size</div>
        <div className="brush-size-row">
          {[1, 2, 3, 4, 5].map(size => (
            <button
              key={size}
              className={`brush-size-btn ${brushSize === size ? 'active' : ''}`}
              onClick={() => setBrushSize(size)}
              data-tooltip={`Size ${size} (${size === 1 ? '1px' : `${size * 2 - 1}px`})`}
            >
                <div className="brush-dot" style={{ width: size * 4 + 2, height: size * 4 + 2 }} />
            </button>
          ))}
          <button
            className={`brush-size-btn ${brushSize > 5 ? 'active' : ''}`}
            onClick={() => setBrushSize(8)}
            data-tooltip="Large brush (8px)"
            style={{ fontSize: 10 }}
          >
            XL
          </button>
          </div>
      </div>

      <div className="panel-section">
        <div className="section-label">Symmetry</div>
        <div className="symmetry-row">
          {SYMMETRY_OPTIONS.map(opt => (
            <button
              key={opt.id}
              className={`symmetry-btn ${symmetryMode === opt.id ? 'active' : ''}`}
              onClick={() => setSymmetryMode(opt.id)}
              data-tooltip={opt.tip}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="panel-section">
        <div className="section-label">Actions</div>
        <div className="action-row">
            <button className="action-btn" onClick={undo} disabled={!canUndo} data-tooltip="Undo (⌘Z)">↩ Undo</button>
          <button className="action-btn" onClick={redo} disabled={!canRedo} data-tooltip="Redo (⌘⇧Z)">↪ Redo</button>
        </div>
        <button className="action-btn action-btn--danger" style={{ width: '100%', marginTop: 5 }} onClick={clearCanvas}>
          🗑 Clear Frame
        </button>
      </div>

      <div className="panel-section">
        <div className="section-label">Color</div>
        <div className="color-swatch-large" style={{ background: selectedColor }}>
          <input type="color" value={selectedColor} onChange={e => setSelectedColor(e.target.value)} />
        </div>
        <div className="color-hex-display">
          <div className="color-preview-dot" style={{ background: selectedColor }} />
          <input
            className="color-hex-input"
            value={selectedColor}
            onChange={e => {
              const v = e.target.value;
              if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setSelectedColor(v);
            }}
            spellCheck={false}
          />
        </div>
      </div>
      {recentColors.length > 0 && (
        <div className="panel-section">
          <div className="section-label">Recent</div>
          <div className="palette-grid">
            {recentColors.map((color, i) => (
                <div
                key={i}
                className={`palette-color ${selectedColor === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
                data-tooltip={color.toUpperCase()}
              />
            ))}
          </div>
        </div>
      )}
            <div className="panel-section palette-panel-section">
        <div className="section-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Palette
          <select 
            className="grid-size-select" 
            style={{ width: 'auto', padding: '2px 16px 2px 4px', fontSize: 9, minWidth: 60 }}
            onChange={e => {
              if (e.target.value === 'custom') return;
              const p = BUILT_IN_PALETTES.find(x => x.id === e.target.value);
              if (p && confirm(`Load "${p.name}" palette? Current colors will be replaced.`)) {
                setPalette(p.colors);
              }
              e.target.value = 'default';
            }}
            defaultValue="default"