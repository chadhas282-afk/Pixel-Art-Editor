import React, { useState, useCallback, useEffect, useRef } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import CanvasArea from './components/CanvasArea';
import Timeline from './components/Timeline';
import KeyboardShortcutsOverlay from './components/KeyboardShortcutsOverlay';
import StatusBar from './components/StatusBar';
import ExportModal from './components/ExportModal';
import { flipFrameH, flipFrameV } from './utils/drawingTools';
import { exportFramePNG, exportSpritesheet, exportAllFrames, exportJSON } from './utils/exportUtils';
import { useAutoSave } from './hooks/useAutoSave';
import { useToast } from './components/Toast';

export const GRID_SIZES = [8, 16, 32, 48, 64];
const DEFAULT_GRID_SIZE = 16;
const MAX_HISTORY = 80;

const DEFAULT_PALETTE = [
  '#1a1a2e', '#16213e', '#0f3460', '#533483',
  '#e94560', '#ff6b6b', '#ffd93d', '#6bcb77',
  '#4d96ff', '#00d4ff', '#ffffff', '#c8c8d4',