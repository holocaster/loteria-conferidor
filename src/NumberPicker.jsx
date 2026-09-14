export default function NumberPicker({ range, pick, selected, onChange }) {
  const [min, max] = range;
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  function toggle(n) {
    if (selected.includes(n)) {
      onChange(selected.filter((x) => x !== n));
    } else if (selected.length < pick) {
      onChange([...selected, n]);
    }
  }

  return (
    <div className="number-grid" role="group" aria-label="Escolha os números">
      {numbers.map((n) => {
        const isSelected = selected.includes(n);
        const isDisabled = !isSelected && selected.length >= pick;
        return (
          <button
            key={n}
            type="button"
            className={isSelected ? "num num-selected" : "num"}
            disabled={isDisabled}
            onClick={() => toggle(n)}
          >
            {String(n).padStart(2, "0")}
          </button>
        );
      })}
    </div>
  );
}
