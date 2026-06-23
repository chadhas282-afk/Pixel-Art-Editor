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