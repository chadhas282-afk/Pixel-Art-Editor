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
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [frames, setFrames] = useState([createEmptyFrame(DEFAULT_GRID_SIZE)]);
  const [currentFrameIndex, setCFI] = useState(0);
  const [history, setHistory] = useState([[createEmptyFrame(DEFAULT_GRID_SIZE)]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const historyRef = useRef({ history: [[createEmptyFrame(DEFAULT_GRID_SIZE)]], index: 0 });
  const [selectedTool, setSelectedTool] = useState('pencil');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [palette, setPalette] = useState(DEFAULT_PALETTE);
  const [recentColors, setRecentColors] = useState([]);
  const [brushSize, setBrushSize] = useState(1);
  const [symmetryMode, setSymmetryMode] = useState('none');
  const [fps, setFps] = useState(8);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [onionSkinning, setOnionSkinning] = useState(false);
  const [onionOpacity, setOnionOpacity] = useState(0.3);
  const [onionNext, setOnionNext] = useState(false);
  const [hoverCell, setHoverCell] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [clipboard, setClipboard] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
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

  const undo = useCallback(() => {
    const { history: h, index } = historyRef.current;
    if (index > 0) {
      historyRef.current = { history: h, index: index - 1 };
      setFrames(h[index - 1]);
      if (currentFrameIndex >= h[index - 1].length) setCFI(Math.max(0, h[index - 1].length - 1));
    }
  }, [currentFrameIndex, addToast]);

  const redo = useCallback(() => {
    const { history: h, index } = historyRef.current;
    if (index < h.length - 1) {
      historyRef.current = { history: h, index: index + 1 };
      setFrames(h[index + 1]);
    }
  }, [addToast]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const commitFrame = useCallback((newFrame) => {
    setFrames(prev => {
      const next = [...prev];
      next[currentFrameIndex] = newFrame;
      pushHistory(next);
      return next;
    });
  }, [currentFrameIndex, pushHistory]);

  const paintFrame = useCallback((newFrame) => {
    setFrames(prev => {
      const next = [...prev];
      next[currentFrameIndex] = newFrame;
      return next;
    });
  }, [currentFrameIndex]);

  const addFrame = () => {
    setFrames(prev => {
      const next = [...prev, [...prev[currentFrameIndex]]];
      pushHistory(next);
      return next;
    });
    setCFI(frames.length);
  };

  const addBlankFrame = () => {
    setFrames(prev => {
      const next = [...prev, createEmptyFrame(gridSize)];
      pushHistory(next);
      return next;
    });
    setCFI(frames.length);
  };

  const deleteFrame = (index) => {
    if (frames.length <= 1) return;
    setFrames(prev => {
      const next = prev.filter((_, i) => i !== index);
      pushHistory(next);
      return next;
    });
    if (currentFrameIndex >= index) {
      setCFI(Math.max(0, currentFrameIndex - 1));
    }
  };

  const moveFrame = (index, targetIndex) => {
    if (targetIndex < 0 || targetIndex >= frames.length) return;
    setFrames(prev => {
      const next = [...prev];
      const tmp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = tmp;
      pushHistory(next);
      return next;
    });
    if (currentFrameIndex === index) setCFI(targetIndex);
    else if (currentFrameIndex === targetIndex) setCFI(index);
  };

  const clearCanvas = () => {
    commitFrame(createEmptyFrame(gridSize));
  };

  const handleGridSizeChange = (newSize) => {
    if (newSize === gridSize) return;
    setGridSize(newSize);
    const newFrames = [createEmptyFrame(newSize)];
    setFrames(newFrames);
    setCFI(0);
    pushHistory(newFrames);
    addToast(`Grid resized to ${newSize}x${newSize}`, 'info');
  };

  const flipH = () => commitFrame(flipFrameH(frames[currentFrameIndex], gridSize));
  const flipV = () => commitFrame(flipFrameV(frames[currentFrameIndex], gridSize));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'textarea') return;

      if (e.key === '?') { setShowShortcuts(prev => !prev); return; }

      const ctrlOrCmd = e.ctrlKey || e.metaKey;

      if (ctrlOrCmd) {
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) redo(); else undo();
        }
        if (e.key.toLowerCase() === 'c') {
          e.preventDefault();
          setClipboard(frames[currentFrameIndex]);
          addToast('Frame copied', 'info', 1500);
        }
        if (e.key.toLowerCase() === 'v' && clipboard) {
          e.preventDefault();
          commitFrame(clipboard);
          addToast('Frame pasted', 'info', 1500);
        }
        if (e.key.toLowerCase() === 'a') {
          e.preventDefault();
          setSelectedTool('select');
        }
        if (e.key.toLowerCase() === 'e') {
          e.preventDefault();
          setIsExportModalOpen(true);
        }
        return;
      }

      const key = e.key.toLowerCase();
      if (TOOL_KEYS[key]) setSelectedTool(TOOL_KEYS[key]);
      if (e.key === 'ArrowLeft') setCFI(c => Math.max(0, c - 1));
      if (e.key === 'ArrowRight') setCFI(c => Math.min(frames.length - 1, c + 1));
      if (e.key === 'Delete' || e.key === 'Backspace') clearCanvas();
      if (['1', '2', '3', '4'].includes(e.key)) setBrushSize(parseInt(e.key));
      if (e.key === 'f') flipH();
      if (e.key === 'v') flipV();
      if (e.key === 'g') setShowGrid(g => !g);
      if (e.key === 'o') setOnionSkinning(o => !o);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, clipboard, currentFrameIndex, frames, gridSize, commitFrame, addToast]);

  return (
    <div className="app-container" onDragOver={handleDragOver} onDrop={handleDrop}>
      {showShortcuts && <KeyboardShortcutsOverlay onClose={() => setShowShortcuts(false)} />}

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        gridSize={gridSize}
        frames={frames}
        currentFrameIndex={currentFrameIndex}
        onExportPNG={(scale, bg) => exportFramePNG(frames, currentFrameIndex, gridSize, scale, bg)}
        onExportSpritesheet={(scale, bg) => exportSpritesheet(frames, gridSize, scale, bg)}
        onExportAllFrames={(scale, bg) => exportAllFrames(frames, gridSize, scale, bg)}
        onExportGIF={async (scale, bg) => {
          const { downloadGIF } = await import('./utils/gifExport');
          downloadGIF(frames, gridSize, fps, scale, bg, `${projectName.replace(/\s+/g, '-').toLowerCase()}.gif`);
        }}
        onExportJSON={() => exportJSON(frames, gridSize, fps, projectName, palette)}
      />
      <header className="app-header">
        <div className="app-logo">
          <div className="app-logo-icon">🎨</div>
          <span>PixelForge</span>
        </div>

        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          style={{
            background: 'transparent', border: '1px solid transparent', color: 'var(--text-primary)',
            fontSize: '13px', fontWeight: '500', marginLeft: '24px', padding: '4px 8px', borderRadius: '4px',
            outline: 'none', transition: 'all 0.2s'
          }}
          onFocus={e => e.target.style.background = 'var(--bg-elevated)'}
          onBlur={e => e.target.style.background = 'transparent'}
        />
        <div className="header-divider" />
        <div className="header-spacer" />
        <div className="header-actions">
          <button className="header-btn" onClick={flipH} data-tooltip="Flip Horizontal (F)">↔ Flip H</button>
          <button className="header-btn" onClick={flipV} data-tooltip="Flip Vertical (V)">↕ Flip V</button>
          <button className="header-btn header-btn--accent" onClick={() => setShowShortcuts(true)}>⌨ Shortcuts</button>
          <button className="header-btn" style={{ background: 'var(--accent)', color: '#fff', border: 'none' }} onClick={() => setIsExportModalOpen(true)}>📤 Export</button>
        </div>
      </header>
      <Sidebar
        selectedTool={selectedTool} setSelectedTool={setSelectedTool}
        selectedColor={selectedColor} setSelectedColor={setSelectedColor}
        palette={palette} setPalette={setPalette}
        recentColors={recentColors}
        undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo}
        clearCanvas={clearCanvas}
        brushSize={brushSize} setBrushSize={setBrushSize}
        symmetryMode={symmetryMode} setSymmetryMode={setSymmetryMode}
        gridSize={gridSize} onGridSizeChange={handleGridSizeChange}
      />
      <CanvasArea
        frame={frames[currentFrameIndex]}
        frames={frames}
        currentFrameIndex={currentFrameIndex}
        paintFrame={paintFrame}
        commitFrame={commitFrame}
        selectedTool={selectedTool}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        GRID_SIZE={gridSize}
        showGrid={showGrid} setShowGrid={setShowGrid}
        brushSize={brushSize}
        symmetryMode={symmetryMode}
        onionSkinning={onionSkinning}
        onionOpacity={onionOpacity}
        onionNext={onionNext}
        addRecentColor={addRecentColor}
        clipboard={clipboard} setClipboard={setClipboard}
        onHoverCellChange={setHoverCell}
        onZoomChange={setZoom}
      />
      <Timeline
        frames={frames}
        currentFrameIndex={currentFrameIndex}
        setCurrentFrameIndex={setCFI}
        addFrame={addFrame}
        addBlankFrame={addBlankFrame}
        deleteFrame={deleteFrame}
        moveFrame={moveFrame}
        fps={fps} setFps={setFps}
        isPlaying={isPlaying} setIsPlaying={setIsPlaying}
        GRID_SIZE={gridSize}
        onionSkinning={onionSkinning} setOnionSkinning={setOnionSkinning}
        onionOpacity={onionOpacity} setOnionOpacity={setOnionOpacity}
        onionNext={onionNext} setOnionNext={setOnionNext}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />
      <StatusBar
        selectedTool={selectedTool}
        selectedColor={selectedColor}
        brushSize={brushSize}
        hoverCell={hoverCell}
        zoom={zoom}
        undoCount={historyIndex}
        redoCount={history.length - 1 - historyIndex}
        currentFrameIndex={currentFrameIndex}
        totalFrames={frames.length}
        gridSize={gridSize}
      />
    </div>
  );
}

export default App;
