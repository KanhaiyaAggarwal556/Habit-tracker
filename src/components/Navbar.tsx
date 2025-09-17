import "../styles/Navbar.css"
export default function Navbar() {
  return (
    <div className='navbar'>
        <div className='logo'>
            <h3> Habit Tracker</h3>
        </div>
        <div >
            <input type="text" className='search-bar' placeholder=' Search Habits '/>
            <button className='search-button' >Search</button>
        </div>
    </div>
  )
}
