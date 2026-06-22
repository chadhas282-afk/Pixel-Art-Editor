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