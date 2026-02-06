import DocumentViewerPage from '@/components/DocumentViewerPage'

interface PageProps {
  params: { id: string }
}

export default async function DocumentPage({ params }: PageProps) {
  const { id } = await params

  return <DocumentViewerPage documentId={id} />
}
