function VirtualKey({ label, value, isActive, onPress, onRelease, className = '' }) {
  const handlePointerDown = (event) => {
    event.preventDefault();
    onPress(value);
  };

  const handlePointerUp = (event) => {
    event.preventDefault();
    onRelease(value);
  };

  return (
    <button
      type="button"
      className={`key ${className} ${isActive ? 'active' : ''}`.trim()}
      data-key={value}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {label}
    </button>
  );
}

export function VirtualKeyboard({ keyboardRows, activeKeys, onPress, onRelease }) {
  return (
    <div id="keyboard-container">
      {keyboardRows.map((row, index) => (
        <div key={row} className="keyboard-row">
          {[...row].map((char) => (
            <VirtualKey
              key={char}
              label={char}
              value={char}
              isActive={!!activeKeys[char]}
              onPress={onPress}
              onRelease={onRelease}
            />
          ))}
          {index === keyboardRows.length - 1 ? (
            <VirtualKey
              label="DEL"
              value="BACKSPACE"
              className="key-del"
              isActive={!!activeKeys.BACKSPACE}
              onPress={onPress}
              onRelease={onRelease}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
