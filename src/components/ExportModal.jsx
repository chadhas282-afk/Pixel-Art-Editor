import React, { useState, useEffect, useRef } from 'react';
import { renderFrame } from '../utils/drawingTools';

const ExportModal = ({
    isOpen,
    onClose,
    onExportPNG,
    onExportSpritesheet,
    onExportAllFrames,
    onExportGIF,
    onExportJSON,
    gridSize,
    frames,
    currentFrameIndex,
}) => {
    const [exportType, setExportType] = useState('gif');
    const [scale, setScale] = useState(8);
    const [bgColor, setBgColor] = useState('transparent');
    const [customBgColor, setCustomBgColor] = useState('#ffffff');

    const previewCanvasRef = useRef(null);

    useEffect(() => {
        if (!isOpen || !previewCanvasRef.current) return;
        const ctx = previewCanvasRef.current.getContext('2d');
        const displayBg = bgColor === 'transparent' ? null : (bgColor === 'custom' ? customBgColor : bgColor);
        renderFrame(ctx, frames[currentFrameIndex], gridSize, displayBg);
    }, [isOpen, frames, currentFrameIndex, gridSize, bgColor, customBgColor]);

    if (!isOpen) return null;

    const handleExport = () => {
        const finalBgColor = bgColor === 'transparent' ? 'transparent' : (bgColor === 'custom' ? customBgColor : bgColor);

        switch (exportType) {
            case 'png':
                onExportPNG(scale, finalBgColor);
                break;
            case 'spritesheet':
                onExportSpritesheet(scale, finalBgColor);
                break;
            case 'all':
                onExportAllFrames(scale, finalBgColor);
                break;
            case 'gif':
                onExportGIF(scale, finalBgColor);
                break;
            case 'json':
                onExportJSON();
                break;
            default:
                break;
        }
        onClose();
    };

    return (
        <div className="shortcuts-overlay" onClick={onClose} role="dialog" aria-modal="true">
            <div className="shortcuts-modal export-modal" onClick={e => e.stopPropagation()}>
                <div className="shortcuts-header">
                    <h2 className="shortcuts-title">Export Project</h2>
                    <button className="shortcuts-close" onClick={onClose} aria-label="Close">✕</button>
                </div>

                <div className="export-modal-body">
                    <div className="export-controls">

                        <div className="export-field">
                            <label className="export-label">Format</label>
                            <select className="export-select" value={exportType} onChange={e => setExportType(e.target.value)}>
                                <option value="gif">Animated GIF (.gif)</option>
                                <option value="png">Current Frame (.png)</option>
                                <option value="spritesheet">Spritesheet (.png)</option>
                                <option value="all">All Frames (ZIP / multiple PNGs)</option>
                                <option value="json">Project File (.json)</option>
                            </select>
                        </div>

                        {exportType !== 'json' && (
              <>
                                <div className="export-field">
                                    <label className="export-label">Scale Factor</label>
                                    <select className="export-select" value={scale} onChange={e => setScale(Number(e.target.value))}>
                                        <option value={1}>1x ({gridSize}px)</option>
                                        <option value={2}>2x ({gridSize * 2}px)</option>
                                        <option value={4}>4x ({gridSize * 4}px)</option>
                                                            <option value={8}>8x ({gridSize * 8}px)</option>
                    <option value={16}>16x ({gridSize * 16}px)</option>
                    <option value={32}>32x ({gridSize * 32}px)</option>
                  </select>
                </div>
                
                <div className="export-field">
                  <label className="export-label">Background</label>
                  <select className="export-select" value={bgColor} onChange={e => setBgColor(e.target.value)}>
                    <option value="transparent">Transparent</option>
                    <option value="#ffffff">White</option>
                    <option value="#000000">Black</option>
                    <option value="custom">Custom Color...</option>
                  </select>
                  {bgColor === 'custom' && (
                    <input 
                      type="color" 
                      className="export-color-picker" 
                      value={customBgColor} 
                                            onChange={e => setCustomBgColor(e.target.value)} 
                      style={{ marginTop: 8, width: '100%', height: 32, cursor: 'pointer' }}
                    />
                  )}
                </div>
              </>
            )}
            
          </div>
          
          <div className="export-preview-section">
            <div className="section-label">Preview</div>
            <div className="export-preview-box" style={{ 
              background: bgColor === 'transparent' ? 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\'><rect width=\'8\' height=\'8\' fill=\'%23ccc\'/><rect x=\'8\' y=\'8\' width=\'8\' height=\'8\' fill=\'%23ccc\'/><rect x=\'8\' width=\'8\' height=\'8\' fill=\'%23eee\'/><rect y=\'8\' width=\'8\' height=\'8\' fill=\'%23eee\'/></svg>")' : 'transparent',
            }}>
                              <canvas 
                ref={previewCanvasRef} 
                width={gridSize} 
                height={gridSize} 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  imageRendering: 'pixelated',
                }}
              />
            </div>
                        {exportType !== 'json' && (
              <div className="export-info-text">
                Output size: {exportType === 'spritesheet' ? gridSize * frames.length * scale : gridSize * scale}x{gridSize * scale}px
              </div>
            )}
          </div>
        </div>
        
        <div className="export-modal-footer">
                      <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleExport}>
            Export {exportType.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
