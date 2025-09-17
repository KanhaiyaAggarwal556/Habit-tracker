import { useState } from "react";
import "../styles/CreateHabit.css";
import { BadgePlus, X } from "lucide-react";
import { useHabits } from "../context/HabitContext";

export default function CreateHabit() {
  const { createHabit } = useHabits();
  const [state, setState] = useState(false);
  const [habitName, setHabitName] = useState("");
  const [tracking, setTracking] = useState<"daily" | "weekly">("daily");

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setState(!state);
  };

  const handleSubmit = () => {
    if (!habitName.trim()) {
      alert("Please enter a habit name");
      return;
    }

    createHabit({ habitName, trackingType: tracking });
    setHabitName("");
    setTracking("daily");
    setState(false);
  };

  return (
    <div className="create-habit-container">
      <button className="create-habit" onClick={handleClick}>
        <span className="create-logo">
          <BadgePlus />
        </span>
        Create New Habit
      </button>

      {state && (
        <div className="form-dropdown">
          <div className="form-container">
            <div className="habit-form">
              <label className="habit-label">Habit Name:</label>
              <input
                type="text"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                className="habit-input"
                placeholder="Enter habit name"
              />
              <label className="habit-label">Tracking:</label>
              <select
                value={tracking}
                onChange={(e) =>
                  setTracking(e.target.value as "daily" | "weekly")
                }
                className="habit-select"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
              <div className="button-group">
                <button onClick={handleSubmit} className="submit-button">
                  Add Habit
                </button>
              </div>
              <button onClick={() => setState(false)} className="close-button">
                <X size={16} />
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
