import { useState, useEffect } from 'react';
import './App.css';
import { content } from './data';

function App() {
  const [currentDay, setCurrentDay] = useState(null);
  const [answer, setAnswer] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [showInput, setShowInput] = useState(false);
  const [result, setResult] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [learnedWords, setLearnedWords] = useState([]);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Load learned words from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('learnedWords');
    if (saved) {
      setLearnedWords(JSON.parse(saved));
    }
  }, []);

  // Get current day in December
  const getCurrentDay = () => {
    const now = new Date();
    if (now.getMonth() !== 11) return 1; // Not December
    return now.getDate();
  };

  const today = getCurrentDay();

  // Text-to-Speech using Web Speech API
  const generateAudio = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const openDoor = (day) => {
    const dayStr = String(day);
    
    // Check if door can be opened (allow past days and today)
    if (day > today) {
      setResult({
        type: 'locked',
        message: `🔒 Zu früh! Heute ist erst Tag ${today}. Geduld ist eine Tugend!`
      });
      setShowInput(false);
      setCurrentDay(null);
      return;
    }

    const dayData = content[dayStr];
    if (!dayData) {
      setResult({
        type: 'error',
        message: '🚧 Baustelle: Inhalt fehlt noch.'
      });
      setShowInput(false);
      setCurrentDay(null);
      return;
    }

    setCurrentDay(dayStr);
    setShowInput(true);
    setResult(null);
    setAnswer('');
    setAttemptCount(0);
    setAudioUrl(null);
  };

  const checkAnswer = () => {
    if (!currentDay || !content[currentDay]) return;
    
    const dayData = content[currentDay];
    
    if (!answer.trim()) {
      setResult({
        type: 'warning',
        message: '⚠️ Pssst: Du musst eine Antwort eingeben!'
      });
      return;
    }

    const userAnswer = answer.toLowerCase().trim();
    const correctAnswer = dayData.answer.toLowerCase().trim();

    // Check if answer is correct
    if (userAnswer === correctAnswer || 
        userAnswer.includes(correctAnswer) || 
        correctAnswer.includes(userAnswer)) {
      // Correct!
      generateAudio(dayData.it);
      
      // Add to learned words if not already there
      const newWord = {
        day: currentDay,
        italian: dayData.it,
        german: dayData.de,
        pronunciation: dayData.pronunciation,
        date: new Date().toISOString()
      };
      
      const updatedWords = [...learnedWords.filter(w => w.day !== currentDay), newWord];
      setLearnedWords(updatedWords);
      localStorage.setItem('learnedWords', JSON.stringify(updatedWords));
      
      setResult({
        type: 'success',
        data: dayData
      });
      setShowInput(false);
      setAttemptCount(0);
    } else {
      // Wrong
      const newAttempt = attemptCount + 1;
      const tips = dayData.tips || [];
      const tipIndex = Math.min(newAttempt - 1, tips.length - 1);
      const tipText = tips[tipIndex] || 'Probier es nochmal!';
      
      setResult({
        type: 'error',
        tip: tipText,
        attempt: newAttempt
      });
      setAttemptCount(newAttempt);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  const nextFlashcard = () => {
    setShowAnswer(false);
    setCurrentFlashcard((prev) => (prev + 1) % learnedWords.length);
  };

  const prevFlashcard = () => {
    setShowAnswer(false);
    setCurrentFlashcard((prev) => (prev - 1 + learnedWords.length) % learnedWords.length);
  };

  const playFlashcardAudio = (text) => {
    generateAudio(text);
  };

  return (
    <div className="app-container">
      <div className="header">
        <div className="header-title">🎄 Calendario dell'Avvento 🎄</div>
        <div className="header-subtitle">Italienisch für die Visite in Bruneck</div>
        {learnedWords.length > 0 && (
          <button 
            className="flashcard-toggle-btn"
            onClick={() => {
              setShowFlashcards(!showFlashcards);
              setCurrentFlashcard(0);
              setShowAnswer(false);
            }}
          >
            📚 Karteikarten ({learnedWords.length})
          </button>
        )}
      </div>

      {showFlashcards && learnedWords.length > 0 ? (
        <div className="flashcard-container">
          <div className="flashcard-header">
            <h2>🎓 Deine gelernten Vokabeln</h2>
            <button 
              className="close-flashcards-btn"
              onClick={() => setShowFlashcards(false)}
            >
              ✕ Schließen
            </button>
          </div>
          
          <div className="flashcard-box">
            <div className="flashcard-counter">
              Karte {currentFlashcard + 1} von {learnedWords.length}
            </div>
            
            <div className={`flashcard ${showAnswer ? 'flipped' : ''}`}>
              <div className="flashcard-front">
                <div className="flashcard-day">Tag {learnedWords[currentFlashcard].day}</div>
                <div className="flashcard-word-it">
                  {learnedWords[currentFlashcard].italian}
                </div>
                {learnedWords[currentFlashcard].pronunciation && (
                  <div className="flashcard-pronunciation">
                    [{learnedWords[currentFlashcard].pronunciation}]
                  </div>
                )}
                <button 
                  className="audio-btn"
                  onClick={() => playFlashcardAudio(learnedWords[currentFlashcard].italian)}
                >
                  🔊 Anhören
                </button>
              </div>
              
              {showAnswer && (
                <div className="flashcard-back">
                  <div className="flashcard-word-de">
                    {learnedWords[currentFlashcard].german}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flashcard-controls">
              <button 
                className="flashcard-nav-btn"
                onClick={prevFlashcard}
                disabled={learnedWords.length <= 1}
              >
                ← Zurück
              </button>
              
              <button 
                className="flashcard-reveal-btn"
                onClick={() => setShowAnswer(!showAnswer)}
              >
                {showAnswer ? '🙈 Verbergen' : '👁️ Lösung zeigen'}
              </button>
              
              <button 
                className="flashcard-nav-btn"
                onClick={nextFlashcard}
                disabled={learnedWords.length <= 1}
              >
                Weiter →
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="main-content">
        <div className="calendar-section">
          <div className="calendar-grid">
            {Array.from({ length: 24 }, (_, i) => i + 1).map((day) => {
              const isLearned = learnedWords.some(w => w.day === String(day));
              return (
                <button
                  key={day}
                  className={`calendar-btn ${day === today ? 'today' : ''} ${isLearned ? 'learned' : ''}`}
                  onClick={() => openDoor(day)}
                  disabled={day > today}
                >
                  {day}
                  {isLearned && <span className="learned-badge">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="content-section">
          {!currentDay && !result && (
            <div className="card-box" style={{opacity: 0.7}}>
              <h3>👈 Wähle ein Türchen</h3>
              <p>Klicke links auf den heutigen Tag, um dein Rätsel zu starten.</p>
              <div className="placeholder-icon">🎅</div>
            </div>
          )}

          {result && result.type === 'locked' && (
            <div className="card-box locked">
              <h2>🔒 Zu früh!</h2>
              <p>{result.message}</p>
            </div>
          )}

          {currentDay && !result && content[currentDay] && (
            <div className="card-box">
              <div style={{fontSize: '3em', marginBottom: '-10px'}}>🎁</div>
              <h2 style={{
                color: '#8B0000', 
                borderBottom: '1px dashed #D4AF37', 
                paddingBottom: '10px',
                marginTop: '10px'
              }}>
                Tag {currentDay}
              </h2>
              <p className="riddle-text">{content[currentDay].riddle}</p>
              <p className="context-text">💡 Kontext: {content[currentDay].context}</p>
            </div>
          )}

          {result && result.type === 'success' && (
            <div className="card-box success">
              <div className="success-content">
                <div className="success-icon">🌟 Bravo! 🌟</div>
                <h2 style={{color: '#27ae60', margin: '10px 0'}}>Richtig gelöst!</h2>
                
                <div className="italian-word">
                  <h1>{result.data.it}</h1>
                  <p>🇮🇹 Italienisch</p>
                </div>
                
                <h3 className="german-translation">{result.data.de}</h3>
              </div>
            </div>
          )}

          {result && result.type === 'error' && (
            <div className="card-box error">
              <p className="error-message">❌ Leider nicht richtig</p>
              <hr />
              <p className="tip-text">{result.tip}</p>
              <p className="attempt-count">Versuch {result.attempt}</p>
            </div>
          )}

          {result && result.type === 'warning' && (
            <div style={{
              color: '#e74c3c', 
              fontWeight: 'bold', 
              textAlign: 'center', 
              marginTop: '10px',
              padding: '15px',
              background: 'rgba(231, 76, 60, 0.1)',
              borderRadius: '10px'
            }}>
              {result.message}
            </div>
          )}

          {showInput && (
            <div className="input-row">
              <input
                type="text"
                className="answer-input"
                placeholder="Deine Antwort hier eingeben..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                autoFocus
              />
              <button className="answer-btn" onClick={checkAnswer}>
                Lösen ✨
              </button>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}

export default App;
