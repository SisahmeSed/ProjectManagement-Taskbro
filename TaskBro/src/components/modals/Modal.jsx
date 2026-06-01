export default function Modal({
  onClose,
  children,
  overlayClassName = "",
  overlayStyle = {},
  contentClassName = "",
  contentStyle = {},
}) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm ${overlayClassName}`}
      style={overlayStyle}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
    >
      <div className={contentClassName} style={contentStyle}>
        {children}
      </div>
    </div>
  )
}
