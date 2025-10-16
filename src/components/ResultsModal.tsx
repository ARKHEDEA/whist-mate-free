import { useState, useEffect } from 'react'
import { Button, Modal } from './ui'

interface ResultsModalProps {
  isOpen: boolean
  onClose: () => void
  players: { id: string; name: string }[]
  bids: number[]
  maxTricks: number
  dealerIndex?: number // Index of the dealer (starting player)
  onSaveResults: (results: number[]) => void
}

export function ResultsModal({ isOpen, onClose, players, bids, maxTricks, dealerIndex = 0, onSaveResults }: ResultsModalProps) {
  const [results, setResults] = useState<(number | null)[]>(Array(players.length).fill(null))
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(dealerIndex)

  // Reset when modal opens and start with dealer
  useEffect(() => {
    if (isOpen) {
      setResults(Array(players.length).fill(null))
      setCurrentPlayerIndex(dealerIndex)
    }
  }, [isOpen, players.length, dealerIndex])

  const handleResultClick = (result: number) => {
    const newResults = [...results]
    newResults[currentPlayerIndex] = result
    setResults(newResults)
    
    // Move to next player in dealer order
    if (newResults.some(r => r === null)) {
      // Find next player without a result, starting from current position
      let nextPlayerIndex = currentPlayerIndex
      for (let i = 1; i < players.length; i++) {
        const checkIndex = (currentPlayerIndex + i) % players.length
        if (newResults[checkIndex] === null) {
          nextPlayerIndex = checkIndex
          break
        }
      }
      setCurrentPlayerIndex(nextPlayerIndex)
    }
  }

  const handleSave = () => {
    if (results.every(result => result !== null)) {
      const resultsSum = results.reduce((sum, result) => (sum || 0) + (result || 0), 0)
      if (resultsSum === maxTricks) {
        onSaveResults(results as number[])
        onClose()
        // Reset for next time
        setResults(Array(players.length).fill(null))
        setCurrentPlayerIndex(0)
      }
    }
  }

  const handleReset = () => {
    setResults(Array(players.length).fill(null))
    setCurrentPlayerIndex(0)
  }

  const currentPlayer = players[currentPlayerIndex]
  const resultsSum = results.reduce((sum, result) => (sum || 0) + (result || 0), 0)
  const allResultsEntered = results.every(result => result !== null)
  const isValidSum = resultsSum === maxTricks

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Rezultate - Mâna (total ${maxTricks} levate)`}
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
              Jucător {currentPlayerIndex + 1} din {players.length} | 
              <span className="text-blue-400"> Pariu: {bids[currentPlayerIndex]}</span>
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

        {/* Result Buttons - Smaller and inline */}
        <div className="flex flex-wrap justify-center gap-1">
          {Array.from({ length: maxTricks + 1 }, (_, i) => {
            const isSelected = results[currentPlayerIndex] === i
            
            return (
              <Button
                key={i}
                variant={isSelected ? "primary" : "secondary"}
                onClick={() => handleResultClick(i)}
                className={`h-8 w-8 text-sm font-bold flex-shrink-0 ${
                  isSelected
                    ? 'bg-yellow-500 text-black border-yellow-500'
                    : 'hover:bg-yellow-500 hover:text-black'
                }`}
              >
                {i}
              </Button>
            )
          })}
        </div>

        {/* Compact Summary */}
        <div className="grid grid-cols-2 gap-3">
          {/* Current Results Overview */}
          <div className="bg-gray-700 p-2 rounded-lg">
            <h4 className="font-medium text-gray-300 text-xs mb-1">Rezultate curente:</h4>
            <div className="space-y-0.5 text-xs">
              {players.map((player, index) => (
                <div key={player.id} className={`flex justify-between ${
                  index === currentPlayerIndex ? 'text-yellow-400 font-bold' : ''
                }`}>
                  <span className="truncate">{player.name}</span>
                  <span>
                    <span className="text-gray-400">{bids[index]} → </span>
                    <span className="font-bold">
                      {results[index] !== null ? results[index] : '?'}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className={`p-2 rounded-lg text-xs ${
            allResultsEntered && !isValidSum ? 'bg-red-900/30 border border-red-700' : 'bg-gray-700'
          }`}>
            <p className="font-medium">
              <strong>Suma:</strong> {resultsSum} / {maxTricks}
            </p>
            {allResultsEntered && !isValidSum && (
              <p className="text-red-400 font-medium mt-1">
                ⚠️ Trebuie exact {maxTricks}!
              </p>
            )}
            {isValidSum && (
              <p className="text-green-400 font-medium mt-1">
                ✓ Suma corectă!
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
            disabled={!allResultsEntered || !isValidSum}
            className="flex-1 text-sm py-2"
          >
            Salvează Rezultatele
          </Button>
        </div>
      </div>
    </Modal>
  )
}