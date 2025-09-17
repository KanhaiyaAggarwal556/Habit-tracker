import { useHabits } from "../context/HabitContext";
import Habit from "./Habit";
import "../styles/Habits.css";

export default function Habits() {
  const {
    habitsList,
    toggleHabit,
    updateTracking,
    isDoneToday,
    isDoneOnDate,
    getHistory,
  } = useHabits();

  return (
    <div className="habits-container">
      {habitsList.length === 0 && (
        <p className="no-habits">No habits found. Create one!</p>
      )}

      {habitsList.map((habit) => (
        <Habit
          key={habit.habitId}
          habit={habit}
          toggleHabit={toggleHabit}
          updateTracking={updateTracking}
          isDoneToday={isDoneToday}
          isDoneOnDate={isDoneOnDate}
          getHistory={getHistory}
        />
      ))}
    </div>
  );
}
