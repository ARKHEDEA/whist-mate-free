import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card } from '../components/ui'
import { BidModal } from '../components/BidModal'
import { ResultsModal } from '../components/ResultsModal'

type Player = {
  id: string
  name: string
  points: number
  winStreak: number // Consecutive wins (excluding 1-trick hands)
  loseStreak: number // Consecutive losses (excluding 1-trick hands)
}

type Hand = {
  handNo: number
  maxTricks: number
  maxBids: number // Maximum sum of bids allowed
  dealerIndex: number
  bids: (number | null)[]
  results: (number | null)[]
}

type Game = {
  id: string
  type: string
  playerCount: number
  players: Player[]
  hands: Hand[]
  currentHandIndex: number
  isFinished: boolean
  createdAt: number
}

export default function GameGridPage() {
  const [game, setGame] = useState<Game | null>(null)
  const [bidModalOpen, setBidModalOpen] = useState(false)
  const [resultsModalOpen, setResultsModalOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const savedGame = localStorage.getItem('whist:lastGame')
    if (!savedGame) {
      navigate('/')
      return
    }
    
    const gameData = JSON.parse(savedGame)
    
    // Migrate old players to include streak tracking
    gameData.players = gameData.players.map((player: any) => ({
      ...player,
      winStreak: player.winStreak || 0,
      loseStreak: player.loseStreak || 0
    }))
    
    // Generate hands if not exists
    if (!gameData.hands || gameData.hands.length === 0) {
      gameData.hands = generateHandsSequence(gameData.type, gameData.playerCount)
      localStorage.setItem('whist:lastGame', JSON.stringify(gameData))
    }
    
    setGame(gameData)
  }, [navigate])

  const generateHandsSequence = (type: string, playerCount: number) => {
    let sequence: number[]
    
    if (type === '11-88-11') {
      const ones = Array(playerCount).fill(1)  // Number of players times 1 trick
      const up = [2, 3, 4, 5, 6, 7]  // 2 to 7
      const eights = Array(playerCount).fill(8)  // Number of players times 8 tricks
      const down = [7, 6, 5, 4, 3, 2]  // 7 to 2
      const onesAgain = Array(playerCount).fill(1)  // Number of players times 1 trick again
      
      sequence = [...ones, ...up, ...eights, ...down, ...onesAgain]
    } else { // 88-11-88
      const eights = Array(playerCount).fill(8)  // Number of players times 8 tricks
      const down = [7, 6, 5, 4, 3, 2]  // 7 to 2
      const ones = Array(playerCount).fill(1)  // Number of players times 1 trick
      const up = [2, 3, 4, 5, 6, 7]  // 2 to 7
      const eightsAgain = Array(playerCount).fill(8)  // Number of players times 8 tricks again
      
      sequence = [...eights, ...down, ...ones, ...up, ...eightsAgain]
    }
    
    return sequence.map((maxTricks, index) => ({
      handNo: index + 1,
      maxTricks,
      maxBids: maxTricks, // Max bids should always be the number of tricks available
      dealerIndex: index % playerCount,
      bids: Array(playerCount).fill(null),
      results: Array(playerCount).fill(null)
    }))
  }

  const currentHand = game?.hands[game.currentHandIndex]
  const canPlaceBids = currentHand && !currentHand.results.some(result => result !== null)
  const canInputResults = currentHand && currentHand.bids.some(bid => bid !== null) && currentHand.results.every(result => result === null)

  const handleSaveBids = (bids: number[]) => {
    if (!game || !currentHand) return
    
    const updatedGame = { ...game }
    updatedGame.hands[game.currentHandIndex].bids = bids
    
    setGame(updatedGame)
    localStorage.setItem('whist:lastGame', JSON.stringify(updatedGame))
  }

  const calculateStreaksAtHand = (playerIndex: number, upToHandIndex: number) => {
    if (!game) return { winStreak: 0, loseStreak: 0 }
    
    let winStreak = 0
    let loseStreak = 0
    
    // Go through hands up to (but not including) the current hand
    for (let i = 0; i < upToHandIndex; i++) {
      const hand = game.hands[i]
      const bid = hand.bids[playerIndex]
      const result = hand.results[playerIndex]
      
      // Skip if no results or if it's a 1-trick hand
      if (bid === null || result === null || hand.maxTricks === 1) {
        continue
      }
      
      const won = bid === result
      
      if (won) {
        winStreak++
        loseStreak = 0
        
        // Check if this would trigger a bonus (and reset)
        if (winStreak >= 5) {
          winStreak = 0 // Reset after bonus
        }
      } else {
        loseStreak++
        winStreak = 0
        
        // Check if this would trigger a penalty (and reset)
        if (loseStreak >= 5) {
          loseStreak = 0 // Reset after penalty
        }
      }
    }
    
    return { winStreak, loseStreak }
  }

  const calculatePointsForDisplay = (hand: Hand, playerIndex: number, currentStreaks: {winStreak: number, loseStreak: number}) => {
    const bid = hand.bids[playerIndex]
    const result = hand.results[playerIndex]
    
    if (bid === null || result === null) return null
    
    const won = bid === result
    const difference = Math.abs(bid - result)
    const isOneTrickHand = hand.maxTricks === 1
    
    if (won) {
      // Check if this win would give 5+ streak (only for non-1-trick hands)
      let basePoints = 5 + bid
      if (!isOneTrickHand && currentStreaks.winStreak >= 4) { // This would be the 5th
        basePoints = 10 + bid
      }
      return { points: `+${basePoints}`, hasBonus: !isOneTrickHand && currentStreaks.winStreak >= 4 }
    } else {
      // Check if this loss would give 5+ streak (only for non-1-trick hands)
      let penalty = difference
      if (!isOneTrickHand && currentStreaks.loseStreak >= 4) { // This would be the 5th
        penalty = 5 + difference
      }
      return { points: `-${penalty}`, hasBonus: !isOneTrickHand && currentStreaks.loseStreak >= 4 }
    }
  }

  const handleSaveResults = (results: number[]) => {
    if (!game || !currentHand) return
    
    const updatedGame = { ...game }
    const hand = updatedGame.hands[game.currentHandIndex]
    hand.results = results
    
    const isOneTrickHand = hand.maxTricks === 1
    
    // Calculate points and update streaks
    updatedGame.players.forEach((player, index) => {
      const bid = hand.bids[index]
      const result = results[index]
      const won = bid === result
      const difference = Math.abs(bid! - result)
      
      if (won) {
        // Player won
        let pointsToAdd = 5 + bid! // Base: 5 points + bid amount
        let gotBonus = false
        
        if (!isOneTrickHand) {
          player.winStreak++
          player.loseStreak = 0 // Reset lose streak
          
          // 5 wins in a row bonus (excluding 1-trick hands)
          if (player.winStreak >= 5) {
            pointsToAdd = 10 + bid! // 10 + bid instead of 5 + bid
            gotBonus = true
          }
        }
        
        player.points += pointsToAdd
        
        // Reset streak after applying bonus
        if (gotBonus) {
          player.winStreak = 0
        }
      } else {
        // Player lost
        let pointsToSubtract = difference
        let gotPenalty = false
        
        if (!isOneTrickHand) {
          player.loseStreak++
          player.winStreak = 0 // Reset win streak
          
          // 5 losses in a row penalty (excluding 1-trick hands)
          if (player.loseStreak >= 5) {
            pointsToSubtract = 5 + difference // Extra 5 points penalty
            gotPenalty = true
          }
        }
        
        player.points -= pointsToSubtract
        
        // Reset streak after applying penalty
        if (gotPenalty) {
          player.loseStreak = 0
        }
      }
    })
    
    // Move to next hand
    if (game.currentHandIndex < game.hands.length - 1) {
      updatedGame.currentHandIndex++
    } else {
      updatedGame.isFinished = true
    }
    
    setGame(updatedGame)
    localStorage.setItem('whist:lastGame', JSON.stringify(updatedGame))
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card>
          <p>Se încarcă jocul...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Scor - Mâna {game.currentHandIndex + 1}</h1>
            <Button variant="ghost" onClick={() => navigate('/')}>
              Meniu
            </Button>
          </div>
        </Card>

        {/* Score Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-2">#</th>
                  {game.players.map((player, playerIndex) => {
                    const isCurrentDealer = currentHand && currentHand.dealerIndex === playerIndex
                    return (
                      <th key={player.id} className={`p-2 text-center ${isCurrentDealer ? 'bg-yellow-500/20 border border-yellow-500/50' : ''}`}>
                        {player.name}
                        {isCurrentDealer && <span className="ml-1 text-yellow-400">🃏</span>}
                        <div className="text-yellow-500 font-bold">
                          {player.points} pct
                        </div>
                        {(player.winStreak > 0 || player.loseStreak > 0) && (
                          <div className="text-xs mt-1">
                            {player.winStreak > 0 && (
                              <span className="text-green-400">🔥 {player.winStreak}W</span>
                            )}
                            {player.loseStreak > 0 && (
                              <span className="text-red-400">❄️ {player.loseStreak}L</span>
                            )}
                          </div>
                        )}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {game.hands.slice(0, game.currentHandIndex + 1).map((hand, handIndex) => (
                  <tr key={handIndex} className="border-b border-gray-800">
                    <td className="p-2">
                      <div className="text-center">
                        <div className="font-bold">{hand.handNo}</div>
                        <div className="text-xs text-gray-400">
                          max {hand.maxTricks}
                        </div>
                        {(hand.maxTricks === 1 || hand.maxTricks === 8) && (
                          <div className="text-xs text-yellow-400">
                            pariuri: max {hand.maxBids}
                          </div>
                        )}
                      </div>
                    </td>
                    {game.players.map((player, playerIndex) => {
                      const bid = hand.bids[playerIndex]
                      const result = hand.results[playerIndex]
                      const hasResult = result !== null
                      const won = hasResult && bid === result
                      const lost = hasResult && bid !== result
                      
                      // Calculate streaks at this point in the game
                      const currentStreaks = calculateStreaksAtHand(playerIndex, handIndex)
                      const pointsDisplay = hasResult ? calculatePointsForDisplay(hand, playerIndex, currentStreaks) : null
                      
                      // Determine cell background color only for bonus streaks
                      let cellBgClass = ''
                      if (pointsDisplay?.hasBonus) {
                        if (won) {
                          cellBgClass = 'bg-green-500/20 border-green-500/30' // Green for win streak bonus
                        } else if (lost) {
                          cellBgClass = 'bg-red-500/20 border-red-500/30' // Red for lose streak penalty
                        }
                      }
                      
                      return (
                        <td key={player.id} className={`p-2 text-center border ${cellBgClass}`}>
                          <div className="space-y-1">
                            <div className="text-sm">
                              pariu: <span className={lost ? 'line-through text-red-400' : ''}>{bid ?? '-'}</span>
                            </div>
                            <div className="text-sm">
                              rezultat: {result ?? '-'}
                            </div>
                            {pointsDisplay && (
                              <div className="text-xs">
                                {won ? (
                                  <span className="text-green-400 font-bold">✓ {pointsDisplay.points} pct</span>
                                ) : (
                                  <span className="text-red-400 font-bold">✗ {pointsDisplay.points} pct</span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Actions */}
        <Card>
          <div className="flex gap-4 justify-center">
            {game.isFinished ? (
              <div className="text-center">
                <h2 className="text-xl font-bold text-yellow-500 mb-4">🎉 Joc Terminat!</h2>
                <div className="space-y-2 mb-4">
                  {game.players
                    .sort((a, b) => b.points - a.points)
                    .map((player, index) => (
                      <div key={player.id} className="flex justify-between">
                        <span>#{index + 1} {player.name}</span>
                        <span className="font-bold">{player.points} pct</span>
                      </div>
                    ))}
                </div>
                <Button onClick={() => navigate('/')}>
                  Înapoi la Meniu
                </Button>
              </div>
            ) : (
              <>
                {canPlaceBids && (
                  <Button onClick={() => setBidModalOpen(true)}>
                    {currentHand?.bids.some(bid => bid !== null) ? 'Modifică pariuri' : 'Plasează pariuri'}
                  </Button>
                )}
                {canInputResults && (
                  <Button onClick={() => setResultsModalOpen(true)}>
                    Introdu rezultate
                  </Button>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Free version notice */}
        <Card className="bg-gray-700">
          <div className="text-center">
            <p className="text-sm text-gray-300">
              🆓 <strong>Whist Mate Free</strong> - Funcționalități de bază pentru joc
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Pentru notificări inteligente, podium cu efecte și funcții avansate, vezi versiunea Pro
            </p>
          </div>
        </Card>
      </div>

      {/* Bid Modal */}
      <BidModal
        isOpen={bidModalOpen}
        onClose={() => setBidModalOpen(false)}
        players={game.players}
        maxTricks={currentHand?.maxBids || 1} // Use maxBids for bid validation
        actualTricks={currentHand?.maxTricks} // Actual number of tricks
        existingBids={currentHand?.bids} // Pass existing bids for editing
        dealerIndex={currentHand?.dealerIndex || 0} // Start with dealer
        onSaveBids={handleSaveBids}
      />

      {/* Results Modal */}
      <ResultsModal
        isOpen={resultsModalOpen}
        onClose={() => setResultsModalOpen(false)}
        players={game.players}
        bids={currentHand?.bids as number[] || []}
        maxTricks={currentHand?.maxTricks || 1}
        dealerIndex={currentHand?.dealerIndex || 0} // Start with dealer
        onSaveResults={handleSaveResults}
      />
    </div>
  )
}