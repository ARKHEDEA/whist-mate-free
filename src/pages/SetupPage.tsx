import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card } from '../components/ui'
import { UpgradePrompt } from '../components/UpgradePrompt'

type GameType = '11-88-11' | '88-11-88'

export default function SetupPage() {
  const [gameType, setGameType] = useState<GameType>('11-88-11')
  const [playerCount, setPlayerCount] = useState<4 | 5 | 6>(4)
  const navigate = useNavigate()

  const handleContinue = () => {
    const gameConfig = {
      type: gameType,
      playerCount,
      prizeMode: 'none', // Free version doar fără premiere
      prizeSize: 0
    }
    
    localStorage.setItem('whist:gameConfig', JSON.stringify(gameConfig))
    navigate('/players')
  }

  const handleUpgrade = () => {
    const proUrl = import.meta.env.VITE_PRO_WEB_URL || import.meta.env.VITE_PRO_PLAY_STORE_URL
    if (proUrl) {
      window.open(proUrl, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <h1 className="text-2xl font-bold text-center mb-6">Setări joc</h1>
          
          <div className="space-y-6">
            {/* Game Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Tip joc</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="11-88-11"
                    checked={gameType === '11-88-11'}
                    onChange={(e) => setGameType(e.target.value as GameType)}
                    className="mr-2"
                  />
                  11-88-11
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="88-11-88"
                    checked={gameType === '88-11-88'}
                    onChange={(e) => setGameType(e.target.value as GameType)}
                    className="mr-2"
                  />
                  88-11-88
                </label>
              </div>
            </div>

            {/* Player Count */}
            <div>
              <label className="block text-sm font-medium mb-2">Număr jucători</label>
              <div className="flex gap-2">
                {[4, 5, 6].map(count => (
                  <Button
                    key={count}
                    variant={playerCount === count ? 'primary' : 'secondary'}
                    onClick={() => setPlayerCount(count as 4 | 5 | 6)}
                    className="flex-1"
                  >
                    {count}
                  </Button>
                ))}
              </div>
            </div>

            {/* Free Version Notice */}
            <UpgradePrompt 
              featureName="Sistem de premiere și funcții avansate"
              onUpgrade={handleUpgrade}
            />
          </div>

          <div className="flex gap-4 mt-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex-1"
            >
              Înapoi
            </Button>
            <Button 
              variant="primary" 
              onClick={handleContinue}
              className="flex-1"
            >
              Continuă
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}