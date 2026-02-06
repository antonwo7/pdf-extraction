export interface GraphSubscriptionNotification {
  subscriptionId: string
  clientState?: string
  changeType: string
  resource: string            // e.g. "drives/{driveId}/items/{itemId}"
  resourceData?: {
    id?: string               // itemId
    // ... other fields you may use later
  }
  tenantId?: string
  siteUrl?: string
  webId?: string
}

export interface GraphSubscriptionRequestBody {
  value?: GraphSubscriptionNotification[]
}