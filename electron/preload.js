const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  
  // Task management
  startTask: (task) => ipcRenderer.invoke('start-task', task),
  pauseTask: () => ipcRenderer.invoke('pause-task'),
  resumeTask: () => ipcRenderer.invoke('resume-task'),
  stopTask: () => ipcRenderer.invoke('stop-task'),
  
  // Platform info
  getPlatformInfo: () => ipcRenderer.invoke('get-platform-info'),
  
  // Notification listeners
  onNotificationSent: (callback) => {
    ipcRenderer.on('notification-sent', callback);
  },
  
  removeNotificationListener: () => {
    ipcRenderer.removeAllListeners('notification-sent');
  },
  
  // Window controls (optional)
  minimize: () => ipcRenderer.invoke('minimize-window'),
  maximize: () => ipcRenderer.invoke('maximize-window'),
  close: () => ipcRenderer.invoke('close-window'),
});

// Remove loading screen when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🖥️ Electron: Preload script loaded');
});
