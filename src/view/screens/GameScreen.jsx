import { useSpiderTyperGame } from '../../logic/hooks/useSpiderTyperGame';
import { HeadsUpDisplay } from '../components/HeadsUpDisplay';
import { VirtualKeyboard } from '../components/VirtualKeyboard';

export function GameScreen() {
  const { canvasRef, containerRef, currentInput, score, activeKeys, keyboardRows, pressKey, releaseKey } =
    useSpiderTyperGame();

  return (
    <div className="app-shell">
      <div id="game-container" ref={containerRef}>
        <canvas ref={canvasRef} id="game-canvas" />
        <HeadsUpDisplay currentInput={currentInput} score={score} />
      </div>
      <VirtualKeyboard
        keyboardRows={keyboardRows}
        activeKeys={activeKeys}
        onPress={pressKey}
        onRelease={releaseKey}
      />
    </div>
  );
}
