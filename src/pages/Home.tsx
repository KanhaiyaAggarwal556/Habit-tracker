import CreateHabit from "../components/CreateHabit";
import Habits from "../components/Habits";
import "../styles/Home.css";
export default function Home() {
  return (
    <div className = "home-container">
        <div className="create-habit-button"> <CreateHabit/> </div>
        <Habits/>
    </div>
  )
}
