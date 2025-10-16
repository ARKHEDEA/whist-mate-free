import { useState, useEffect } from 'react'
import { Button, Modal } from './ui'

interface BidModalProps {
  isOpen: boolean
  onClose: () => void
  players: { id: string; name: string }[]
  maxTricks: number // This will be maxBids for validation
  actualTricks?: number // The actual number of tricks available
  existingBids?: (number | null)[] // Existing bids for editing
  dealerIndex?: number // Index of the dealer (starting player)
  onSaveBids: (bids: number[]) => void
}

export function BidModal({ isOpen, onClose, players, maxTricks, actualTricks, existingBids, dealerIndex = 0, onSaveBids }: BidModalProps) {
  const [bids, setBids] = useState<(number | null)[]>(existingBids || Array(players.length).fill(null))
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)

  // Update bids when modal opens with existing bids
  useEffect(() => {
    if (isOpen) {
      const initialBids = existingBids || Array(players.length).fill(null)
      setBids(initialBids)
      // Find first player without a bid, starting from dealer
      let firstEmptyIndex = -1
      for (let i = 0; i < players.length; i++) {
        const playerIndex = (dealerIndex + i) % players.length
        if (initialBids[playerIndex] === null) {
          firstEmptyIndex = playerIndex
          break
        }
      }
      setCurrentPlayerIndex(firstEmptyIndex >= 0 ? firstEmptyIndex : dealerIndex)
    }
  }, [isOpen, existingBids, players.length, dealerIndex])

  // Auto-select bid for last player if only one option is valid
  useEffect(() => {
    if (isCurrentPlayerLastToBid() && bids[currentPlayerIndex] === null) {
      const currentSum = getCurrentBidsSum()
      const tricksToCheck = actualTricks || maxTricks
      const maxPossibleBid = tricksToCheck
      
      // Find all valid bids (those that don't make sum equal to tricksToCheck)
      const validBids: number[] = []
      for (let i = 0; i <= maxPossibleBid; i++) {
        if ((currentSum || 0) + i !== tricksToCheck) {
          validBids.push(i)
        }
      }
      
      // If only one valid option, auto-select it
      if (validBids.length === 1) {
        const newBids = [...bids]
        newBids[currentPlayerIndex] = validBids[0]
        setBids(newBids)
      }
    }
  }, [currentPlayerIndex, bids, players.length, actualTricks, maxTricks, dealerIndex])

  const getLastPlayerInBiddingOrder = () => {
    // Last player in bidding order is the one before dealer (previous player in circular order)
    return (dealerIndex - 1 + players.length) % players.length
  }

  const isCurrentPlayerLastToBid = () => {
    const lastPlayerIndex = getLastPlayerInBiddingOrder()
    return currentPlayerIndex === lastPlayerIndex
  }

  const getCurrentBidsSum = () => {
    // Sum all bids except the current player's bid
    return bids.reduce((sum, bid, index) => {
      if (index === currentPlayerIndex) return sum || 0
      return (sum || 0) + (bid || 0)
    }, 0)
  }

  const handleBidClick = (bid: number) => {
    const newBids = [...bids]
    newBids[currentPlayerIndex] = bid
    setBids(newBids)
    
    // Move to next player in dealer order
    if (newBids.some(b => b === null)) {
      // Find next player without a bid, starting from current position
      let nextPlayerIndex = currentPlayerIndex
      for (let i = 1; i < players.length; i++) {
        const checkIndex = (currentPlayerIndex + i) % players.length
        if (newBids[checkIndex] === null) {
          nextPlayerIndex = checkIndex
          break
        }
      }
      setCurrentPlayerIndex(nextPlayerIndex)
    }
  }

  const handleSave = () => {
    if (bids.every(bid => bid !== null)) {
      const totalBids = bids.reduce((sum, bid) => (sum || 0) + (bid || 0), 0)
      const tricksToCheck = actualTricks || maxTricks
      // Check if sum equals actual tricks (forbidden in Whist)
      if (totalBids === tricksToCheck) {
        return // Don't save if sum equals actual tricks
      }
      onSaveBids(bids as number[])
      onClose()
      // Reset for next time
      setBids(Array(players.length).fill(null))
      setCurrentPlayerIndex(0)
    }
  }

  const handleReset = () => {
    setBids(Array(players.length).fill(null))
    setCurrentPlayerIndex(0)
  }

  const currentPlayer = players[currentPlayerIndex]
  const bidSum = bids.reduce((sum, bid) => (sum || 0) + (bid || 0), 0)
  const allBidsEntered = bids.every(bid => bid !== null)
  const isSumForbidden = bidSum === maxTricks

  const tricksCount = actualTricks || maxTricks
  const modalTitle = `Pariuri - Mâna ${tricksCount} (pariuri max suma ${maxTricks})`

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      className="max-w-2xl"
    >
      <div className="space-y-3">
        {/* Player Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              const prevIndex = (currentPlayerIndex - 1 + players.length) % players.length
              setCurrentPlayerIndex(prevIndex)
            }}
            className="px-3 py-1 text-sm"
          >
            ← Anterior
          </Button>
          
          <div className="text-center">
            <h3 className="text-base font-bold text-yellow-500">
              {currentPlayer?.name}
            </h3>
            <p className="text-xs text-gray-400">
              Jucător {currentPlayerIndex + 1} din {players.length}
              {isCurrentPlayerLastToBid() && (
                <span className="text-orange-400"> | Ultimul - atenție suma!</span>
              )}
            </p>
          </div>
          
          <Button
            variant="ghost"
            onClick={() => {
              const nextIndex = (currentPlayerIndex + 1) % players.length
              setCurrentPlayerIndex(nextIndex)
            }}
            className="px-3 py-1 text-sm"
          >
            Următor →
          </Button>
        </div>

        {/* Bid Buttons - Smaller and inline */}
        <div className="flex flex-wrap justify-center gap-1">
          {Array.from({ length: (actualTricks || maxTricks) + 1 }, (_, i) => {
            const isLastToBid = isCurrentPlayerLastToBid()
            const currentSum = getCurrentBidsSum()
            const tricksToCheck = actualTricks || maxTricks
            const wouldMakeForbiddenSum = isLastToBid && ((currentSum || 0) + i === tricksToCheck)
            const isSelected = bids[currentPlayerIndex] === i
            
            return (
              <Button
                key={i}
                variant={isSelected ? "primary" : "secondary"}
                onClick={() => handleBidClick(i)}
                disabled={wouldMakeForbiddenSum}
                className={`h-8 w-8 text-sm font-bold backdrop-blur-sm border border-white/20 flex-shrink-0 ${
                  wouldMakeForbiddenSum 
                    ? 'opacity-50 cursor-not-allowed bg-white/5' 
                    : isSelected
                    ? 'bg-yellow-500 text-black border-yellow-500'
                    : 'bg-white/10 hover:bg-white/20 hover:text-white transition-all duration-200'
                }`}
              >
                {i}
                {wouldMakeForbiddenSum && (
                  <span className="text-xs block">❌</span>
                )}
              </Button>
            )
          })}
        </div>

        {/* Compact Summary */}
        <div className="grid grid-cols-2 gap-3">
          {/* Current Bids Overview */}
          <div className="bg-gray-700 p-2 rounded-lg">
            <h4 className="font-medium text-gray-300 text-xs mb-1">Pariuri curente:</h4>
            <div className="space-y-0.5 text-xs">
              {players.map((player, index) => (
                <div key={player.id} className={`flex justify-between ${
                  index === currentPlayerIndex ? 'text-yellow-400 font-bold' : ''
                }`}>
                  <span className="truncate">{player.name}</span>
                  <span>{bids[index] !== null ? bids[index] : '?'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className={`p-2 rounded-lg text-xs ${
            isSumForbidden ? 'bg-red-900/30 border border-red-700' : 'bg-gray-700'
          }`}>
            <p className="font-medium">
              <strong>Suma:</strong> {bidSum} / max {maxTricks}
            </p>
            <p className="text-yellow-400 mt-1">
              Regula: suma ≠ {tricksCount}
            </p>
            {isSumForbidden && allBidsEntered && (
              <p className="text-red-400 font-medium mt-1">
                ⚠️ Suma nu poate fi = {maxTricks}!
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={handleReset}
            className="flex-1 text-sm py-2"
          >
            Reset Toate
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!allBidsEntered || isSumForbidden}
            className="flex-1 text-sm py-2"
          >
            Salvează Pariurile
          </Button>
        </div>
      </div>
    </Modal>
  )
}