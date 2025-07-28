// Service Worker for CourseFlow - Background Upload Support

const CACHE_NAME = 'courseflow-v1';
const UPLOAD_QUEUE_KEY = 'courseflow_background_uploads';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});

// Background sync for uploads
self.addEventListener('sync', async (event) => {
  if (event.tag === 'upload-files') {
    event.waitUntil(uploadQueuedFiles());
  }
});

// Handle fetch events for upload interception
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Intercept upload requests
  if (url.pathname === '/api/files/upload' && event.request.method === 'POST') {
    event.respondWith(handleUploadRequest(event.request));
  }
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data.type === 'QUEUE_UPLOAD') {
    queueUpload(event.data.payload);
  } else if (event.data.type === 'GET_UPLOAD_STATUS') {
    event.ports[0].postMessage({
      type: 'UPLOAD_STATUS',
      uploads: getQueuedUploads()
    });
  }
});

// Function to handle upload requests
async function handleUploadRequest(request) {
  try {
    // Clone the request for offline handling
    const clonedRequest = request.clone();
    
    // Try to upload immediately
    const response = await fetch(request);
    
    if (response.ok) {
      // Notify clients of successful upload
      notifyClients('UPLOAD_SUCCESS', await response.clone().json());
      return response;
    } else {
      // If upload fails, queue it for later
      await queueFailedUpload(clonedRequest);
      return new Response(JSON.stringify({
        queued: true,
        message: 'Upload queued for background sync'
      }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    // Network error - queue for later
    await queueFailedUpload(request);
    return new Response(JSON.stringify({
      queued: true,
      message: 'Upload queued for background sync'
    }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Queue upload for background sync
async function queueUpload(uploadData) {
  const uploads = getQueuedUploads();
  uploads.push({
    id: Date.now().toString(),
    ...uploadData,
    timestamp: new Date().toISOString()
  });
  
  await saveQueuedUploads(uploads);
  
  // Request background sync
  if ('sync' in self.registration) {
    await self.registration.sync.register('upload-files');
  }
}

// Queue failed upload
async function queueFailedUpload(request) {
  const formData = await request.formData();
  const files = formData.getAll('files');
  const courseId = formData.get('course_id');
  
  const uploadData = {
    files: files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type
    })),
    courseId,
    url: request.url
  };
  
  await queueUpload(uploadData);
}

// Process queued uploads
async function uploadQueuedFiles() {
  const uploads = getQueuedUploads();
  const completed = [];
  const failed = [];
  
  for (const upload of uploads) {
    try {
      // Recreate form data
      const formData = new FormData();
      
      // Note: In a real implementation, you'd need to store the actual file data
      // This is a simplified version
      if (upload.courseId) {
        formData.append('course_id', upload.courseId);
      }
      
      const response = await fetch(upload.url || '/api/files/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        completed.push(upload.id);
        notifyClients('UPLOAD_SUCCESS', {
          uploadId: upload.id,
          result: await response.json()
        });
      } else {
        failed.push(upload);
      }
    } catch (error) {
      failed.push(upload);
    }
  }
  
  // Update queue - keep only failed uploads
  await saveQueuedUploads(failed);
  
  // Notify about completion
  if (completed.length > 0) {
    notifyClients('BACKGROUND_SYNC_COMPLETE', {
      completed: completed.length,
      failed: failed.length
    });
  }
}

// Helper functions
function getQueuedUploads() {
  try {
    const stored = self.localStorage?.getItem(UPLOAD_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

async function saveQueuedUploads(uploads) {
  try {
    self.localStorage?.setItem(UPLOAD_QUEUE_KEY, JSON.stringify(uploads));
  } catch (error) {
    console.error('Failed to save upload queue:', error);
  }
}

// Notify all clients
async function notifyClients(type, data) {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type, data });
  });
}

// Periodic cleanup of old queued uploads (older than 24 hours)
setInterval(() => {
  const uploads = getQueuedUploads();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const filtered = uploads.filter(upload => {
    return new Date(upload.timestamp) > oneDayAgo;
  });
  
  if (filtered.length < uploads.length) {
    saveQueuedUploads(filtered);
  }
}, 60 * 60 * 1000); // Every hour