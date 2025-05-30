
export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: any
}

export interface WebPushResult {
  success: boolean
  status?: number
  error?: string
}

export interface NotificationResult {
  success: boolean
  userId: string
  error?: string
}
