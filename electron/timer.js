const { Notification } = require('electron');
const path = require('path');

class TimerManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.currentTask = null;
    this.timer = null;
    this.isRunning = false;
    this.notificationCount = 0;
    this.startTime = null;
  }

  startTask(task) {
    console.log('🚀 Timer: Starting task', task);
    
    this.stopTask();
    
    this.currentTask = {
      ...task,
      startTime: new Date(),
      intervalMs: task.interval * 60 * 1000
    };
    
    this.isRunning = true;
    this.notificationCount = 0;
    this.startTime = new Date();
    this.scheduleNextNotification();
    
    return { success: true, message: 'Task started successfully' };
  }

  pauseTask() {
    console.log('⏸️ Timer: Pausing task');
    this.isRunning = false;
    
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    return { success: true, message: 'Task paused' };
  }

  resumeTask() {
    console.log('▶️ Timer: Resuming task');
    
    if (!this.currentTask) {
      return { success: false, error: 'No task to resume' };
    }
    
    this.isRunning = true;
    this.scheduleNextNotification();
    
    return { success: true, message: 'Task resumed' };
  }

  stopTask() {
    console.log('⏹️ Timer: Stopping task');
    this.isRunning = false;
    this.currentTask = null;
    this.notificationCount = 0;
    this.startTime = null;
    
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    return { success: true, message: 'Task stopped' };
  }

  scheduleNextNotification() {
    if (!this.currentTask || !this.isRunning) {
      console.log('❌ Timer: Cannot schedule - no task or not running');
      return;
    }

    const intervalMs = this.currentTask.intervalMs;
    console.log(`⏰ Timer: Scheduling notification in ${intervalMs}ms (${this.currentTask.interval} minutes)`);

    this.timer = setTimeout(() => {
      this.sendNotification();
      
      if (this.isRunning && this.currentTask) {
        this.scheduleNextNotification();
      }
    }, intervalMs);
  }

  sendNotification() {
    if (!this.currentTask) {
      console.log('❌ Timer: No task for notification');
      return;
    }

    this.notificationCount++;
    
    try {
      const notification = new Notification({
        title: '🧠 Focus Check-In',
        body: `Time to check in! Are you still focusing on: ${this.currentTask.name}?`,
        icon: path.join(__dirname, '../public/icon-192.svg'), // Updated to SVG
        urgency: 'normal',
        timeoutType: 'default',
        silent: false
      });

      notification.on('click', () => {
        console.log('📱 Notification clicked');
        if (this.mainWindow) {
          if (this.mainWindow.isMinimized()) {
            this.mainWindow.restore();
          }
          this.mainWindow.focus();
          this.mainWindow.show();
        }
      });

      notification.show();

      if (this.mainWindow && this.mainWindow.webContents) {
        this.mainWindow.webContents.send('notification-sent', {
          taskName: this.currentTask.name,
          notificationCount: this.notificationCount,
          timestamp: new Date().toISOString(),
          interval: this.currentTask.interval
        });
      }

      console.log(`🔔 Timer: Notification sent (#${this.notificationCount}) for: ${this.currentTask.name}`);
      
    } catch (error) {
      console.error('❌ Timer: Failed to send notification:', error);
    }
  }

  getStatus() {
    return {
      hasTask: !!this.currentTask,
      isRunning: this.isRunning,
      taskName: this.currentTask?.name,
      notificationCount: this.notificationCount,
      intervalMinutes: this.currentTask?.interval,
      startTime: this.startTime,
      elapsedTime: this.startTime ? Date.now() - this.startTime.getTime() : 0
    };
  }

  destroy() {
    this.stopTask();
    console.log('🧹 Timer: Cleanup completed');
  }
}

module.exports = { TimerManager };
