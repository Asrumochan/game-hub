import { useMemo, useState } from 'react'
import './App.css'

const gameCatalog = [
  {
    id: 'tictactoe',
    title: 'Tic-Tac-Toe',
    description: 'Classic 3x3 strategy with score tracking.',
  },
  {
    id: 'rps',
    title: 'Rock Paper Scissors',
    description: 'Fast rounds with streak and draw analytics.',
  },
  {
    id: 'memory',
    title: 'Memory Match',
    description: 'Find matching pairs in as few tries as possible.',
  },
  {
    id: 'guess',
    title: 'Number Guess',
    description: 'Guess the secret number between 1 and 100.',
  },
]

const winningPatterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

function TicTacToeGame() {
  const [board, setBoard] = useState(Array(9).fill(''))
  const [turn, setTurn] = useState('X')
  const [isOver, setIsOver] = useState(false)
  const [status, setStatus] = useState('Player X begins. Make your first move.')
  const [score, setScore] = useState({ X: 0, O: 0, draw: 0 })
  const [players, setPlayers] = useState({ X: 'Player X', O: 'Player O' })
  const [nameInput, setNameInput] = useState({ X: '', O: '' })
  const [winningCells, setWinningCells] = useState([])

  const applyNames = () => {
    const x = nameInput.X.trim() || 'Player X'
    const o = nameInput.O.trim() || 'Player O'
    if (x.toLowerCase() === o.toLowerCase()) {
      setStatus('Choose different names for each player.')
      return
    }
    setPlayers({ X: x, O: o })
    resetRound()
  }

  const findWinner = (nextBoard) => {
    for (const pattern of winningPatterns) {
      const [a, b, c] = pattern
      if (nextBoard[a] && nextBoard[a] === nextBoard[b] && nextBoard[b] === nextBoard[c]) {
        return { symbol: nextBoard[a], pattern }
      }
    }
    return null
  }

  const handleMove = (index) => {
    if (board[index] || isOver) {
      return
    }

    const nextBoard = [...board]
    nextBoard[index] = turn
    setBoard(nextBoard)

    const winner = findWinner(nextBoard)
    if (winner) {
      setScore((prev) => ({ ...prev, [winner.symbol]: prev[winner.symbol] + 1 }))
      setWinningCells(winner.pattern)
      setStatus(`${players[winner.symbol]} wins this round.`)
      setIsOver(true)
      return
    }

    if (!nextBoard.includes('')) {
      setScore((prev) => ({ ...prev, draw: prev.draw + 1 }))
      setStatus('Draw round. Start a new round to continue.')
      setIsOver(true)
      return
    }

    const nextTurn = turn === 'X' ? 'O' : 'X'
    setTurn(nextTurn)
    setStatus(`${players[nextTurn]}'s turn (${nextTurn}).`)
  }

  const resetRound = () => {
    setBoard(Array(9).fill(''))
    setTurn('X')
    setIsOver(false)
    setWinningCells([])
    setStatus(`${players.X} starts this round.`)
  }

  const resetAll = () => {
    setScore({ X: 0, O: 0, draw: 0 })
    resetRound()
    setStatus('All scores reset. Fresh match started.')
  }

  return (
    <section className="game-surface">
      <div className="toolbar two-col">
        <div className="field">
          <label htmlFor="nameX">Player X</label>
          <input
            id="nameX"
            value={nameInput.X}
            onChange={(event) => setNameInput((prev) => ({ ...prev, X: event.target.value }))}
            placeholder="Enter name"
          />
        </div>
        <div className="field">
          <label htmlFor="nameO">Player O</label>
          <input
            id="nameO"
            value={nameInput.O}
            onChange={(event) => setNameInput((prev) => ({ ...prev, O: event.target.value }))}
            placeholder="Enter name"
          />
        </div>
      </div>

      <div className="actions-row">
        <button className="btn primary" onClick={applyNames}>Apply Names</button>
        <button className="btn ghost" onClick={resetRound}>New Round</button>
        <button className="btn ghost" onClick={resetAll}>Reset Scoreboard</button>
      </div>

      <p className="status-line">{status}</p>

      <div className="score-grid three">
        <div className="score-box"><strong>{players.X}</strong><span>{score.X}</span></div>
        <div className="score-box"><strong>{players.O}</strong><span>{score.O}</span></div>
        <div className="score-box"><strong>Draws</strong><span>{score.draw}</span></div>
      </div>

      <div className="ttt-board" role="grid" aria-label="Tic-Tac-Toe board">
        {board.map((cell, index) => {
          const isWinCell = winningCells.includes(index)
          return (
            <button
              key={index}
              className={`ttt-cell ${cell === 'X' ? 'mark-x' : ''} ${cell === 'O' ? 'mark-o' : ''} ${isWinCell ? 'win-cell' : ''}`}
              onClick={() => handleMove(index)}
              disabled={Boolean(cell) || isOver}
              aria-label={`Cell ${index + 1}`}
            >
              {cell}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function RockPaperScissorsGame({ playerName }) {
  const [score, setScore] = useState({ user: 0, cpu: 0, draw: 0, streak: 0, best: 0 })
  const [status, setStatus] = useState(`${playerName}, choose a move to start the match.`)
  const [lastRound, setLastRound] = useState('No rounds played yet.')
  const [active, setActive] = useState('')
  const choices = ['rock', 'paper', 'scissors']

  const rules = {
    rock: { scissors: 'win', paper: 'lose' },
    paper: { rock: 'win', scissors: 'lose' },
    scissors: { paper: 'win', rock: 'lose' },
  }

  const playRound = (userChoice) => {
    const cpuChoice = choices[Math.floor(Math.random() * choices.length)]
    setActive(userChoice)

    if (userChoice === cpuChoice) {
      setScore((prev) => ({ ...prev, draw: prev.draw + 1, streak: 0 }))
      setStatus(`Draw round. ${playerName}, both chose the same move.`)
      setLastRound(`You: ${userChoice} | Computer: ${cpuChoice}`)
      return
    }

    const result = rules[userChoice][cpuChoice]
    if (result === 'win') {
      setScore((prev) => {
        const nextStreak = prev.streak + 1
        return {
          ...prev,
          user: prev.user + 1,
          streak: nextStreak,
          best: Math.max(prev.best, nextStreak),
        }
      })
      setStatus(`${playerName} wins. ${userChoice} beats ${cpuChoice}.`)
    } else {
      setScore((prev) => ({ ...prev, cpu: prev.cpu + 1, streak: 0 }))
      setStatus(`${playerName} loses. ${cpuChoice} beats ${userChoice}.`)
    }

    setLastRound(`You: ${userChoice} | Computer: ${cpuChoice}`)
  }

  const resetStats = () => {
    setScore({ user: 0, cpu: 0, draw: 0, streak: 0, best: 0 })
    setStatus(`Stats reset. ${playerName}, choose a move to begin again.`)
    setLastRound('No rounds played yet.')
    setActive('')
  }

  return (
    <section className="game-surface">
      <div className="actions-row">
        <button className="btn ghost" onClick={resetStats}>Reset Stats</button>
      </div>

      <p className="status-line">{status}</p>
      <p className="hint-line">{lastRound}</p>

      <div className="rps-grid">
        {choices.map((choice) => (
          <button
            key={choice}
            className={`rps-btn ${active === choice ? 'active' : ''}`}
            onClick={() => playRound(choice)}
          >
            {choice}
          </button>
        ))}
      </div>

      <div className="score-grid four">
        <div className="score-box"><strong>{playerName}</strong><span>{score.user}</span></div>
        <div className="score-box"><strong>Computer</strong><span>{score.cpu}</span></div>
        <div className="score-box"><strong>Draws</strong><span>{score.draw}</span></div>
        <div className="score-box"><strong>Best Streak</strong><span>{score.best}</span></div>
      </div>
    </section>
  )
}

function MemoryMatchGame() {
  const symbols = useMemo(() => ['A', 'B', 'C', 'D', 'E', 'F'], [])
  const shuffle = () => [...symbols, ...symbols].sort(() => Math.random() - 0.5)

  const [deck, setDeck] = useState(shuffle)
  const [revealed, setRevealed] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [status, setStatus] = useState('Find all matching pairs.')
  const [busy, setBusy] = useState(false)

  const reset = () => {
    setDeck(shuffle)
    setRevealed([])
    setMatched([])
    setMoves(0)
    setStatus('New board ready. Good luck.')
    setBusy(false)
  }

  const onFlip = (index) => {
    if (busy || revealed.includes(index) || matched.includes(index)) {
      return
    }

    const next = [...revealed, index]
    setRevealed(next)

    if (next.length === 2) {
      setMoves((prev) => prev + 1)
      const [first, second] = next

      if (deck[first] === deck[second]) {
        const nextMatched = [...matched, first, second]
        setMatched(nextMatched)
        setRevealed([])

        if (nextMatched.length === deck.length) {
          setStatus(`Board complete in ${moves + 1} moves.`)
        } else {
          setStatus('Pair matched. Keep going.')
        }
      } else {
        setBusy(true)
        setStatus('No match. Cards will flip back.')
        setTimeout(() => {
          setRevealed([])
          setBusy(false)
        }, 700)
      }
    }
  }

  return (
    <section className="game-surface">
      <div className="actions-row">
        <button className="btn ghost" onClick={reset}>Reset Board</button>
      </div>

      <p className="status-line">{status}</p>
      <p className="hint-line">Moves: {moves} | Matched: {matched.length / 2} / {deck.length / 2}</p>

      <div className="memory-grid">
        {deck.map((symbol, index) => {
          const isOpen = revealed.includes(index) || matched.includes(index)
          return (
            <button
              key={`${symbol}-${index}`}
              className={`memory-card ${isOpen ? 'open' : ''}`}
              onClick={() => onFlip(index)}
              disabled={isOpen || busy}
            >
              {isOpen ? symbol : '?'}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function NumberGuessGame({ playerName }) {
  const [target, setTarget] = useState(() => Math.floor(Math.random() * 100) + 1)
  const [value, setValue] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [best, setBest] = useState(null)
  const [status, setStatus] = useState(`${playerName}, guess a number from 1 to 100.`)

  const submitGuess = () => {
    const guess = Number(value)
    if (!guess || guess < 1 || guess > 100) {
      setStatus('Enter a valid number between 1 and 100.')
      return
    }

    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)

    if (guess === target) {
      setStatus(`Correct. ${playerName} solved it in ${nextAttempts} attempts.`)
      setBest((prev) => (prev === null ? nextAttempts : Math.min(prev, nextAttempts)))
      return
    }

    if (guess < target) {
      setStatus('Too low. Try a bigger number.')
    } else {
      setStatus('Too high. Try a smaller number.')
    }
  }

  const resetRound = () => {
    setTarget(Math.floor(Math.random() * 100) + 1)
    setValue('')
    setAttempts(0)
    setStatus(`New number generated. ${playerName}, start guessing.`)
  }

  return (
    <section className="game-surface">
      <div className="actions-row">
        <button className="btn ghost" onClick={resetRound}>New Number</button>
      </div>

      <p className="status-line">{status}</p>
      <p className="hint-line">Attempts: {attempts} | Best Score: {best ?? 'N/A'}</p>

      <div className="guess-box">
        <input
          type="number"
          min="1"
          max="100"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="1 to 100"
        />
        <button className="btn primary" onClick={submitGuess}>Submit Guess</button>
      </div>
    </section>
  )
}

function App() {
  const [nameInput, setNameInput] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [activeGame, setActiveGame] = useState('')

  const beginSession = () => {
    const normalizedName = nameInput.trim()
    if (!normalizedName) {
      return
    }

    setPlayerName(normalizedName)
  }

  const resetSession = () => {
    setPlayerName('')
    setNameInput('')
    setActiveGame('')
  }

  const renderGame = () => {
    if (!activeGame) {
      return (
        <section className="game-surface empty-state">
          <p className="status-line">Pick a game card to start playing.</p>
          <p className="hint-line">You can switch games anytime from the cards above.</p>
        </section>
      )
    }

    if (activeGame === 'tictactoe') {
      return <TicTacToeGame />
    }
    if (activeGame === 'rps') {
      return <RockPaperScissorsGame playerName={playerName} />
    }
    if (activeGame === 'memory') {
      return <MemoryMatchGame />
    }
    return <NumberGuessGame playerName={playerName} />
  }

  if (!playerName) {
    return (
      <main className="hub-shell">
        <header className="hub-header">
          <p className="eyebrow">Game Application</p>
          <h1>Arcade Hub</h1>
          <p className="subtitle">Enter your name to unlock the game menu.</p>
        </header>

        <section className="onboarding-card">
          <div className="field">
            <label htmlFor="playerName">Player Name</label>
            <input
              id="playerName"
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              placeholder="Type your name"
            />
          </div>
          <button className="btn primary" onClick={beginSession} disabled={!nameInput.trim()}>
            Continue
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="hub-shell">
      <header className="hub-header">
        {activeGame && (
          <div className="header-controls">
            <button className="btn ghost" onClick={() => setActiveGame('')}>Game Menu</button>
            <button className="btn ghost" onClick={resetSession}>Change Player</button>
          </div>
        )}
        <p className="eyebrow">Game Application</p>
        <h1>Arcade Hub</h1>
        <p className="subtitle">Welcome, {playerName}. Choose your game card to play.</p>
      </header>

      <section className="game-picker">
        {gameCatalog.map((game) => (
          <button
            key={game.id}
            className={`picker-card ${activeGame === game.id ? 'active' : ''}`}
            onClick={() => setActiveGame(game.id)}
          >
            <strong>{game.title}</strong>
            <span>{game.description}</span>
          </button>
        ))}
      </section>

      {renderGame()}
    </main>
  )
}

export default App
