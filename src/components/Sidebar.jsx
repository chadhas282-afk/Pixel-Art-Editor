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