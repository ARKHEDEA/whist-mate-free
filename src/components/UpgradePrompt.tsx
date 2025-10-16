import { Button, Card } from './ui'

interface UpgradePromptProps {
  featureName: string
  onUpgrade: () => void
}

export function UpgradePrompt({ featureName, onUpgrade }: UpgradePromptProps) {
  return (
    <Card className="border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
      <div className="text-center space-y-3">
        <div className="text-2xl">⭐</div>
        <h3 className="text-lg font-bold text-yellow-400">Upgrade la PRO</h3>
        <p className="text-sm text-gray-300">
          <strong>{featureName}</strong> este disponibilă doar în versiunea PRO
        </p>
        <div className="text-xs text-gray-400 space-y-1">
          <p>✨ Podium cu efecte speciale</p>
          <p>🔔 Notificări inteligente</p>
          <p>📊 Statistici avansate</p>
          <p>🎨 Teme personalizate</p>
        </div>
        <Button 
          onClick={onUpgrade}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold hover:from-yellow-400 hover:to-orange-400"
        >
          Obține PRO - $4.99
        </Button>
      </div>
    </Card>
  )
}