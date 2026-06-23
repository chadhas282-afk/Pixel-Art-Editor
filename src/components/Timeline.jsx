import React, { useEffect, useRef, useState, useCallback } from 'react';
import { renderFrame } from '../utils/drawingTools';

const Timeline = ({
  frames, currentFrameIndex, setCurrentFrameIndex,
  addFrame, addBlankFrame, deleteFrame, moveFrame,
  fps, setFps, isPlaying, setIsPlaying,
  GRID_SIZE,
  onionSkinning, setOnionSkinning,