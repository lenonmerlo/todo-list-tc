import "./AuthControls.css";

function SegmentedControl({ value, options, onChange, label }) {
  return (
    <div className="segmented" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`segmented-button ${
            value === option.value ? "active" : ""
          }`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default SegmentedControl;
