import { useState } from "react";
import type { Habit as HabitType } from "../context/HabitContext";

interface HabitProps {
  habit: HabitType;
  toggleHabit: (habitId: string, date?: string) => void;
  deleteHabit: (habitId: string) => void;
  editHabitName: (habitId: string, newName: string) => void;
  updateWeeklyTarget: (habitId: string, newTarget: number) => void;
  isDoneToday: (habitId: string) => boolean;
  getHistory: (habitId: string, days?: number) => Array<{
    dateString: string;
    isCompleted: boolean;
    dayNumber: number;
    isToday: boolean;
  }>;
}

export default function Habit({
  habit,
  toggleHabit,
  deleteHabit,
  editHabitName,
  updateWeeklyTarget,
  isDoneToday,
  getHistory,
}: HabitProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(habit.habitName);
  const [showOptions, setShowOptions] = useState(false);

  const completedToday = isDoneToday(habit.habitId);
  const completionHistory = getHistory(habit.habitId, 7);

  const handleNameSave = () => {
    if (newName.trim() && newName.trim() !== habit.habitName) {
      editHabitName(habit.habitId, newName.trim());
    }
    setIsEditing(false);
    setShowOptions(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${habit.habitName}"?`)) {
      deleteHabit(habit.habitId);
    }
  };

  const getWeeklyProgress = () => {
    const today = new Date();
    const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1; // Monday as 0
    const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOfWeek);
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        weekDates.push(date.toISOString().split("T")[0]);
    }
    const completed = habit.datesCompleted.filter(date => weekDates.includes(date)).length;
    return { completed, target: habit.targetWeekly };
  };

  const weeklyProgress = habit.trackingType === 'weekly' ? getWeeklyProgress() : null;

  return (
    <div className={`habit-card-compact ${completedToday ? "completed-today" : ""} ${isExpanded ? "expanded" : ""}`}>
      <div className="habit-header-compact">
        <input
          type="checkbox"
          checked={completedToday}
          onChange={() => toggleHabit(habit.habitId)}
          className="habit-checkbox"
        />
        {isEditing ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
            className="habit-name-input"
            autoFocus
          />
        ) : (
          <span className="habit-name" onClick={() => setIsExpanded(!isExpanded)}>{habit.habitName}</span>
        )}

        <div className="habit-actions">
          <button onClick={() => setIsExpanded(!isExpanded)} className="expand-btn">
             {isExpanded ? '▲' : '▼'}
          </button>
          <div className="options-menu">
            <button onClick={() => setShowOptions(!showOptions)} className="options-btn">⋮</button>
            {showOptions && (
              <div className="options-dropdown">
                <button onClick={() => { setIsEditing(true); setIsExpanded(true); setShowOptions(false); }}>Edit Name</button>
                <button onClick={handleDelete}>Delete Habit</button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {habit.trackingType === 'weekly' && !isExpanded && (
        <div className="weekly-progress-bar-compact">
          <div style={{ width: `${Math.min((weeklyProgress.completed / weeklyProgress.target) * 100, 100)}%` }}></div>
        </div>
      )}

      {isExpanded && (
        <div className="habit-body-expanded">
          <div className="stats-section">
            <span>Current Streak: <strong>{habit.streakCurrent}</strong></span>
            <span>Best Streak: <strong>{habit.streakMaximum}</strong></span>
          </div>
          
          {habit.trackingType === "weekly" && weeklyProgress && (
            <div className="weekly-target-editor">
              <label>Target ({weeklyProgress.completed}/{weeklyProgress.target} this week):</label>
              <input
                type="number"
                min="1"
                max="7"
                value={habit.targetWeekly}
                onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if(val > 0 && val < 8) updateWeeklyTarget(habit.habitId, val)
                }}
              />
            </div>
          )}

          <div className="history-grid-compact">
            {completionHistory.map(({ dateString, isCompleted, isToday }) => (
              <div
                key={dateString}
                className={`history-day ${isCompleted ? "completed" : "not-completed"} ${isToday ? "today" : ""}`}
                title={`Click to toggle for: ${new Date(dateString).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
                // ✨ THIS IS THE ADDED FUNCTIONALITY
                onClick={() => toggleHabit(habit.habitId, dateString)}
              >
                {new Date(dateString).toLocaleDateString(undefined, { weekday: 'short' })[0]}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}