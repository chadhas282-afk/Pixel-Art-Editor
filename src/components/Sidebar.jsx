import React from 'react';
import { GRID_SIZES } from '../App';
import { BUILT_IN_PALETTES } from '../data/palettes';

const TOOLS = [
  { id: 'pencil',     icon: '✏️',  label: 'Pencil',   shortcut: 'P' },
  { id: 'eraser',     icon: '🧹',  label: 'Eraser',   shortcut: 'E' },
  { id: 'fill',       icon: '🪣',  label: 'Fill',     shortcut: 'G' },
  { id: 'eyedropper', icon: '💉',  label: 'Pick',     shortcut: 'I' },