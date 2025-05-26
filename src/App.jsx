import React, { useState, useEffect, useRef } from "react";
import TaskForm from "./components/TaskForm";
import ActiveTask from "./components/ActiveTask";

// Check if running in Electron
const isElectron = window.electronAPI?.isElectron || false;

function App() {
  const [currentTask, setCurrentTask] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [notificationPermission, setNotificationPermission] = useState('granted');
  
  const timerRef = useRef(null);

  useEffect(() => {
    initializeApp();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (isElectron && window.electronAPI) {
        window.electronAPI.removeNotificationListener();
      }
    };
  }, []);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(time => time + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive]);

  const initializeApp = async () => {
    if (isElectron) {
      console.log('🖥️ Running in Electron');
      
      if (window.electronAPI) {
        window.electronAPI.onNotificationSent((event, data) => {
          console.log('🔔 Notification sent:', data);
        });
      }
    } else {
      console.log('🌐 Running in browser');
      await setupBrowserNotifications();
    }
  };

  const setupBrowserNotifications = async () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
      }
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
    
    if (isElectron && window.electronAPI) {
      try {
        await window.electronAPI.startTask(taskWithId);
        console.log('✅ Electron timer started');
      } catch (error) {
        console.error('❌ Failed to start Electron timer:', error);
      }
    } else {
      console.log('⚠️ Using browser notifications (limited)');
    }
  };

  const pauseTask = async () => {
    console.log('⏸️ Pausing task');
    setIsActive(false);
    
    if (isElectron && window.electronAPI) {
      await window.electronAPI.pauseTask();
    }
  };

  const resumeTask = async () => {
    console.log('▶️ Resuming task');
    setIsActive(true);
    
    if (isElectron && window.electronAPI) {
      await window.electronAPI.resumeTask();
    }
  };

  const stopTask = async () => {
    console.log('⏹️ Stopping task');
    setIsActive(false);
    setCurrentTask(null);
    setTimeElapsed(0);
    
    if (isElectron && window.electronAPI) {
      await window.electronAPI.stopTask();
    }
  };

  const requestNotificationPermission = async () => {
    if (!isElectron && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            DeepFocus
          </h1>
          
          {!isElectron && notificationPermission !== 'granted' && (
            <button
              onClick={requestNotificationPermission}
              className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm px-4 py-2 rounded-lg transition-all duration-200 shadow-lg"
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
