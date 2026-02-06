import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { Document } from '@prisma/client'

@WebSocketGateway({
  namespace: '/api/documents',
  cors: {
    origin: '*',
  },
})
export class DocumentGateway {
  @WebSocketServer()
  server: Server

  broadcastDocumentChanged(doc: Document) {
    this.server.emit('document-status-changed', {
      id: doc.id,
      sharepointItemId: doc.sharepointItemId,
      fileName: doc.fileName,
      status: doc.status,
      currentStep: doc.currentStep,
      errorMessage: doc.errorMessage,
      createdAt: doc.createdAt,
      processedAt: doc.processedAt,
    })
  }
}
