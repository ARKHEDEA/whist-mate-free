import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card } from '../components/ui'

export default function PlayersPage() {
  const [players, setPlayers] = useState<string[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const config = localStorage.getItem('whist:gameConfig')
    if (!config) {
      navigate('/setup')
      return
    }
    
    const { playerCount } = JSON.parse(config)
    // Initialize with empty strings, not default names
    setPlayers(Array(playerCount).fill(''))
  }, [navigate])

  const updatePlayer = (index: number, name: string) => {
    const newPlayers = [...players]
    newPlayers[index] = name // Don't force default name, allow empty
    setPlayers(newPlayers)
  }

  const handleStart = () => {
    const config = JSON.parse(localStorage.getItem('whist:gameConfig') || '{}')
    
    const game = {
      ...config,
      id: Date.now().toString(),
      players: players.map((name, i) => ({
        id: i.toString(),
        name: name.trim() || `Jucător ${i + 1}`, // Use placeholder if empty
        points: 0,
        winStreak: 0,
        loseStreak: 0
      })),
      hands: [],
      currentHandIndex: 0,
      isFinished: false,
      createdAt: Date.now()
    }
    
    localStorage.setItem('whist:lastGame', JSON.stringify(game))
    navigate('/game')
  }

  // Remove the validation since empty names are now acceptable
  // const allPlayersNamed = players.every(name => name.trim() !== '')

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <h1 className="text-2xl font-bold text-center mb-6">Nume jucători</h1>
          
          <div className="space-y-4">
            {players.map((player, index) => (
              <div key={index}>
                <label className="block text-sm font-medium mb-1">
                  Jucător {index + 1}
                </label>
                <input
                  type="text"
                  value={player}
                  onChange={(e) => updatePlayer(index, e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder={`Jucător ${index + 1}`}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/setup')}
              className="flex-1"
            >
              Înapoi
            </Button>
            <Button 
              variant="primary" 
              onClick={handleStart}
              className="flex-1"
            >
              Start
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}