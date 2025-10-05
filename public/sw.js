// Service Worker for CureCoders PWA
const CACHE_NAME = 'curecoders-v1.0.0';
const API_CACHE_NAME = 'curecoders-api-v1.0.0';

// Assets to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add other static assets as needed
];

// API endpoints to cache
const API_ENDPOINTS = [
  // Add API endpoints that should be cached
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('CureCoders SW: Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('CureCoders SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('CureCoders SW: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('CureCoders SW: Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('CureCoders SW: Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('CureCoders SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('CureCoders SW: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method === 'GET') {
    // Handle static assets
    if (STATIC_ASSETS.includes(url.pathname) || url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
      event.respondWith(handleStaticAsset(request));
    }
    // Handle API requests
    else if (url.pathname.startsWith('/api/') || API_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint))) {
      event.respondWith(handleAPIRequest(request));
    }
    // Handle navigation requests
    else if (request.mode === 'navigate') {
      event.respondWith(handleNavigationRequest(request));
    }
  }
});

// Handle static asset requests with cache-first strategy
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('CureCoders SW: Error handling static asset:', error);
    // Return offline fallback if available
    return caches.match('/offline.html') || new Response('Offline', { status: 503 });
  }
}

// Handle API requests with network-first strategy
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('CureCoders SW: Network failed, trying cache for API request');
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline API response
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'This feature requires an internet connection',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('CureCoders SW: Navigation request failed, serving cached version');
    const cachedResponse = await caches.match('/index.html');
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Handle push notifications for analysis completion
self.addEventListener('push', (event) => {
  console.log('CureCoders SW: Push notification received');
  
  const options = {
    body: 'Your pharmaceutical analysis is complete!',
    icon: '/assets/icon-192x192.png',
    badge: '/assets/badge-72x72.png',
    tag: 'analysis-complete',
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'view',
        title: 'View Results',
        icon: '/assets/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/assets/action-dismiss.png'
      }
    ],
    requireInteraction: true,
    silent: false,
    vibrate: [200, 100, 200]
  };

  if (event.data) {
    try {
      const data = event.data.json();
      options.body = data.message || options.body;
      options.data = { ...options.data, ...data };
    } catch (error) {
      console.error('CureCoders SW: Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification('CureCoders Analysis Complete', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('CureCoders SW: Notification clicked');
  
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('CureCoders SW: Background sync triggered');
  
  if (event.tag === 'sync-research-queries') {
    event.waitUntil(syncPendingQueries());
  }
});

// Sync pending research queries when back online
async function syncPendingQueries() {
  try {
    // Implementation for syncing offline research queries
    console.log('CureCoders SW: Syncing pending research queries...');
    
    // Get pending queries from IndexedDB or localStorage
    // Send them to the server when online
    // Update local storage with results
    
    console.log('CureCoders SW: Sync complete');
  } catch (error) {
    console.error('CureCoders SW: Sync failed:', error);
  }
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('CureCoders SW: Message received:', event.data);
  
  if (event.data?.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

console.log('CureCoders SW: Service worker loaded successfully');