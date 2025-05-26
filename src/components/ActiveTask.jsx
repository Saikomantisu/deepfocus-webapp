import React from "react";

const ActiveTask = ({ task, isActive, timeElapsed, onPause, onResume, onStop }) => {
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 shadow-2xl">
      {/* Status Header */}
      <div className="text-center mb-8">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ${
          isActive 
            ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-500/25' 
            : 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/25'
        }`}>
          <span className="text-2xl">{isActive ? "🧠" : "⏸️"}</span>
        </div>
        
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 ${
          isActive 
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${
            isActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
          }`}></div>
          {isActive ? 'Focusing' : 'Paused'}
        </div>
        
        <h2 className="text-xl font-semibold text-white mb-1 truncate">
          {task.name}
        </h2>
        <p className="text-slate-400 text-sm">
          Reminders every {task.interval} minute{task.interval !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Timer */}
      <div className="text-center mb-8">
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
          <p className="text-slate-400 text-xs mb-2 uppercase tracking-wide">Time Elapsed</p>
          <div className="text-3xl font-mono font-bold text-white tracking-wider">
            {formatTime(timeElapsed)}
          </div>
        </div>
      </div>

      {/* Session Info */}
      <div className="bg-slate-800/30 rounded-xl p-4 mb-8 border border-slate-700/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-slate-400 text-xs mb-1">Started</p>
            <p className="text-white text-sm font-medium">
              {task.startTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">Status</p>
            <p className={`text-sm font-medium ${isActive ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isActive ? 'Active' : 'Paused'}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">Next Alert</p>
            <p className="text-white text-sm font-medium">
              {isActive ? `${task.interval}m` : '--'}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {isActive ? (
          <button
            onClick={onPause}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-amber-500/25 hover:scale-[1.02]"
          >
            ⏸️ Pause Session
          </button>
        ) : (
          <button
            onClick={onResume}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02]"
          >
            ▶️ Resume Session
          </button>
        )}
        
        <button
          onClick={onStop}
          className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:scale-[1.02]"
        >
          ⏹️ End Session
        </button>
      </div>
    </div>
  );
};

export default ActiveTask;
