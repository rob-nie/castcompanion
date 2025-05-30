
// Service Worker for Push Notifications
const CACHE_NAME = 'cast-companion-v1'

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(self.clients.claim())
})

// Push event handler
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)
  
  if (!event.data) {
    console.log('No data in push event')
    return
  }

  try {
    const data = event.data.json()
    console.log('Push data:', data)

    const options = {
      body: data.body || 'Neue Nachricht erhalten',
      icon: data.icon || '/favicon.ico',
      badge: data.badge || '/favicon.ico',
      tag: 'message-notification',
      renotify: true,
      requireInteraction: false,
      data: data.data || {},
      actions: [
        {
          action: 'open',
          title: 'Nachricht anzeigen'
        },
        {
          action: 'close',
          title: 'Schließen'
        }
      ]
    }

    event.waitUntil(
      self.registration.showNotification(
        data.title || 'Cast Companion',
        options
      )
    )
  } catch (error) {
    console.error('Error processing push notification:', error)
    
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('Cast Companion', {
        body: 'Neue Nachricht erhalten',
        icon: '/favicon.ico',
        tag: 'message-notification'
      })
    )
  }
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()

  if (event.action === 'close') {
    return
  }

  // Default action or 'open' action
  const urlToOpen = event.notification.data?.url || '/'
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if the app is already open
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus()
          }
        }
        
        // Open new window if not already open
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen)
        }
      })
  )
})

// Background sync (optional for offline support)
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)
  
  if (event.tag === 'message-sync') {
    event.waitUntil(
      // Could implement offline message sending here
      Promise.resolve()
    )
  }
})
