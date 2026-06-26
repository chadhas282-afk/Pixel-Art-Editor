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