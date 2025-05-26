import React, { useState } from "react";

const TaskForm = ({ onStartTask }) => {
  const [taskName, setTaskName] = useState("");
  const [interval, setInterval] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskName.trim()) {
      onStartTask({
        name: taskName.trim(),
        interval: interval,
        startTime: new Date(),
      });
    }
  };

  const intervalOptions = [
    { value: 0.5, label: "30 seconds", display: "30 seconds" },
    { value: 1, label: "1 minute", display: "1 minute" },
    { value: 2, label: "2 minutes", display: "2 minutes" },
    { value: 5, label: "5 minutes", display: "5 minutes" },
    { value: 10, label: "10 minutes", display: "10 minutes" },
    { value: 15, label: "15 minutes", display: "15 minutes" },
    { value: 20, label: "20 minutes", display: "20 minutes" },
    { value: 30, label: "30 minutes", display: "30 minutes" },
  ];

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">
          Start Your Focus Session
        </h2>
        <p className="text-slate-400">
          What would you like to work on?
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Task Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Task
          </label>
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="e.g., Write essay, Study math, Code project..."
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all"
            required
            maxLength={100}
          />
        </div>

        {/* Interval Dropdown */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Reminder Frequency
          </label>
          <select
            value={interval}
            onChange={(e) => setInterval(parseFloat(e.target.value))}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all"
          >
            {intervalOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-slate-800">
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500 text-center">
            Get a gentle reminder every{" "}
            <span className="text-slate-300">
              {intervalOptions.find(opt => opt.value === interval)?.display}
            </span>
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!taskName.trim()}
          className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-violet-500/25 hover:scale-[1.02] disabled:hover:scale-100 disabled:hover:shadow-none"
        >
          Begin Focus Session
        </button>
      </form>
    </div>
  );
};

export default TaskForm;
