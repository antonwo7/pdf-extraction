import { DocumentsMonitorTable } from "@/components/DocumentsMonitorTable"
import { DocumentStatus } from "@/types/document"


/**
 * Main page for live monitoring of document processing.
 * Shows a table with all documents and their current state.
 */
export default function DocumentsMonitorPage() {
  // For now there is no filtering by status on the UI.
  const statusFilter: DocumentStatus | undefined = undefined

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Document Processing Monitor
          </h1>
          <p className="max-w-2xl text-sm text-slate-600">
            This page updates in real time. New documents appear in the table and statuses
            change as they are being processed by the backend.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
          <DocumentsMonitorTable statusFilter={statusFilter} />
        </section>
      </div>
    </main>
  )
}
