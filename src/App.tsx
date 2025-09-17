import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import { HabitProvider } from "./context/HabitContext";
import './styles/App.css';

function App() {

  return (
    <HabitProvider >
      <Navbar/>
      <Home/>
    </HabitProvider>
  )
}

export default App
