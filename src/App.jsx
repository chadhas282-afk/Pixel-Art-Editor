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
  '#8b85ff', '#f72585', '#7209b7', '#3a0ca3',
  '#ff9f1c', '#2ec4b6', '#e71d36', '#011627',
];

export function createEmptyFrame(gridSize = DEFAULT_GRID_SIZE) {
  return new Array(gridSize * gridSize).fill(null);
}

const TOOL_KEYS = {
  p: 'pencil', e: 'eraser', g: 'fill', i: 'eyedropper',
  l: 'line', r: 'rectangle', o: 'ellipse', a: 'spray',
  d: 'dither', s: 'select',
};

function App() {
  const { addToast } = useToast();

  const [projectName, setProjectName] = useState('Untitled Project');
  const [gridSize, setGridSize]   = useState(DEFAULT_GRID_SIZE);
  const [frames, setFrames]       = useState([createEmptyFrame(DEFAULT_GRID_SIZE)]);
  const [currentFrameIndex, setCFI] = useState(0);
  const [history, setHistory]         = useState([[createEmptyFrame(DEFAULT_GRID_SIZE)]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const historyRef = useRef({ history: [[createEmptyFrame(DEFAULT_GRID_SIZE)]], index: 0 });
  const [selectedTool,  setSelectedTool]  = useState('pencil');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [palette,  setPalette]  = useState(DEFAULT_PALETTE);
  const [recentColors, setRecentColors] = useState([]);
  const [brushSize,     setBrushSize]     = useState(1);
  const [symmetryMode,  setSymmetryMode]  = useState('none');
  const [fps,       setFps]       = useState(8);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGrid,      setShowGrid]      = useState(true);
  const [onionSkinning, setOnionSkinning] = useState(false);
  const [onionOpacity,  setOnionOpacity]  = useState(0.3);
  const [onionNext,     setOnionNext]     = useState(false);
  const [hoverCell, setHoverCell] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [clipboard,      setClipboard]      = useState(null);
  const [showShortcuts,  setShowShortcuts]  = useState(false);
  const { saveNow, clearSave } = useAutoSave(
    { projectName, frames, gridSize, fps, palette, selectedColor, selectedTool },
    useCallback((saved) => {
      if (saved.frames) setFrames(saved.frames);
      if (saved.gridSize) setGridSize(saved.gridSize);
      if (saved.fps) setFps(saved.fps);
      if (saved.palette) setPalette(saved.palette);
      if (saved.projectName) setProjectName(saved.projectName);
      if (saved.selectedColor) setSelectedColor(saved.selectedColor);
      if (saved.selectedTool) setSelectedTool(saved.selectedTool);
      
      setHistory([saved.frames]);
      setHistoryIndex(0);
      historyRef.current = { history: [saved.frames], index: 0 };
      
      addToast('Restored previous session', 'info');
    }, [addToast])
  );

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const tmp = document.createElement('canvas');
        tmp.width = gridSize;
        tmp.height = gridSize;
        const ctx = tmp.getContext('2d');
        ctx.drawImage(img, 0, 0, gridSize, gridSize);
        const imgData = ctx.getImageData(0, 0, gridSize, gridSize).data;
              
        const newFrame = new Array(gridSize * gridSize).fill(null);
        for (let i = 0; i < gridSize * gridSize; i++) {
          const r = imgData[i * 4];
          const g = imgData[i * 4 + 1];
          const b = imgData[i * 4 + 2];
          const a = imgData[i * 4 + 3];
          if (a > 128) {
            newFrame[i] = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
          }
        }
        commitFrame(newFrame);
        addToast('Image imported successfully', 'success');
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };
  const addRecentColor = useCallback((c) => {
    setRecentColors(prev => {
      const filtered = prev.filter(x => x !== c);
      return [c, ...filtered].slice(0, 16);
    });
  }, []);
  useEffect(() => {
    setHistory(historyRef.current.history);
    setHistoryIndex(historyRef.current.index);
  }, [frames]); 
    const pushHistory = useCallback((newFrames) => {
    const { history: h, index } = historyRef.current;
    const nextH = [...h.slice(0, index + 1), newFrames].slice(-MAX_HISTORY);
    historyRef.current = { history: nextH, index: nextH.length - 1 };
        setHistory(nextH);
    setHistoryIndex(nextH.length - 1);
  }, []);
