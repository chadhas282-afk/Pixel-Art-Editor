import React from 'react';

const GROUPS = [
    {
        label: 'Tools',
        items: [
            { key: 'P', desc: 'Pencil' },
            { key: 'E', desc: 'Eraser' },
            { key: 'G', desc: 'Fill (bucket)' },
            { key: 'I', desc: 'Eyedropper' },
            { key: 'L', desc: 'Line' },
            { key: 'R', desc: 'Rectangle' },
            { key: 'O', desc: 'Ellipse' },
            { key: 'A', desc: 'Spray' },
            { key: 'D', desc: 'Dither' },
            { key: 'S', desc: 'Select' },
        ],
    },
    {
        label: 'History',
        items: [
            { key: '⌘Z', desc: 'Undo' },
            { key: '⌘⇧Z', desc: 'Redo' },
                ],
  },
  {
    label: 'Selection',
    items: [
      { key: '⌘C', desc: 'Copy selection' },
      { key: '⌘X', desc: 'Cut selection' },
      { key: '⌘V', desc: 'Paste' },
      { key: 'Del / ⌫', desc: 'Clear selection' },
      { key: 'Esc', desc: 'Deselect' },
    ],
  },
  {
    label: 'Canvas & View',
    items: [
      { key: 'Scroll ↕', desc: 'Zoom in / out' },
      { key: 'Space+drag', desc: 'Pan canvas' },
      { key: 'Middle drag', desc: 'Pan canvas' },
      { key: '0', desc: 'Reset / fit view' },
      { key: '[ / ]', desc: 'Brush size −/+' },
      { key: 'H', desc: 'Toggle grid' },
    ],
  },
  {
    label: 'Transform',
    items: [
      { key: 'F', desc: 'Flip horizontal' },
      { key: 'V', desc: 'Flip vertical' },
    ],
  },
  {
    label: 'Other',
    items: [
      { key: '?', desc: 'Keyboard shortcuts' },
    ],
  },
];

const KeyboardShortcutsOverlay = ({ onClose }) => (
    <div className="shortcuts-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
    <div className="shortcuts-modal" onClick={e => e.stopPropagation()}>
      <div className="shortcuts-header">
        <h2 className="shortcuts-title">⌨ Keyboard Shortcuts</h2>