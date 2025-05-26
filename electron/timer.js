const { Notification } = require('electron');
const path = require('path');
const os = require('os');

class TimerManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.currentTask = null;
    this.timer = null;
    this.isRunning = false;
    this.notificationCount = 0;
    this.startTime = null;
    this.breakStartTime = null;
    this.supportsActions = this.checkActionSupport();
  }

  checkActionSupport() {
    if (process.platform === 'darwin') {
      const release = os.release();
      const majorVersion = parseInt(release.split('.')[0]);
      return majorVersion >= 18; // macOS 10.14+
    }
    return process.platform === 'win32' || process.platform === 'linux';
  }

  startTask(task) {
    console.log('🚀 Timer: Starting task', task);
    
    this.stopTask();

    this.currentTask = {
      ...task,
      startTime: new Date(),
      intervalMs: task.interval * 60 * 1000,
    };

    this.isRunning = true;
    this.notificationCount = 0;
    this.startTime = new Date();
    this.breakStartTime = null;

    this.scheduleNextNotification();
    return { success: true, message: 'Task started successfully' };
  }

  scheduleNextNotification() {
    if (!this.currentTask || !this.isRunning) {
      return;
    }

    const intervalMs = this.currentTask.intervalMs;
    console.log(`⏰ Timer: Scheduling notification in ${intervalMs}ms`);

    this.timer = setTimeout(() => {
      this.sendNotification();
      
      if (this.isRunning && this.currentTask) {
        this.scheduleNextNotification();
      }
    }, intervalMs);
  }

  sendNotification() {
    if (!this.currentTask) {
      return;
    }

    this.notificationCount++;
    console.log(`🔔 Sending notification #${this.notificationCount} for task: ${this.currentTask.name}`);

    try {
      const notificationConfig = {
        title: '🧠 DeepFocus Check-In',
        body: `Are you still focusing on: ${this.currentTask.name}?`,
        urgency: 'normal',
        silent: false,
        timeoutType: 'default',
      };

      if (this.supportsActions) {
        notificationConfig.actions = [
          { type: 'button', text: '✅ Still Focused' },
          { type: 'button', text: '☕ Take Break' },
          { type: 'button', text: '⏹️ Stop Task' },
        ];
      }

      const notification = new Notification(notificationConfig);

      if (this.supportsActions) {
        notification.on('action', (event, index) => {
          switch (index) {
            case 0:
              this.handleStillFocused();
              break;
            case 1:
              this.handleTakeBreak();
              break;
            case 2:
              this.handleStopTask();
              break;
          }
        });
      }

      notification.on('click', () => {
        this.bringAppToFront();
      });

      notification.on('show', () => {
        this.sendEventToRenderer('notification-shown', {
          taskName: this.currentTask.name,
          notificationCount: this.notificationCount,
          timestamp: new Date().toISOString(),
          interval: this.currentTask.interval,
          supportsActions: this.supportsActions,
        });
      });

      notification.on('failed', (error) => {
        console.error('❌ Notification failed:', error);
        this.sendEventToRenderer('notification-failed', { error: error.message });
      });

      notification.show();

      this.sendEventToRenderer('notification-sent', {
        taskName: this.currentTask.name,
        notificationCount: this.notificationCount,
        timestamp: new Date().toISOString(),
        interval: this.currentTask.interval,
        supportsActions: this.supportsActions,
      });

    } catch (error) {
      console.error('❌ Timer: Failed to send notification:', error);
      this.sendEventToRenderer('notification-error', { error: error.message });
    }
  }

  handleStillFocused() {
    console.log('✅ User confirmed still focused');
    
    this.sendEventToRenderer('focus-confirmed', {
      taskName: this.currentTask.name,
      timestamp: new Date().toISOString(),
      notificationCount: this.notificationCount,
      sessionDuration: this.getSessionDuration(),
    });

    this.showQuickFeedback('🎯 Great! Keep focusing!');
  }

  handleTakeBreak() {
    console.log('☕ User requested break');
    
    const sessionDuration = this.getSessionDuration();
    this.breakStartTime = new Date();
    
    this.pauseTask();
    
    this.sendEventToRenderer('break-requested', {
      taskName: this.currentTask.name,
      timestamp: new Date().toISOString(),
      sessionDuration: sessionDuration,
    });

    this.showBreakNotification();
  }

  handleStopTask() {
    console.log('⏹️ User stopped task via notification');
    
    const sessionDuration = this.getSessionDuration();
    
    this.sendEventToRenderer('task-stopped-by-notification', {
      taskName: this.currentTask.name,
      timestamp: new Date().toISOString(),
      sessionDuration: sessionDuration,
      notificationCount: this.notificationCount,
    });

    this.stopTask();
    this.showQuickFeedback('📝 Task completed!');
  }

  showBreakNotification() {
    try {
      const breakConfig = {
        title: '☕ Break Time',
        body: 'Take a well-deserved break! Click when ready to resume.',
        urgency: 'low',
        silent: true,
      };

      if (this.supportsActions) {
        breakConfig.actions = [
          { type: 'button', text: '▶️ Resume Now' },
          { type: 'button', text: '⏹️ End Session' },
        ];
      }

      const breakNotification = new Notification(breakConfig);

      if (this.supportsActions) {
        breakNotification.on('action', (event, index) => {
          if (index === 0) {
            this.resumeTask();
          } else {
            this.stopTask();
          }
        });
      }

      breakNotification.on('click', () => {
        this.bringAppToFront();
      });

      breakNotification.show();
    } catch (error) {
      console.error('❌ Failed to show break notification:', error);
    }
  }

  showQuickFeedback(message) {
    try {
      const feedback = new Notification({
        title: '✅ DeepFocus',
        body: message,
        silent: true,
        urgency: 'low',
        timeoutType: 'default',
      });

      feedback.show();

      setTimeout(() => {
        try {
          feedback.close();
        } catch (e) {
          // Notification might already be closed
        }
      }, 3000);
    } catch (error) {
      console.error('❌ Failed to show feedback notification:', error);
    }
  }

  bringAppToFront() {
    if (this.mainWindow) {
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore();
      }
      this.mainWindow.focus();
      this.mainWindow.show();
      
      if (process.platform === 'darwin') {
        require('electron').app.focus();
      }
    }
  }

  getSessionDuration() {
    if (!this.startTime) return 0;
    return Math.floor((new Date() - this.startTime) / 1000 / 60);
  }

  getBreakDuration() {
    if (!this.breakStartTime) return 0;
    return Math.floor((new Date() - this.breakStartTime) / 1000 / 60);
  }

  sendEventToRenderer(eventName, data) {
    if (this.mainWindow && this.mainWindow.webContents) {
      this.mainWindow.webContents.send(eventName, data);
    }
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

    const breakDuration = this.getBreakDuration();
    this.breakStartTime = null;
    this.isRunning = true;
    
    this.sendEventToRenderer('task-resumed', {
      taskName: this.currentTask.name,
      timestamp: new Date().toISOString(),
      breakDuration: breakDuration,
    });

    this.scheduleNextNotification();
    return { success: true, message: 'Task resumed' };
  }

  stopTask() {
    console.log('⏹️ Timer: Stopping task');
    
    const sessionData = this.currentTask ? {
      taskName: this.currentTask.name,
      sessionDuration: this.getSessionDuration(),
      notificationCount: this.notificationCount,
      timestamp: new Date().toISOString(),
    } : null;

    this.isRunning = false;
    this.currentTask = null;
    this.notificationCount = 0;
    this.startTime = null;
    this.breakStartTime = null;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (sessionData) {
      this.sendEventToRenderer('task-completed', sessionData);
    }

    return { success: true, message: 'Task stopped' };
  }

  getCurrentTask() {
    return this.currentTask;
  }

  getTimerState() {
    return {
      isRunning: this.isRunning,
      currentTask: this.currentTask,
      notificationCount: this.notificationCount,
      sessionDuration: this.getSessionDuration(),
      breakDuration: this.getBreakDuration(),
      supportsActions: this.supportsActions,
    };
  }

  destroy() {
    console.log('🧹 Timer: Cleaning up...');
    this.stopTask();
  }
}

module.exports = { TimerManager };
