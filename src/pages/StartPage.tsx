import { Link } from 'react-router-dom'
import { Button, Card } from '../components/ui'
import { UpgradePrompt } from '../components/UpgradePrompt'

export default function StartPage() {
  const hasGame = localStorage.getItem('whist:lastGame')

  const handleUpgrade = () => {
    const proUrl = import.meta.env.VITE_PRO_WEB_URL || import.meta.env.VITE_PRO_PLAY_STORE_URL
    if (proUrl) {
      window.open(proUrl, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-yellow-500">🃏 Whist Mate</h1>
          <p className="text-gray-300">Free Version</p>
          
          <div className="space-y-4">
            <Link to="/setup" className="block">
              <Button variant="primary" className="w-full">
                Începe joc nou
              </Button>
            </Link>
            
            {hasGame && (
              <Link to="/game" className="block">
                <Button variant="secondary" className="w-full">
                  Continuă jocul trecut
                </Button>
              </Link>
            )}
          </div>
          
          <div className="text-xs text-gray-500 mt-8">
            <p>Versiunea gratuită include funcționalități de bază pentru joc</p>
          </div>
          
          {/* Upgrade Prompt */}
          <UpgradePrompt 
            featureName="Funcții avansate"
            onUpgrade={handleUpgrade}
          />
        </div>
      </Card>
    </div>
  )
}