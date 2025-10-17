import { Button, Card } from './ui'

export function UpgradeToPro() {
  const playUrl = import.meta.env.VITE_PRO_PLAY_STORE_URL
  const msStoreUrl = import.meta.env.VITE_PRO_MS_STORE_URL
  const webProUrl = import.meta.env.VITE_PRO_WEB_URL
  const price = import.meta.env.VITE_PRO_PRICE || '4.99'
  const currency = import.meta.env.VITE_PRO_CURRENCY || 'USD'

  function goAndroid() { 
    if (playUrl) {
      window.open(playUrl, '_blank')
    }
  }
  
  function goWindows() { 
    if (msStoreUrl) {
      window.location.href = msStoreUrl
    }
  }
  
  function goWeb() { 
    if (webProUrl) {
      window.open(webProUrl, '_blank')
    }
  }

  return (
    <Card className="border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
      <div className="text-center space-y-4">
        <div className="text-3xl">⭐</div>
        <h2 className="text-xl font-bold text-yellow-400">Upgrade la Whist Mate PRO</h2>
        
        <div className="text-sm text-gray-300 space-y-2">
          <p className="font-medium">Obține toate funcțiile avansate:</p>
          <div className="text-xs text-gray-400 space-y-1">
            <p>✨ Podium cu efecte speciale</p>
            <p>🔔 Notificări inteligente</p>
            <p>📊 Statistici avansate</p>
            <p>🎨 Teme personalizate</p>
            <p>🚫 Fără reclame</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-lg font-bold text-yellow-400">
            Doar ${price} {currency}
          </p>
          
          <div className="grid gap-2">
            {playUrl && (
              <Button 
                onClick={goAndroid}
                className="bg-gradient-to-r from-green-600 to-green-500 text-white font-bold hover:from-green-500 hover:to-green-400"
              >
                📱 Upgrade pe Google Play
              </Button>
            )}
            
            {msStoreUrl && (
              <Button 
                onClick={goWindows}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold hover:from-blue-500 hover:to-blue-400"
              >
                🪟 Upgrade pe Microsoft Store
              </Button>
            )}
            
            {webProUrl && (
              <Button 
                onClick={goWeb}
                variant="ghost"
                className="text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black"
              >
                🌐 Află mai multe despre PRO
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
