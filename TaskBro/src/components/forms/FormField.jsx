export default function FormField({ label, required, children, className = "", labelClassName = "", wrapperClassName = "" }) {
  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`.trim()}>
      <label className={`text-[11px] font-semibold tracking-widest text-gray-400 uppercase ${labelClassName}`.trim()}>
        {label}{required && <span className="text-gray-900 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
