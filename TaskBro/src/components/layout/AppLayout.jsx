import Topbar from "./Topbar"

export default function AppLayout({ children, title = "", breadcrumb = [], actionButtons = [], transparentMain = false }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F0EFED" }}>
      <Topbar title={title} breadcrumb={breadcrumb} actionButtons={actionButtons} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 min-h-0">
        <main
          className={
            transparentMain
              ? "flex-1 flex flex-col overflow-hidden min-w-0 min-h-0"
              : "flex-1 flex flex-col overflow-hidden min-w-0 min-h-0 b"
          }
          style={{
            isolation: "isolate",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}