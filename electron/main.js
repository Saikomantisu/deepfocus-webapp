const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const { TimerManager } = require('./timer');

// Detect development mode properly
const isDev = !app.isPackaged;

let mainWindow;
let timerManager;

const createWindow = () => {
  console.log('🚀 Creating window, isDev:', isDev);
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 400,
    minHeight: 600,
    show: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    // Fix icon path - use SVG
    icon: path.join(__dirname, '../public/icon-192.svg')
  });

  // Load the app
  if (isDev) {
    console.log('📡 Loading from Vite dev server: http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    console.log('📁 Loading from built files');
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('🖥️ Electron window ready');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (timerManager) {
      timerManager.destroy();
    }
  });

  // Initialize timer manager
  timerManager = new TimerManager(mainWindow);
};

app.whenReady().then(() => {
  console.log('🚀 Electron app ready, isDev:', isDev);
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle('start-task', async (event, task) => {
  console.log('🚀 Main: Starting task', task);
  return timerManager.startTask(task);
});

ipcMain.handle('pause-task', async (event) => {
  console.log('⏸️ Main: Pausing task');
  return timerManager.pauseTask();
});

ipcMain.handle('resume-task', async (event) => {
  console.log('▶️ Main: Resuming task');
  return timerManager.resumeTask();
});

ipcMain.handle('stop-task', async (event) => {
  console.log('⏹️ Main: Stopping task');
  return timerManager.stopTask();
});

ipcMain.handle('get-platform-info', async (event) => {
  return {
    platform: process.platform,
    version: app.getVersion(),
    isElectron: true,
    isDev: isDev
  };
});

app.setAppUserModelId('com.krfgroup.deepfocus');
