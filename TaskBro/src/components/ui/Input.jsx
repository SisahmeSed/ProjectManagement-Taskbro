export default function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
  autoFocus = false,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-danger">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoFocus={autoFocus}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm text-heading placeholder:text-gray-400
          outline-none transition-all duration-150
          focus:ring-2 focus:ring-primary/30 focus:border-primary
          ${error ? "border-danger bg-red-50" : "border-heading/20 bg-white hover:border-primary"}`}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}