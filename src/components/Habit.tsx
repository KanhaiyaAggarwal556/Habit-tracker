import { useState } from "react";
import { Habit as HabitType } from "../context/HabitContext";

interface HabitProps {
  habit: HabitType;
  toggleHabit: (habitId: string, date?: string) => void;
  updateTracking: (habitId: string, tracking: "daily" | "weekly") => void;
  isDoneToday: (habitId: string) => boolean;
  isDoneOnDate: (habitId: string, date: string) => boolean;
  getHistory: (
    habitId: string,
    days?: number
  ) => Array<{
    dateString: string;
    isCompleted: boolean;
    dayNumber: number;
    isToday: boolean;
  }>;
}

export default function Habit({
  habit,
  toggleHabit,
  updateTracking,
  isDoneToday,
  isDoneOnDate,
  getHistory,
}: HabitProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const getWeeklyProgress = (habit: HabitType) => {
    if (habit.trackingType !== "weekly") return { completed: 0, target: 0 };

    const today = new Date();
    const weekStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - today.getDay()
    );
    const weekDates: string[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      weekDates.push(date.toISOString().split("T")[0]);
    }

    const completed = weekDates.filter((date) =>
      habit.datesCompleted.includes(date)
    ).length;
    return { completed, target: habit.targetWeekly };
  };

  const handleDateSelection = () => {
    if (selectedDate) {
      toggleHabit(habit.habitId, selectedDate);
      setSelectedDate("");
      setShowDatePicker(false);
    }
  };

  const completionHistory = getHistory(habit.habitId, 14);
  const completedToday = isDoneToday(habit.habitId);
  const weeklyProgress = getWeeklyProgress(habit);

  return (
    <div className="habit-card">
      <div className="habit-header">
        <h3>{habit.habitName}</h3>
        <div className="streak-info">
          <span>Current: {habit.streakCurrent}</span>
          <span>Best: {habit.streakMaximum}</span>
        </div>
      </div>

      <div className="habit-body">
        <div className="tracking-section">
          <label>Tracking:</label>
          <select
            value={habit.trackingType}
            onChange={(e) =>
              updateTracking(habit.habitId, e.target.value as "daily" | "weekly")
            }
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
          {habit.trackingType === "weekly" && (
            <span className="weekly-target">
              ({habit.targetWeekly} days/week)
            </span>
          )}
        </div>

        {habit.trackingType === "weekly" && (
          <div className="weekly-progress">
            <span>
              {weeklyProgress.completed}/{weeklyProgress.target} days this week
            </span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(
                    (weeklyProgress.completed / weeklyProgress.target) * 100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        )}

        <div className="completion-section">
          <div className="today-section">
            <input
              type="checkbox"
              id={`today-${habit.habitId}`}
              checked={completedToday}
              onChange={() => toggleHabit(habit.habitId)}
            />
            <label htmlFor={`today-${habit.habitId}`}>
              {completedToday
                ? "Done for today"
                : "Mark as completed for today"}
            </label>
          </div>

          <div className="previous-days-section">
            <button
              className="custom-date-btn"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              {showDatePicker ? "Hide" : "Select"} Custom Date
            </button>

            {showDatePicker && (
              <div className="date-picker-section">
                <label>Select any date to toggle completion:</label>
                <div className="date-input-row">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                  />
                  <button
                    onClick={handleDateSelection}
                    disabled={!selectedDate}
                    className={`date-action-btn ${
                      selectedDate &&
                      isDoneOnDate(habit.habitId, selectedDate)
                        ? "remove"
                        : "add"
                    }`}
                  >
                    {selectedDate &&
                    isDoneOnDate(habit.habitId, selectedDate)
                      ? "Remove"
                      : "Add"}
                  </button>
                  <button
                    onClick={() => {
                      setShowDatePicker(false);
                      setSelectedDate("");
                    }}
                    className="date-action-btn cancel"
                  >
                    Cancel
                  </button>
                </div>
                {selectedDate && (
                  <div className="date-status-info">
                    {isDoneOnDate(habit.habitId, selectedDate)
                      ? 'This date is already completed. Click "Remove" to unmark it.'
                      : 'This date is not completed. Click "Add" to mark it as done.'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="completion-history">
          <h4>Recent Activity:</h4>
          <div className="history-grid">
            {completionHistory.map(
              ({ dateString, isCompleted, dayNumber, isToday }) => (
                <div
                  key={dateString}
                  className={`history-day ${
                    isCompleted ? "completed" : "not-completed"
                  } ${isToday ? "today" : ""}`}
                  title={new Date(dateString).toLocaleDateString()}
                >
                  {dayNumber}
                </div>
              )
            )}
          </div>
          <div className="history-legend">
            Last 14 days (today has blue border)
          </div>
        </div>
      </div>
    </div>
  );
}
