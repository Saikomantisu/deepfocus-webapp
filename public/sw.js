console.log('🔧 Service Worker starting...');

let taskTimer = null;
let currentTask = null;
let isRunning = false;

// Install
self.addEventListener('install', (event) => {
  console.log('🔧 SW: Installing...');
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  console.log('✅ SW: Activated');
  event.waitUntil(self.clients.claim());
});

// Message handler
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  console.log(`📨 SW: Received ${type}`, payload);
  
  switch (type) {
    case 'START_TASK':
      handleStartTask(payload);
      break;
    case 'PAUSE_TASK':
      handlePauseTask();
      break;
    case 'RESUME_TASK':
      handleResumeTask(payload);
      break;
    case 'STOP_TASK':
      handleStopTask();
      break;
    default:
      console.warn(`❓ SW: Unknown message type: ${type}`);
  }
});

function handleStartTask(payload) {
  console.log('🚀 SW: Starting task', payload);
  
  // Clear any existing timer
  if (taskTimer) {
    clearTimeout(taskTimer);
    taskTimer = null;
  }
  
  // Store task info
  currentTask = {
    id: payload.taskId,
    name: payload.taskName,
    intervalMinutes: payload.intervalMinutes
  };
  
  isRunning = true;
  scheduleNextNotification();
}

function handlePauseTask() {
  console.log('⏸️ SW: Pausing task');
  isRunning = false;
  
  if (taskTimer) {
    clearTimeout(taskTimer);
    taskTimer = null;
  }
}

function handleResumeTask(payload) {
  console.log('▶️ SW: Resuming task');
  
  if (payload) {
    currentTask = {
      id: payload.taskId,
      name: payload.taskName,
      intervalMinutes: payload.intervalMinutes
    };
  }
  
  isRunning = true;
  scheduleNextNotification();
}

function handleStopTask() {
  console.log('⏹️ SW: Stopping task');
  isRunning = false;
  currentTask = null;
  
  if (taskTimer) {
    clearTimeout(taskTimer);
    taskTimer = null;
  }
}

function scheduleNextNotification() {
  if (!currentTask || !isRunning) {
    console.log('❌ SW: Cannot schedule - no task or not running');
    return;
  }
  
  const intervalMs = currentTask.intervalMinutes * 60 * 1000;
  console.log(`⏰ SW: Scheduling notification in ${intervalMs}ms (${currentTask.intervalMinutes} minutes)`);
  
  taskTimer = setTimeout(() => {
    sendNotification();
    
    // Schedule next one if still running
    if (isRunning && currentTask) {
      scheduleNextNotification();
    }
  }, intervalMs);
}

function sendNotification() {
  if (!currentTask) {
    console.log('❌ SW: No task for notification');
    return;
  }
  
  console.log('🔔 SW: Sending notification for:', currentTask.name);
  
  const notificationOptions = {
    body: `Time to check in! Are you still focusing on: ${currentTask.name}?`,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: 'focus-reminder',
    requireInteraction: true,
    data: {
      taskId: currentTask.id,
      taskName: currentTask.name
    }
  };
  
  self.registration.showNotification('🧠 Focus Check-In', notificationOptions)
    .then(() => {
      console.log('✅ SW: Notification sent successfully');
      sendMessageToApp({ type: 'NOTIFICATION_SENT' });
    })
    .catch(error => {
      console.error('❌ SW: Notification failed:', error);
    });
}

function sendMessageToApp(message) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      console.log('📤 SW: Sending to app:', message);
      client.postMessage(message);
    });
  });
}

// Enhanced status logging
setInterval(() => {
  const status = {
    task: currentTask?.name || 'none',
    running: isRunning,
    timerActive: !!taskTimer
  };
  
  console.log('📊 SW: Status Check -', status);
}, 30000);

console.log('✅ Service Worker loaded and configured');
