import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, RotateCcw, Volume2, VolumeX, Settings, X, 
  HelpCircle, ChevronRight, User, Cpu, Award, MessageSquare, SkipForward
} from 'lucide-react';
import { 
  PLAYER_COLORS, PLAYER_CONFIGS, BOARD_PATH, 
  HOME_PATHS, HOME_CENTERS, BASE_POTS, SAFE_CELLS 
} from './constants';
import { audio } from './audio';

// Chroma-keying utility to remove the solid backgrounds from PIEZAS.jfif
const processChromaKey = (img, color) => {
  const canvas = document.createElement('canvas');
  const size = 150; // High-quality resolution for pawn assets
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  const naturalW = img.naturalWidth;
  const naturalH = img.naturalHeight;
  
  // Calculate borders and dividers based on natural image dimensions
  const border = naturalW * 0.016;
  const divider = naturalW * 0.016;
  
  const w = naturalW / 2;
  const h = naturalH / 2;
  
  let sx = 0, sy = 0;
  let sw = w - border - divider / 2;
  let sh = h - border - divider / 2;
  
  if (color === 'red') {
    sx = border;
    sy = border;
  } else if (color === 'green') {
    sx = w + divider / 2;
    sy = border;
  } else if (color === 'blue') {
    sx = border;
    sy = h + divider / 2;
  } else if (color === 'yellow') {
    sx = w + divider / 2;
    sy = h + divider / 2;
  }
  
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
  return canvas.toDataURL('image/png');
};

// Chroma-keying utility to remove the solid background of the new uploaded girasol.png
const processSunflowerChromaKey = (img) => {
  const canvas = document.createElement('canvas');
  const size = 150; // Pawn asset size
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Inset by 2.2% to remove the golden border frame of girasol.png
  const border = img.naturalWidth * 0.022;
  const sx = border;
  const sy = border;
  const sw = img.naturalWidth - border * 2;
  const sh = img.naturalHeight - border * 2;
  
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
  return canvas.toDataURL('image/png');
};

export default function App() {
  // Transparent cutout images state
  const [pieceImages, setPieceImages] = useState({
    [PLAYER_COLORS.RED]: null,
    [PLAYER_COLORS.GREEN]: null,
    [PLAYER_COLORS.YELLOW]: null,
    [PLAYER_COLORS.BLUE]: null
  });

  // Game Configuration State
  const [players, setPlayers] = useState({
    [PLAYER_COLORS.RED]: { type: 'human', score: 0 },
    [PLAYER_COLORS.GREEN]: { type: 'cpu', score: 0 },
    [PLAYER_COLORS.YELLOW]: { type: 'cpu', score: 0 },
    [PLAYER_COLORS.BLUE]: { type: 'cpu', score: 0 }
  });

  // Pieces state (4 pieces for each of the 4 colors)
  const [pieces, setPieces] = useState(() => {
    const initialPieces = [];
    const colors = [PLAYER_COLORS.RED, PLAYER_COLORS.GREEN, PLAYER_COLORS.YELLOW, PLAYER_COLORS.BLUE];
    colors.forEach(color => {
      for (let i = 0; i < 4; i++) {
        initialPieces.push({
          id: `${color}_${i}`,
          color,
          index: i,
          step: 0,
          isHome: false
        });
      }
    });
    return initialPieces;
  });

  // Game Status State
  const [gameState, setGameState] = useState('setup');
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER_COLORS.RED);
  const [diceVal, setDiceVal] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [diceRollCount6, setDiceRollCount6] = useState(0);
  const [winner, setWinner] = useState(null);
  const [winners, setWinners] = useState([]);
  const [currentTrackTitle, setCurrentTrackTitle] = useState(audio.getCurrentTrackTitle());
  const [activePieces, setActivePieces] = useState([]);
  const [statusMessage, setStatusMessage] = useState('¡Configura la partida para empezar!');
  const [logHistory, setLogHistory] = useState([]);
  
  // Corrected default paddings (bottom: 11.5% due to shovel layout)
  const [boardPadding, setBoardPadding] = useState({
    top: 5.5,
    bottom: 11.5,
    left: 5.5,
    right: 5.5
  });
  
  const [showCalibration, setShowCalibration] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [isAiMoving, setIsAiMoving] = useState(false);

  // References
  const logContainerRef = useRef(null);

  // Auto-scroll logs locally inside the container to prevent page scrolling shifts
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logHistory]);

  // Load & chroma-key the pawn images on mount
  useEffect(() => {
    audio.onTrackChange = (title) => {
      setCurrentTrackTitle(title);
    };

    let piecesImgLoaded = false;
    let sunflowerImgLoaded = false;
    
    const piecesImg = new Image();
    piecesImg.src = '/PIEZAS.jfif';
    piecesImg.crossOrigin = 'anonymous';
    
    const sunflowerImg = new Image();
    sunflowerImg.src = '/girasol.png';
    sunflowerImg.crossOrigin = 'anonymous';
    
    const checkAndProcess = () => {
      if (piecesImgLoaded && sunflowerImgLoaded) {
        const redUrl = processChromaKey(piecesImg, 'red');
        const greenUrl = processChromaKey(piecesImg, 'green');
        const yellowUrl = processSunflowerChromaKey(sunflowerImg); // Load high-quality Sunflower
        const blueUrl = processChromaKey(piecesImg, 'blue');
        
        setPieceImages({
          [PLAYER_COLORS.RED]: redUrl,
          [PLAYER_COLORS.GREEN]: greenUrl,
          [PLAYER_COLORS.YELLOW]: yellowUrl,
          [PLAYER_COLORS.BLUE]: blueUrl
        });
      }
    };
    
    piecesImg.onload = () => {
      piecesImgLoaded = true;
      checkAndProcess();
    };
    
    sunflowerImg.onload = () => {
      sunflowerImgLoaded = true;
      checkAndProcess();
    };
  }, []);

  // Sound toggle helper
  const handleToggleMute = () => {
    const muted = audio.toggleMute();
    setSoundMuted(muted);
    audio.playClick();
  };

  // Helper to add logs
  const addLog = (msg) => {
    setLogHistory(prev => [...prev, `${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})} - ${msg}`]);
    setStatusMessage(msg);
  };

  // Check if player has any active turns or if we should skip them
  const getNextPlayer = (curr) => {
    const order = [PLAYER_COLORS.RED, PLAYER_COLORS.GREEN, PLAYER_COLORS.YELLOW, PLAYER_COLORS.BLUE];
    let idx = order.indexOf(curr);
    for (let i = 1; i <= 4; i++) {
      const nextColor = order[(idx + i) % 4];
      if (players[nextColor].type !== 'off' && !winners.includes(nextColor)) {
        return nextColor;
      }
    }
    return curr;
  };

  // Check game over condition
  const checkGameOver = (color) => {
    const playerPieces = pieces.filter(p => p.color === color);
    const allHome = playerPieces.every(p => p.step === 58);
    return allHome;
  };

  // Initialize Game
  const startGame = () => {
    // Check if at least 2 players are active
    const activeCount = Object.values(players).filter(p => p.type !== 'off').length;
    if (activeCount < 2) {
      alert('Debes seleccionar al menos 2 jugadores activos (Humano o CPU).');
      return;
    }

    audio.playClick();
    audio.init();

    // Reset pieces
    setPieces(prev => prev.map(p => ({ ...p, step: 0, isHome: false })));
    setWinner(null);
    setWinners([]);
    setDiceRollCount6(0);
    setHasRolled(false);
    setIsRolling(false);
    
    // Find first active player
    const order = [PLAYER_COLORS.RED, PLAYER_COLORS.GREEN, PLAYER_COLORS.YELLOW, PLAYER_COLORS.BLUE];
    let firstPlayer = PLAYER_COLORS.RED;
    if (players[firstPlayer].type === 'off') {
      firstPlayer = getNextPlayer(firstPlayer);
    }
    
    setCurrentPlayer(firstPlayer);
    setGameState('rolling');
    setLogHistory([]);
    addLog(`¡La partida ha comenzado! Turno de ${PLAYER_CONFIGS[firstPlayer].displayName}`);
    audio.playBgm();
  };

  // Check if a piece can move with the rolled value
  const isMoveLegal = (piece, roll) => {
    if (piece.step === 0) {
      return roll === 6 || roll === 1; // Requires a 6 or 1 to deploy
    }
    return piece.step + roll <= 58; // Cannot overshoot the home center (58)
  };

  // Find all legal pieces that the current player can move
  const getLegalPieces = (color, roll) => {
    return pieces.filter(p => p.color === color && isMoveLegal(p, roll));
  };

  // CPU AI Decision Making
  const makeCpuMove = async (roll) => {
    setIsAiMoving(true);
    // Pause a bit to simulate thinking
    await new Promise(resolve => setTimeout(resolve, 800));

    const legal = getLegalPieces(currentPlayer, roll);

    if (legal.length === 0) {
      addLog(`[CPU] ${PLAYER_CONFIGS[currentPlayer].displayName} no tiene movimientos válidos.`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      endTurn(false);
      setIsAiMoving(false);
      return;
    }

    // Heuristics decision making
    let bestPiece = null;
    let maxScore = -1000;

    legal.forEach(piece => {
      let score = 0;
      const targetStep = piece.step === 0 ? 1 : piece.step + roll;
      
      // Calculate coordinates of target landing cell
      const targetCoord = getPieceCoords(piece.color, piece.index, targetStep);
      
      // 1. Capture check
      const canCapture = checkCaptureChance(piece.color, targetStep, targetCoord);
      if (canCapture) {
        score += 1200 + piece.step; // Prioritize capturing, and prefer moving advanced pieces to capture
      }

      // 2. Win piece check
      if (targetStep === 58) {
        score += 1000;
      }

      // 3. Deploy check
      if (piece.step === 0 && (roll === 6 || roll === 1)) {
        score += 850;
      }

      // 4. Entering safe home path check
      if (piece.step < 53 && targetStep >= 53 && targetStep < 58) {
        score += 600;
      }

      // 5. Check if escaping from danger (an opponent is behind within 6 cells)
      const inDanger = checkIfInDanger(piece);
      if (inDanger) {
        score += 400;
      }

      // 6. Prefer moving pieces that are further along the board
      score += 100 + piece.step;

      if (score > maxScore) {
        maxScore = score;
        bestPiece = piece;
      }
    });

    if (bestPiece) {
      await movePiece(bestPiece.id, roll);
    }
    setIsAiMoving(false);
  };

  // Helper to check if landing on targetStep captures an opponent
  const checkCaptureChance = (color, targetStep, targetCoord) => {
    if (targetStep === 0 || targetStep >= 53) return false; // Base and home path are safe
    
    // Check if target is a safe cell
    const startIdx = PLAYER_CONFIGS[color].startCellIndex;
    const absoluteTargetCellIdx = (startIdx + targetStep - 1) % 52;
    if (SAFE_CELLS.includes(absoluteTargetCellIdx)) return false;

    // Find if opponent pieces are on the same absolute cell
    return pieces.some(p => {
      if (p.color === color) return false;
      if (p.step === 0 || p.step >= 53) return false;
      const oppStartIdx = PLAYER_CONFIGS[p.color].startCellIndex;
      const oppAbsoluteCellIdx = (oppStartIdx + p.step - 1) % 52;
      return oppAbsoluteCellIdx === absoluteTargetCellIdx;
    });
  };

  // Check if an opponent is within 6 cells behind this piece
  const checkIfInDanger = (piece) => {
    if (piece.step === 0 || piece.step >= 53) return false;
    const startIdx = PLAYER_CONFIGS[piece.color].startCellIndex;
    const currentAbsIdx = (startIdx + piece.step - 1) % 52;

    return pieces.some(p => {
      if (p.color === piece.color) return false;
      if (p.step === 0 || p.step >= 53) return false;
      const oppStartIdx = PLAYER_CONFIGS[p.color].startCellIndex;
      const oppAbsIdx = (oppStartIdx + p.step - 1) % 52;

      // Distance from opponent to piece clockwise
      let dist = currentAbsIdx - oppAbsIdx;
      if (dist < 0) dist += 52;
      return dist > 0 && dist <= 6;
    });
  };

  // CPU turn trigger when gameState is 'rolling'
  useEffect(() => {
    if (gameState === 'rolling' && players[currentPlayer].type === 'cpu' && !isRolling && !hasRolled) {
      rollDice();
    }
  }, [gameState, currentPlayer, players, isRolling, hasRolled]);

  // CPU turn trigger when gameState is 'moving' and CPU has rolled
  useEffect(() => {
    if (gameState === 'moving' && players[currentPlayer].type === 'cpu' && hasRolled && !isAiMoving) {
      makeCpuMove(diceVal);
    }
  }, [gameState, currentPlayer, players, hasRolled, isAiMoving, diceVal]);

  // Human auto-move trigger when all legal moves lead to the same target (using useEffect to avoid React stale closures)
  useEffect(() => {
    if (gameState === 'moving' && players[currentPlayer].type === 'human') {
      const legal = pieces.filter(p => p.color === currentPlayer && isMoveLegal(p, diceVal));
      if (legal.length > 0) {
        const uniqueTargets = [...new Set(legal.map(p => p.step === 0 ? 1 : p.step + diceVal))];
        if (uniqueTargets.length === 1) {
          const pieceId = legal[0].id;
          const timer = setTimeout(() => {
            movePiece(pieceId, diceVal);
          }, 800);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [gameState, activePieces, currentPlayer, players, diceVal, pieces]);

  // Roll Dice Action
  const rollDice = () => {
    if (isRolling || hasRolled) return;
    
    setIsRolling(true);
    audio.playRoll();
    
    // Simulate physical roll duration
    setTimeout(() => {
      const val = Math.floor(Math.random() * 6) + 1;
      setDiceVal(val);
      setIsRolling(false);
      setHasRolled(true);

      const playerName = PLAYER_CONFIGS[currentPlayer].displayName;
      addLog(`${playerName} sacó un ${val}`);

      // Count consecutive 6s
      let next6Count = diceRollCount6;
      if (val === 6) {
        next6Count += 1;
        setDiceRollCount6(next6Count);
        if (next6Count === 3) {
          addLog(`¡Tres 6s seguidos! Turno anulado para ${playerName}.`);
          setTimeout(() => {
            endTurn(false);
          }, 1200);
          return;
        }
      } else {
        setDiceRollCount6(0);
        next6Count = 0;
      }

      // Check legal moves
      const legal = getLegalPieces(currentPlayer, val);
      if (legal.length === 0) {
        setActivePieces([]);
        addLog(`No hay movimientos válidos para ${playerName}.`);
        setTimeout(() => {
          endTurn(false);
        }, 1200);
      } else {
        setActivePieces(legal.map(p => p.id));
        setGameState('moving');
        const uniqueTargets = [...new Set(legal.map(p => p.step === 0 ? 1 : p.step + val))];
        if (uniqueTargets.length === 1 && players[currentPlayer].type === 'human') {
          addLog(`Moviendo automáticamente la única pieza disponible de ${playerName}.`);
        }
      }
    }, 555);
  };

  // Move Piece Logic (Step-by-step animation)
  const movePiece = async (pieceId, roll) => {
    if (gameState !== 'moving') return;
    setActivePieces([]); // Clear active highlights

    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return;

    const startStep = piece.step;
    const endStep = startStep === 0 ? 1 : startStep + roll;

    // Sequential animation loop
    for (let current = startStep; current < endStep; current++) {
      const nextStep = current + 1;
      
      // Update piece step in state
      setPieces(prev => prev.map(p => p.id === pieceId ? { ...p, step: nextStep } : p));
      
      if (nextStep === 1) {
        audio.playDeploy();
      } else {
        audio.playMove();
      }

      // Wait for visual hop duration
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Landed! Resolve collisions, wins, and turn advances
    resolveMoveLanding(pieceId, endStep);
  };

  // Handle landing details (capturing, reaching home)
  const resolveMoveLanding = (pieceId, finalStep) => {
    const piece = pieces.find(p => p.id === pieceId);
    const color = piece.color;
    const name = PLAYER_CONFIGS[color].displayName;

    let earnedExtraTurn = false;

    // 1. Check if reached home center (step 58)
    if (finalStep === 58) {
      audio.playWinPiece();
      addLog(`¡Una pieza de ${name} llegó a la casa de Crazy Dave! 🏠`);
      
      // Update piece to home
      setPieces(prev => prev.map(p => p.id === pieceId ? { ...p, isHome: true } : p));
      
      earnedExtraTurn = true;

      // Check game over
      if (checkGameOver(color)) {
        if (!winners.includes(color)) {
          const newWinners = [...winners, color];
          setWinners(newWinners);
          addLog(`🏆 ¡${PLAYER_CONFIGS[color].displayName} terminó en la posición #${newWinners.length}!`);
          
          // Check if only 1 active player is left who hasn't finished
          const activeColors = Object.keys(players).filter(c => players[c].type !== 'off');
          const remainingColors = activeColors.filter(c => !newWinners.includes(c));
          
          if (remainingColors.length <= 1) {
            // The game is over!
            setWinner(newWinners[0]); // First place is the absolute winner
            setGameState('game_over');
            audio.playWinGame();
            if (remainingColors.length === 1) {
              setWinners([...newWinners, remainingColors[0]]);
            } else {
              setWinners(newWinners);
            }
            return;
          }
        }
      }
    } else if (finalStep > 0 && finalStep <= 52) {
      // 2. Check Capture opponent piece
      const startIdx = PLAYER_CONFIGS[color].startCellIndex;
      const finalAbsCell = (startIdx + finalStep - 1) % 52;
      
      if (!SAFE_CELLS.includes(finalAbsCell)) {
        // Find if any opponent piece is on this cell
        const opponentPieces = pieces.filter(p => {
          if (p.color === color) return false;
          if (p.step === 0 || p.step >= 53) return false;
          const oppStartIdx = PLAYER_CONFIGS[p.color].startCellIndex;
          const oppAbsCell = (oppStartIdx + p.step - 1) % 52;
          return oppAbsCell === finalAbsCell;
        });

        if (opponentPieces.length > 0) {
          // Capture them!
          audio.playCapture();
          opponentPieces.forEach(opp => {
            addLog(`💥 ¡${name} explotó y mandó a base a la pieza de ${PLAYER_CONFIGS[opp.color].displayName}!`);
            
            // Instantly send back to base
            setPieces(prev => prev.map(p => p.id === opp.id ? { ...p, step: 0 } : p));
          });
          earnedExtraTurn = true;
        }
      }
    }

    // Advancing turn
    endTurn(earnedExtraTurn);
  };

  // End Current Turn
  const endTurn = (earnedExtraTurn) => {
    // If player rolled a 6, they also earn an extra turn, unless they rolled three 6s
    const rolledA6 = (diceVal === 6) && (diceRollCount6 < 3);
    const keepTurn = (earnedExtraTurn || rolledA6) && (winner === null);

    setHasRolled(false);
    
    if (keepTurn) {
      addLog(`¡Turno extra para ${PLAYER_CONFIGS[currentPlayer].displayName}!`);
      setGameState('rolling');
    } else {
      setDiceRollCount6(0);
      const next = getNextPlayer(currentPlayer);
      setCurrentPlayer(next);
      setGameState('rolling');
      addLog(`Turno de ${PLAYER_CONFIGS[next].displayName}`);
    }
  };

  // Coordinate generator
  const getPieceCoords = (color, index, step) => {
    if (step === 0) {
      return BASE_POTS[color][index];
    }
    if (step === 58) {
      return HOME_CENTERS[color];
    }
    if (step >= 53 && step <= 57) {
      return HOME_PATHS[color][step - 53];
    }
    const startIdx = PLAYER_CONFIGS[color].startCellIndex;
    const absIdx = (startIdx + step - 1) % 52;
    return BOARD_PATH[absIdx];
  };

  // Stacking calculation: returns dx, dy offset (in %) for pieces sharing a cell
  const getStackOffset = (pieceId, color, step) => {
    if (step === 0 || step === 58) return { dx: 0, dy: 0, count: 1 }; // Base & center have their own separate spots
    
    const coord = getPieceCoords(color, pieces.find(p => p.id === pieceId).index, step);
    
    // Find all pieces sharing this row/col grid cell
    const sharing = pieces.filter(p => {
      if (p.step === 0 || p.step === 58) return false;
      const c = getPieceCoords(p.color, p.index, p.step);
      return Math.abs(c.row - coord.row) < 0.1 && Math.abs(c.col - coord.col) < 0.1;
    });

    if (sharing.length <= 1) return { dx: 0, dy: 0, count: 1 };

    // Layout offsets for overlapping pieces
    const idx = sharing.findIndex(p => p.id === pieceId);
    
    // Symmetrical offset depending on total pieces stacked
    // cell size is ~6.66%. We shift by about 1.2% per step
    const offsets = [
      { dx: -1.2, dy: -1.2 },
      { dx: 1.2, dy: -1.2 },
      { dx: -1.2, dy: 1.2 },
      { dx: 1.2, dy: 1.2 }
    ];

    return { 
      dx: offsets[idx % 4].dx, 
      dy: offsets[idx % 4].dy,
      count: sharing.length
    };
  };

  // Dice face helper
  const getDiceDots = (val) => {
    const dotsMap = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8]
    };
    return dotsMap[val] || [];
  };

  return (
    <div className="app-layout select-none">
      
      {/* 1. SETUP GAME VIEW */}
      {gameState === 'setup' ? (
        <div className="setup-screen">
          <motion.div 
            className="setup-box"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontSize: '38px', color: '#10b981', textShadow: '0 2px 4px rgba(0,0,0,0.3)', marginBottom: '4px' }}>
                PvZ LUDO
              </h1>
              <p style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Crazy Dave's Backyard Lawn
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.keys(players).map(color => {
                const config = PLAYER_CONFIGS[color];
                const currentType = players[color].type;
                const isInactive = currentType === 'off';

                return (
                  <div 
                    key={color} 
                    className={`player-row ${isInactive ? 'inactive' : ''}`}
                    style={{ borderLeft: `4px solid ${config.colorHex}` }}
                  >
                    <div className="player-row-left">
                      <div 
                        className="player-avatar av-md shadow-sm"
                        style={{
                          backgroundImage: pieceImages[color] ? `url(${pieceImages[color]})` : (color === PLAYER_COLORS.GREEN ? "url('/lanzaguisante.png')" : "url('/PIEZAS.jfif')"),
                          backgroundSize: pieceImages[color] ? 'contain' : '200% 200%',
                          backgroundPosition: pieceImages[color] ? 'center center' : config.bgPosition,
                          backgroundRepeat: 'no-repeat',
                          border: isInactive ? '1.5px solid #475569' : `1.5px solid ${config.colorHex}`,
                          filter: isInactive ? 'grayscale(105%)' : 'none',
                          borderRadius: '50%'
                        }}
                      />
                      <div>
                        <span className="player-row-name">{config.displayName}</span>
                        <span className="player-row-desc">{config.name}</span>
                      </div>
                    </div>

                    {/* Selector button group */}
                    <div className="selector-group">
                      {['human', 'cpu', 'off'].map(type => (
                        <button
                          key={type}
                          onClick={() => {
                            audio.playClick();
                            setPlayers(prev => ({
                              ...prev,
                              [color]: { ...prev[color], type }
                            }));
                          }}
                          className={`selector-btn ${currentType === type ? `active ${color}` : ''}`}
                        >
                          {type === 'human' && <User style={{ width: '12px', height: '12px' }} />}
                          {type === 'cpu' && <Cpu style={{ width: '12px', height: '12px' }} />}
                          {type === 'off' && <X style={{ width: '12px', height: '12px' }} />}
                          {type === 'human' ? 'HUM' : type === 'cpu' ? 'CPU' : 'OFF'}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={startGame} className="start-btn">
              <Play style={{ width: '18px', height: '18px', fill: 'currentColor' }} /> ¡EMPEZAR JUEGO!
            </button>
          </motion.div>
        </div>
      ) : (

        /* 2. ACTIVE GAMEPLAY VIEW */
        <div className="game-layout">
          
          {/* Left Column: Ludo Board */}
          <div className="board-column">
            <div className="board-wrapper">
              <img src="/LUDO.png" className="board-image" alt="Tablero Ludo" />
              
              {/* Pieces Grid overlay */}
              <div 
                className="board-grid-overlay"
                style={{
                  top: `${boardPadding.top}%`,
                  bottom: `${boardPadding.bottom}%`,
                  left: `${boardPadding.left}%`,
                  right: `${boardPadding.right}%`
                }}
              >
                {/* Grid cell highlights for playable options */}
                {activePieces.map(id => {
                  const p = pieces.find(x => x.id === id);
                  const coords = getPieceCoords(p.color, p.index, p.step);
                  return (
                    <div
                      key={`hl_${id}`}
                      className="absolute bg-green-500/20 border border-green-400 rounded-full animate-ping pointer-events-none"
                      style={{
                        left: `${coords.col * (100 / 15)}%`,
                        top: `${coords.row * (100 / 15)}%`,
                        width: '6.66%',
                        height: '6.66%'
                      }}
                    />
                  );
                })}

                {/* Render active players' pieces */}
                {pieces.filter(piece => players[piece.color].type !== 'off').map(piece => {
                  const config = PLAYER_CONFIGS[piece.color];
                  const coords = getPieceCoords(piece.color, piece.index, piece.step);
                  const stack = getStackOffset(piece.id, piece.color, piece.step);
                  const isPlayable = activePieces.includes(piece.id) && players[piece.color].type === 'human';

                  // Map grid coordinate row/col to percentage left/top centered on cells mathematically (cell is 6.666%, pawn is 7.2%, offset is -0.2666%)
                  const leftPos = coords.col * (100 / 15) - 0.2666 + stack.dx;
                  const topPos = coords.row * (100 / 15) - 0.2666 + stack.dy;

                  return (
                    <motion.div
                      key={piece.id}
                      className={`pawn ${isPlayable ? 'playable' : ''} ${piece.isHome ? 'is-home' : ''}`}
                      style={{
                        backgroundImage: pieceImages[piece.color] ? `url(${pieceImages[piece.color]})` : "url('/PIEZAS.jfif')",
                        backgroundSize: pieceImages[piece.color] ? 'contain' : '200% 200%',
                        backgroundPosition: pieceImages[piece.color] ? 'center center' : config.bgPosition,
                        backgroundRepeat: 'no-repeat',
                        left: `${leftPos}%`,
                        top: `${topPos}%`,
                        transformOrigin: 'center center',
                        borderRadius: '50%'
                      }}
                      onClick={() => {
                        if (isPlayable) {
                          movePiece(piece.id, diceVal);
                        } else if (activePieces.length > 0 && piece.color === currentPlayer) {
                          audio.playDeny();
                        }
                      }}
                      layout // Animate movement transitions smoothly
                      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                      animate={{
                        scale: piece.isHome ? [1, 1.1, 1] : 1,
                        rotate: piece.step === 0 ? 0 : undefined
                      }}
                    >
                      {/* Visual details for finished pieces (Crown/Gold border) */}
                      {piece.isHome && (
                        <div 
                          style={{
                            position: 'absolute',
                            top: '-12px',
                            right: '-4px',
                            backgroundColor: '#fbbf24',
                            color: '#0f172a',
                            fontSize: '8px',
                            fontWeight: '800',
                            padding: '0 4px',
                            borderRadius: '9999px',
                            border: '1px solid #ffffff'
                          }}
                        >
                          ★
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Compact HUD Panel */}
          <div className="dashboard-area">
            
            {/* Giant Active Player Portrait (Matches the RED box in the screenshot) */}
            <div className="giant-player-panel">
              <div 
                className="giant-player-portrait"
                style={{
                  backgroundImage: pieceImages[currentPlayer] ? `url(${pieceImages[currentPlayer]})` : (currentPlayer === PLAYER_COLORS.GREEN ? "url('/lanzaguisante.png')" : "url('/PIEZAS.jfif')"),
                  backgroundSize: pieceImages[currentPlayer] ? 'contain' : '200% 200%',
                  backgroundPosition: pieceImages[currentPlayer] ? 'center center' : PLAYER_CONFIGS[currentPlayer].bgPosition,
                  backgroundRepeat: 'no-repeat',
                  filter: `drop-shadow(0 0 20px ${PLAYER_CONFIGS[currentPlayer].colorHex}88)`,
                  borderRadius: '50%'
                }}
              />
            </div>

            <div className={`panel-card turn-panel glow-${currentPlayer}`} style={{ height: '154px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {/* Top row: Turn details + Corner controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="turn-info" style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="turn-meta" style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="turn-label" style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 'bold' }}>JUGANDO AHORA</span>
                    <h3 className="turn-name" style={{ fontSize: '24px', fontWeight: '950', color: PLAYER_CONFIGS[currentPlayer].colorHex, margin: '2px 0', lineHeight: 1.1 }}>
                      {PLAYER_CONFIGS[currentPlayer].displayName}
                    </h3>
                    <span className="turn-type-badge" style={{ fontSize: '10px', color: '#e2e8f0', background: 'rgba(15, 23, 42, 0.7)', padding: '2px 6px', borderRadius: '4px', width: 'fit-content', fontWeight: 'bold', fontFamily: 'monospace' }}>
                      {players[currentPlayer].type === 'cpu' ? '🤖 CPU' : '👤 HUMANO'}
                    </span>
                    {currentTrackTitle && (
                      <span className="song-title-badge" style={{ fontSize: '9px', color: '#10b981', marginTop: '6px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        🎵 {currentTrackTitle}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Group: Controls + Last Roll */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  {/* Controls */}
                  <div className="btn-icon-group" style={{ display: 'flex', gap: '4px' }}>
                    <button 
                      onClick={handleToggleMute}
                      className="btn-icon"
                      title={soundMuted ? 'Activar sonido' : 'Mutear sonido'}
                      style={{ padding: '6px', borderRadius: '6px' }}
                    >
                      {soundMuted ? <VolumeX style={{ width: '15px', height: '15px' }} /> : <Volume2 style={{ width: '15px', height: '15px' }} />}
                    </button>
                    <button 
                      onClick={() => {
                        audio.playClick();
                        audio.nextTrack();
                      }}
                      className="btn-icon"
                      title="Siguiente Canción"
                      style={{ padding: '6px', borderRadius: '6px', color: '#10b981' }}
                    >
                      <SkipForward style={{ width: '15px', height: '15px' }} />
                    </button>
                    <button 
                      onClick={() => { audio.playClick(); setShowCalibration(!showCalibration); }}
                      className="btn-icon"
                      title="Calibrar Tablero"
                      style={{ padding: '6px', borderRadius: '6px' }}
                    >
                      <Settings style={{ width: '15px', height: '15px' }} />
                    </button>
                    <button 
                      onClick={() => {
                        audio.playClick();
                        if (window.confirm("¿Estás seguro de que quieres reiniciar la partida actual?")) {
                          startGame();
                        }
                      }}
                      className="btn-icon warning"
                      title="Reiniciar Partida"
                      style={{ padding: '6px', borderRadius: '6px', color: '#f59e0b' }}
                    >
                      <RotateCcw style={{ width: '15px', height: '15px' }} />
                    </button>
                    <button 
                      onClick={() => {
                        audio.playClick();
                        if (window.confirm("¿Estás seguro de que quieres salir al menú de configuración?")) {
                          audio.stopBgm();
                          setGameState('setup');
                        }
                      }}
                      className="btn-icon danger"
                      title="Volver a Configuración"
                      style={{ padding: '6px', borderRadius: '6px' }}
                    >
                      <X style={{ width: '15px', height: '15px' }} />
                    </button>
                  </div>
                  
                  {/* Last Roll */}
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '6px', paddingRight: '4px' }}>
                    <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ÚLTIMO DADO</span>
                    <span style={{ fontSize: '20px', fontWeight: '950', color: PLAYER_CONFIGS[currentPlayer].colorHex, lineHeight: 1.1 }}>
                      {diceVal}
                    </span>
                  </div>
                </div>
              </div>

              {/* Score meters grid */}
              <div className="score-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px', marginTop: '8px' }}>
                {Object.keys(players).map(color => {
                  if (players[color].type === 'off') return null;
                  const homePieces = pieces.filter(p => p.color === color && p.step === 58).length;
                  const isCurrent = currentPlayer === color;
                  return (
                    <div 
                      key={color} 
                      className="score-box" 
                      style={{ 
                        background: 'rgba(15, 23, 42, 0.35)', 
                        borderRadius: '8px', 
                        padding: '4px', 
                        textAlign: 'center',
                        borderBottom: isCurrent ? `2.5px solid ${PLAYER_CONFIGS[color].colorHex}` : '2.5px solid transparent',
                        transition: 'border-color 0.3s'
                      }}
                    >
                      <span className="score-player-name" style={{ color: PLAYER_CONFIGS[color].colorHex, fontSize: '11px', fontWeight: '800', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {PLAYER_CONFIGS[color].displayName.slice(0, 5)}
                      </span>
                      <span className="score-value" style={{ fontSize: '13px', fontWeight: '850', color: '#f1f5f9', fontFamily: 'monospace' }}>
                        {homePieces}/4 🏠
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Bar Message */}
            <div className="panel-card status-panel">
              <MessageSquare style={{ width: '14px', height: '14px', color: '#10b981', flexShrink: 0 }} />
              <span className="status-text">{statusMessage}</span>
            </div>

            {/* Interactive 3D Dice Panel (Replaces the Log History) */}
            <div 
              className={`panel-card dice-control-panel glow-${currentPlayer}`}
              style={{
                height: '140px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                position: 'relative',
                cursor: players[currentPlayer].type === 'human' && gameState === 'rolling' && !isRolling ? 'pointer' : 'default'
              }}
              onClick={() => {
                if (players[currentPlayer].type === 'human' && gameState === 'rolling' && !isRolling) {
                  rollDice();
                }
              }}
            >
              <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800', letterSpacing: '1px' }}>
                {players[currentPlayer].type === 'cpu' ? '🤖 CPU LANZANDO...' : '🎲 CLICK PARA TIRAR DADO'}
              </span>
              
              <div className="dice-container-board" style={{ width: '76px', height: '76px' }}>
                <div 
                  className={`dice-cube-board ${isRolling ? 'rolling-board' : ''}`}
                  style={{
                    transform: isRolling ? undefined :
                      diceVal === 1 ? 'rotateY(0deg)' :
                      diceVal === 2 ? 'rotateY(180deg)' :
                      diceVal === 3 ? 'rotateX(-90deg)' :
                      diceVal === 4 ? 'rotateX(90deg)' :
                      diceVal === 5 ? 'rotateY(-90deg)' : 'rotateY(90deg)',
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    transition: isRolling ? 'none' : 'transform 0.18s cubic-bezier(0.25, 1, 0.5, 1.05)'
                  }}
                >
                  {[1, 2, 3, 4, 5, 6].map(val => (
                    <div 
                      key={val} 
                      className={`dice-face-board face-${val}-b`}
                      style={{
                        width: '76px',
                        height: '76px',
                        transform: val === 1 ? 'rotateY(0deg) translateZ(38px)' :
                                   val === 2 ? 'rotateY(180deg) translateZ(38px)' :
                                   val === 3 ? 'rotateX(90deg) translateZ(38px)' :
                                   val === 4 ? 'rotateX(-90deg) translateZ(38px)' :
                                   val === 5 ? 'rotateY(90deg) translateZ(38px)' :
                                   'rotateY(-90deg) translateZ(38px)'
                      }}
                    >
                      <div className="dots-grid-board" style={{ width: '52px', height: '52px', padding: '2px' }}>
                        {getDiceDots(val).map(dotIndex => (
                          <div 
                            key={dotIndex} 
                            className="dot-board" 
                            style={{
                              gridArea: `${Math.floor(dotIndex / 3) + 1} / ${(dotIndex % 3) + 1}`,
                              backgroundColor: PLAYER_CONFIGS[currentPlayer].colorHex,
                              width: '10px',
                              height: '10px',
                              margin: 'auto'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Calibration Panel */}
            <AnimatePresence>
              {showCalibration && (
                <motion.div 
                  className="panel-card calibration-overlay"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '4px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#eab308', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Settings style={{ width: '12px', height: '12px' }} /> Calibrar Margen
                    </span>
                    <button 
                      onClick={() => { audio.playClick(); setShowCalibration(false); }}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginLeft: 'auto' }}
                    >
                      <X style={{ width: '14px', height: '14px' }} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                    {Object.keys(boardPadding).map(dir => (
                      <div key={dir} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15,23,42,0.4)', padding: '4px 8px', borderRadius: '6px' }}>
                        <span style={{ textTransform: 'capitalize', color: '#cbd5e1', fontFamily: 'monospace' }}>{dir}: {boardPadding[dir]}%</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => {
                              audio.playClick();
                              setBoardPadding(prev => ({
                                ...prev,
                                [dir]: Math.max(0, parseFloat((prev[dir] - 0.1).toFixed(1)))
                              }));
                            }}
                            style={{ background: '#334155', border: 'none', color: 'white', px: '6px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            -
                          </button>
                          <button
                            onClick={() => {
                              audio.playClick();
                              setBoardPadding(prev => ({
                                ...prev,
                                [dir]: Math.min(20, parseFloat((prev[dir] + 0.1).toFixed(1)))
                              }));
                            }}
                            style={{ background: '#334155', border: 'none', color: 'white', px: '6px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      <AnimatePresence>
        {gameState === 'game_over' && winner && (
          <div className="gameover-overlay">
            <motion.div 
              className="gameover-box"
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <Award style={{ width: '64px', height: '64px', color: '#fbbf24' }} />
              <div>
                <span style={{ color: '#fbbf24', fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '2px' }}>
                  ¡Victoria Total!
                </span>
                <h2 className="gameover-title">
                  {PLAYER_CONFIGS[winner].displayName}
                </h2>
                <span className="gameover-subtitle">ha conquistado el jardín</span>
                <p className="gameover-desc mt-2">Crazy Dave está a salvo por hoy...</p>
              </div>

              {/* Winner Avatar */}
              <div 
                className="player-avatar av-xl border-yellow-400"
                style={{
                  backgroundImage: pieceImages[winner] ? `url(${pieceImages[winner]})` : (winner === PLAYER_COLORS.GREEN ? "url('/lanzaguisante.png')" : "url('/PIEZAS.jfif')"),
                  backgroundSize: pieceImages[winner] ? 'contain' : '200% 200%',
                  backgroundPosition: pieceImages[winner] ? 'center center' : PLAYER_CONFIGS[winner].bgPosition,
                  backgroundRepeat: 'no-repeat',
                  borderRadius: '50%'
                }}
              />

              {/* Summary of positions */}
              <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', width: '100%' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800', marginBottom: '8px', display: 'block', letterSpacing: '0.5px', textAlign: 'center' }}>
                  Resumen de Ganadores
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {winners.map((color, index) => (
                    <div 
                      key={color} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        background: 'rgba(15, 23, 42, 0.4)',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: `1px solid ${PLAYER_CONFIGS[color].colorHex}22`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '900', color: index === 0 ? '#fbbf24' : index === 1 ? '#cbd5e1' : '#b45309' }}>
                          #{index + 1}
                        </span>
                        <div 
                          className="player-avatar av-sm"
                          style={{
                            backgroundImage: pieceImages[color] ? `url(${pieceImages[color]})` : (color === PLAYER_COLORS.GREEN ? "url('/lanzaguisante.png')" : "url('/PIEZAS.jfif')"),
                            backgroundSize: pieceImages[color] ? 'contain' : '200% 200%',
                            backgroundPosition: pieceImages[color] ? 'center center' : PLAYER_CONFIGS[color].bgPosition,
                            backgroundRepeat: 'no-repeat',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px'
                          }}
                        />
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: PLAYER_CONFIGS[color].colorHex }}>
                          {PLAYER_CONFIGS[color].displayName}
                        </span>
                      </div>
                      <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' }}>
                        {index === 0 ? '🏆 1er Puesto' : index === 1 ? '🥈 2do Puesto' : '🥉 3er Puesto'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  audio.playClick();
                  setGameState('setup');
                }}
                className="gameover-btn"
                style={{ marginTop: '12px' }}
              >
                Volver a la Configuración
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
