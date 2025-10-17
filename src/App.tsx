import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import StartPage from './pages/StartPage'
import SetupPage from './pages/SetupPage'
import PlayersPage from './pages/PlayersPage'
import GameGridPage from './pages/GameGridPage'
import './index.css'

function App() {
  return (
    <Router basename="/whist-mate-free">
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/game" element={<GameGridPage />} />
      </Routes>
    </Router>
  )
}

export default App