import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'pixelforge_autosave';
const DEBOUNCE_MS = 2000;

export function useAutoSave(data, onRestore) {
  const timerRef = useRef(null);
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (!isFirstMount.current) return;
    isFirstMount.current = false;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved && saved.frames && saved.gridSize) {
        onRestore(saved);
      }
    } catch (e) {
      console.warn('AutoSave: failed to restore', e);
    }
  }, []);
