import React, { useState, useEffect } from "react";
import TaskForm from "./components/TaskForm";
import ActiveTask from "./components/ActiveTask";

function App() {
  const [currentTask, setCurrentTask] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [swStatus, setSwStatus] = useState('loading');

  useEffect(() => {
    initializeApp();
  }, []);

  // UI timer
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimeElapsed(time => time + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const initializeApp = async () => {
    await setupNotifications();
    await setupServiceWorker();
  };

  const setupNotifications = async () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
      }
    }
  };

  const setupServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        console.log('🔧 Registering Service Worker...');
        
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered');
        
        await navigator.serviceWorker.ready;
        console.log('✅ Service Worker ready');
        
        navigator.serviceWorker.addEventListener('message', handleSWMessage);
        
        setSwStatus('ready');
        
      } catch (error) {
        console.error('❌ Service Worker failed:', error);
        setSwStatus('failed');
      }
    } else {
      setSwStatus('unsupported');
    }
  };

  const handleSWMessage = (event) => {
    console.log('📨 Message from SW:', event.data);
    
    switch (event.data.type) {
      case 'NOTIFICATION_SENT':
        console.log('🔔 Notification sent by SW');
        break;
      case 'TAKE_BREAK':
        setIsActive(false);
        break;
      default:
        console.log('❓ Unknown SW message:', event.data);
    }
  };

  const sendToServiceWorker = async (message) => {
    if (navigator.serviceWorker.controller) {
      console.log('📤 Sending to SW:', message);
      navigator.serviceWorker.controller.postMessage(message);
      return true;
    } else {
      console.warn('⚠️ No SW controller available');
      return false;
    }
  };

  const startTask = async (task) => {
    console.log('🚀 Starting task:', task);
    
    const taskWithId = {
      ...task,
      id: `task-${Date.now()}`
    };
    
    setCurrentTask(taskWithId);
    setIsActive(true);
    setTimeElapsed(0);
    
    const success = await sendToServiceWorker({
      type: 'START_TASK',
      payload: {
        taskId: taskWithId.id,
        taskName: task.name,
        intervalMinutes: task.interval
      }
    });
    
    if (!success) {
      console.warn('⚠️ Failed to start background notifications');
    }
  };

  const pauseTask = async () => {
    console.log('⏸️ Pausing task');
    setIsActive(false);
    await sendToServiceWorker({ type: 'PAUSE_TASK' });
  };

  const resumeTask = async () => {
    console.log('▶️ Resuming task');
    setIsActive(true);
    
    if (currentTask) {
      await sendToServiceWorker({
        type: 'RESUME_TASK',
        payload: {
          taskId: currentTask.id,
          taskName: currentTask.name,
          intervalMinutes: currentTask.interval
        }
      });
    }
  };

  const stopTask = async () => {
    console.log('⏹️ Stopping task');
    setIsActive(false);
    setCurrentTask(null);
    setTimeElapsed(0);
    await sendToServiceWorker({ type: 'STOP_TASK' });
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-violet-500/25">
              <span className="text-3xl">🧠</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            DeepFocus
          </h1>
          
          {/* Notifications */}
          {notificationPermission !== 'granted' && (
            <button
              onClick={requestNotificationPermission}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm px-4 py-2 rounded-lg transition-all duration-200 shadow-lg"
            >
              Enable Notifications
            </button>
          )}
        </div>

        {/* Main Content */}
        {!currentTask ? (
          <TaskForm onStartTask={startTask} />
        ) : (
          <ActiveTask
            task={currentTask}
            isActive={isActive}
            timeElapsed={timeElapsed}
            onPause={pauseTask}
            onResume={resumeTask}
            onStop={stopTask}
          />
        )}
      </div>
    </div>
  );
}

export default App;
