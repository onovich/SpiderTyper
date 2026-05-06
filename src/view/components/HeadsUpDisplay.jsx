export function HeadsUpDisplay({ currentInput, score }) {
  return (
    <div id="ui-layer">
      <div className="score-spacer" />
      <div id="current-input-wrapper">
        <div id="current-input" className={currentInput ? '' : 'is-empty'}>
          {currentInput}
        </div>
      </div>
      <div id="score-display">
        Score: <br />
        <span id="score-val">{score}</span>
      </div>
    </div>
  );
}
