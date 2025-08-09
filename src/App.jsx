import { useState, useEffect } from 'react'
import './App.css'

const MAX_ATTEMPTS = 5
const PUZZLES = [
  { title: 'TITANIC', emojis: ['🌊', '🚢', '🧊', '💔', '🎻'] },
  { title: 'HARRY POTTER', emojis: ['⚡', '🧙‍♂️', '🦉', '🪄', '🏰'] },
  { title: 'NARNIA', emojis: ['🦁', '👑', '🚪', '❄️', '🗽'] },
  { title: 'FROZEN', emojis: ['❄️', '👸', '⛄', '🦌', '🏰'] },
  { title: 'BATMAN', emojis: ['🦇', '🌃', '🦹‍♂️', '💰', '🚙'] },
  { title: 'STAR WARS', emojis: ['⭐', '🚀', '🤖', '⚔️', '👾'] }
].map(puzzle => ({
  ...puzzle,
  title: puzzle.title.trim()
}));

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
];

function App() {
  const [puzzle, setPuzzle] = useState(() => PUZZLES[Math.floor(Math.random() * PUZZLES.length)]);
  const [solution, setSolution] = useState(() => {
    return puzzle.title.split(' ').filter(Boolean).join(' ');
  });
  const [currentEmojis, setCurrentEmojis] = useState(puzzle.emojis.slice(0, 3));
  const [guesses, setGuesses] = useState(Array(MAX_ATTEMPTS).fill(''));
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [usedLetters, setUsedLetters] = useState({});

  const updateUsedLetters = (guess) => {
    const newUsedLetters = { ...usedLetters };
    
    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i];
      if (letter === ' ') continue;
      
      if (solution[i] === letter) {
        newUsedLetters[letter] = 'correct';
      } else if (solution.includes(letter) && !newUsedLetters[letter]) {
        newUsedLetters[letter] = 'present';
      } else if (!solution.includes(letter)) {
        newUsedLetters[letter] = 'absent';
      }
    }
    
    setUsedLetters(newUsedLetters);
  };

  const resetGame = () => {
    const newPuzzle = PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
    setPuzzle(newPuzzle);
    setSolution(newPuzzle.title.split(' ').filter(Boolean).join(' '));
    setCurrentEmojis(newPuzzle.emojis.slice(0, 3));
    setGuesses(Array(MAX_ATTEMPTS).fill(''));
    setCurrentAttempt(0);
    setCurrentGuess('');
    setGameOver(false);
    setUsedLetters({});
  };

  const handleKeydown = (event) => {
    if (gameOver) return;

    if (event.key === 'Enter') {
      if (currentGuess.length !== solution.length) return;
      
      const newGuesses = [...guesses];
      newGuesses[currentAttempt] = currentGuess;
      setGuesses(newGuesses);
      
      updateUsedLetters(currentGuess);

      if (currentGuess === solution) {
        setGameOver(true);
      } else if (currentAttempt === MAX_ATTEMPTS - 1) {
        setGameOver(true);
      } else {
        if (currentAttempt === 2 || currentAttempt === 3) {
          setCurrentEmojis(puzzle.emojis.slice(0, currentAttempt + 2));
        }
      }
      
      setCurrentAttempt(currentAttempt + 1);
      setCurrentGuess('');
    } else if (event.key === 'Backspace') {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (currentGuess.length < solution.length && /^[A-Za-z]$/.test(event.key)) {
      const nextChar = event.key.toUpperCase();
      const nextIndex = currentGuess.length;
      
      if (solution[nextIndex] === ' ') {
        setCurrentGuess(currentGuess + ' ' + nextChar);
      } else {
        setCurrentGuess(currentGuess + nextChar);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [currentGuess, currentAttempt, gameOver, guesses, solution, puzzle.emojis]);

  const getLetterColor = (letter, index, guess) => {
    if (!letter) return 'empty';
    if (solution[index] === letter) return 'correct';
    if (solution.includes(letter)) return 'present';
    return 'absent';
  };

  return (
    <div className="App">
      <h1>Movie & Book Wordle</h1>
      <p className="subtitle">Guess the Movie, Book, or Character</p>
      <div className="emoji-hints">
        {currentEmojis.map((emoji, index) => (
          <span key={index} className="emoji">{emoji}</span>
        ))}
      </div>
      <div className="game-board">
        {guesses.map((guess, i) => (
          <div key={i} className="row">
            {Array.from({ length: solution.length }).map((_, j) => {
              const isSpace = solution[j] === ' ';
              if (isSpace) {
                return <span key={j} className="letter space">{'\u00A0'}</span>;
              }
              
              const letter = i === currentAttempt ? currentGuess[j] : guess[j];
              const status = i < currentAttempt ? getLetterColor(guess[j], j, guess) : 'empty';
              return (
                <span key={j} className={`letter ${status}`}>
                  {letter || '_'}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <div className="keyboard">
        {KEYBOARD_ROWS.map((row, i) => (
          <div key={i} className="keyboard-row">
            {row.map((key) => {
              let keyClass = 'keyboard-key';
              if (usedLetters[key]) {
                keyClass += ` ${usedLetters[key]}`;
              }
              if (key === 'ENTER' || key === '⌫') {
                keyClass += ' special-key';
              }
              return (
                <button
                  key={key}
                  className={keyClass}
                  onClick={() => {
                    if (key === 'ENTER') {
                      handleKeydown({ key: 'Enter' });
                    } else if (key === '⌫') {
                      handleKeydown({ key: 'Backspace' });
                    } else {
                      handleKeydown({ key: key.toLowerCase() });
                    }
                  }}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      {gameOver && (
        <div className="game-over">
          {currentGuess === solution ? 'You won!' : `Game Over! The answer was ${solution}`}
        </div>
      )}
      <button 
        className="action-button"
        onClick={() => gameOver ? resetGame() : setGameOver(true)}
      >
        {gameOver ? 'Try Again?' : 'Give Up'}
      </button>
    </div>
  );
}

export default App;
