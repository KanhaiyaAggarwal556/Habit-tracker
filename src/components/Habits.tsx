import { useHabits } from "../context/HabitContext";
import Habit from "./Habit";
import "../styles/Habits.css";

export default function Habits() {
  const {
    habitsList,
    toggleHabit,
    deleteHabit,
    editHabitName,
    updateWeeklyTarget,
    isDoneToday,
    getHistory,
  } = useHabits();

  // Sort habits: incomplete first, then complete
  const sortedHabits = [...habitsList].sort((a, b) => {
    const aDone = isDoneToday(a.habitId);
    const bDone = isDoneToday(b.habitId);
    if (aDone === bDone) return 0;
    return aDone ? 1 : -1;
  });

  return (
    <div className="habits-container-grid">
      {sortedHabits.length === 0 ? (
        <p className="no-habits">No habits found. Let's create one! ✨</p>
      ) : (
        sortedHabits.map((habit) => (
          <Habit
            key={habit.habitId}
            habit={habit}
            toggleHabit={toggleHabit}
            deleteHabit={deleteHabit}
            editHabitName={editHabitName}
            updateWeeklyTarget={updateWeeklyTarget}
            isDoneToday={isDoneToday}
            getHistory={getHistory}
          />
        ))
      )}
    </div>
  );
}