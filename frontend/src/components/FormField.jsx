import "./AuthControls.css";

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  autoComplete,
  required = true,
  minLenght,
}) {
  return (
    <label className="form-field">
      <span className="form-field-label">{label}</span>
      <input
        className="form-field-input"
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
        minLength={minLenght}
      />
    </label>
  );
}

export default FormField;
