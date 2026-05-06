import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GAME_CONFIG, KEYBOARD_ROWS } from '../../data/gameConfig';
import { SpiderTyperEngine } from '../engine/SpiderTyperEngine';

function normalizeKey(key) {
  const upperKey = key.toUpperCase();

  if (GAME_CONFIG.letters.includes(upperKey)) {
    return upperKey;
  }

  if (upperKey === 'BACKSPACE') {
    return 'BACKSPACE';
  }

  return null;
}

export function useSpiderTyperGame() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const [uiState, setUiState] = useState({ currentInput: '', score: 0 });
  const [activeKeys, setActiveKeys] = useState({});

  const setKeyState = useCallback((key, isActive) => {
    setActiveKeys((previousState) => {
      if (!!previousState[key] === isActive) {
        return previousState;
      }

      if (isActive) {
        return { ...previousState, [key]: true };
      }

      const nextState = { ...previousState };
      delete nextState[key];
      return nextState;
    });
  }, []);

  const handleInput = useCallback((key) => {
    engineRef.current?.handleInput(key);
  }, []);

  const pressKey = useCallback(
    (key) => {
      setKeyState(key, true);
      handleInput(key);
    },
    [handleInput, setKeyState],
  );

  const releaseKey = useCallback(
    (key) => {
      setKeyState(key, false);
    },
    [setKeyState],
  );

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) {
      return undefined;
    }

    const engine = new SpiderTyperEngine({ onStateChange: setUiState });
    engineRef.current = engine;
    engine.attach({ canvas: canvasRef.current, container: containerRef.current });

    const resizeObserver = new ResizeObserver(() => {
      engine.handleContainerResize();
    });
    resizeObserver.observe(containerRef.current);

    const onKeyDown = (event) => {
      const normalizedKey = normalizeKey(event.key);

      if (!normalizedKey) {
        return;
      }

      event.preventDefault();
      setKeyState(normalizedKey, true);
      handleInput(normalizedKey);
    };

    const onKeyUp = (event) => {
      const normalizedKey = normalizeKey(event.key);

      if (!normalizedKey) {
        return;
      }

      setKeyState(normalizedKey, false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      engine.destroy();
      engineRef.current = null;
    };
  }, [handleInput, setKeyState]);

  return useMemo(
    () => ({
      canvasRef,
      containerRef,
      currentInput: uiState.currentInput,
      score: uiState.score,
      activeKeys,
      keyboardRows: KEYBOARD_ROWS,
      pressKey,
      releaseKey,
    }),
    [activeKeys, pressKey, releaseKey, uiState.currentInput, uiState.score],
  );
}
