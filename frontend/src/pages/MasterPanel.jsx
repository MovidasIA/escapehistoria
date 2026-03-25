import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import confetti from "canvas-confetti";
import { Button } from "../components/ui/button";
import { Slider } from "../components/ui/slider";
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, 
  Home, AlertCircle, Check, ChevronLeft, ChevronRight, Trophy 
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "../components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PHASE_NAMES = {
  1: "Torre de Marfil",
  2: "La Nada",
  3: "Selva de Perelín",
  4: "Montaña Errante",
  5: "El Pergamino Final"
};

const GROUP_CONFIG = {
  comerrocas: { name: "Los Comerrocas", position: "TL", color: "#FFD700" },
  silfos: { name: "Los Silfos Nocturnos", position: "TR", color: "#8B4513" },
  fuegos: { name: "Los Fuegos Fatuos", position: "BL", color: "#DAA520" },
  diminutenses: { name: "Los diminutenses", position: "BR", color: "#228B22" }
};

// Background music URLs (royalty-free from Fesliyan Studios)
const AMBIENT_MUSIC_URL = "https://www.fesliyanstudios.com/play-mp3/6726"; // Fantasy Ambience
const URGENT_MUSIC_URL = "https://www.fesliyanstudios.com/play-mp3/6734"; // Suspense/Tension

export default function MasterPanel() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(null);
  const [localTimer, setLocalTimer] = useState(600);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [helpRequests, setHelpRequests] = useState([]);
  const [finalCountdownActive, setFinalCountdownActive] = useState(false);
  const [finalCountdownTriggered, setFinalCountdownTriggered] = useState(false);
  const [victoryScreen, setVictoryScreen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const tickIntervalRef = useRef(null);
  const lastTickRef = useRef(0);
  const ambientAudioRef = useRef(null);
  const urgentAudioRef = useRef(null);

  // Audio Functions
  const playTick = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.log('Audio not available');
    }
  }, [soundEnabled]);

  const playGong = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 150;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 2);
    } catch (e) {
      console.log('Audio not available');
    }
  }, [soundEnabled]);

  const playChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 1200;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.log('Audio not available');
    }
  }, [soundEnabled]);

  // Music control functions using MP3 files
  const startAmbientMusic = useCallback(() => {
    // Stop urgent if playing
    if (urgentAudioRef.current) {
      urgentAudioRef.current.pause();
      urgentAudioRef.current.currentTime = 0;
    }
    
    // Start ambient
    if (!ambientAudioRef.current) {
      ambientAudioRef.current = new Audio(AMBIENT_MUSIC_URL);
      ambientAudioRef.current.loop = true;
      ambientAudioRef.current.volume = 0.25; // Low volume
    }
    ambientAudioRef.current.play().catch(e => console.log('Audio blocked:', e));
    setMusicPlaying(true);
  }, []);

  const startUrgentMusic = useCallback(() => {
    // Stop ambient if playing
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause();
      ambientAudioRef.current.currentTime = 0;
    }
    
    // Start urgent
    if (!urgentAudioRef.current) {
      urgentAudioRef.current = new Audio(URGENT_MUSIC_URL);
      urgentAudioRef.current.loop = true;
      urgentAudioRef.current.volume = 0.35; // Slightly louder for urgency
    }
    urgentAudioRef.current.play().catch(e => console.log('Audio blocked:', e));
    setMusicPlaying(true);
  }, []);

  const stopAllMusic = useCallback(() => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause();
      ambientAudioRef.current.currentTime = 0;
    }
    if (urgentAudioRef.current) {
      urgentAudioRef.current.pause();
      urgentAudioRef.current.currentTime = 0;
    }
    setMusicPlaying(false);
  }, []);

  const toggleMusic = useCallback(() => {
    if (musicPlaying) {
      stopAllMusic();
    } else {
      if (finalCountdownActive) {
        startUrgentMusic();
      } else {
        startAmbientMusic();
      }
    }
  }, [musicPlaying, finalCountdownActive, stopAllMusic, startUrgentMusic, startAmbientMusic]);

  // Fire confetti celebration
  const fireConfetti = useCallback(() => {
    const duration = 5000;
    const end = Date.now() + duration;

    const colors = ['#D4AF37', '#FFD700', '#39FF14', '#C0C0C0', '#ffffff'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, []);

  // Handle victory
  const handleVictory = useCallback(() => {
    setIsRunning(false);
    setFinalCountdownActive(false);
    stopAllMusic();
    setVictoryScreen(true);
    fireConfetti();
    playGong();
  }, [stopAllMusic, fireConfetti, playGong]);

  // Switch to urgent music when final countdown starts
  useEffect(() => {
    if (finalCountdownActive && musicPlaying) {
      startUrgentMusic();
    }
  }, [finalCountdownActive, musicPlaying, startUrgentMusic]);

  // Fetch game state
  const fetchGameState = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/game-state`);
      const data = response.data;
      setGameState(data);
      setCurrentPhase(data.current_phase);
      setHelpRequests(data.help_requests.filter(r => !r.resolved));
      
      // Always sync timer from backend when not running locally
      if (!isRunning) {
        setLocalTimer(data.timer_seconds);
      }
      
      // Check if all groups have completed all 4 stations
      if (data.groups && !finalCountdownTriggered) {
        const allGroupsCompleted = Object.values(data.groups).every(group => 
          group.stations_completed && group.stations_completed.every(s => s)
        );
        
        if (allGroupsCompleted) {
          // Trigger final countdown!
          setFinalCountdownActive(true);
          setFinalCountdownTriggered(true);
          setLocalTimer(180); // 3 minutes
          setIsRunning(true);
          toast.success("¡Todos los grupos han completado! ¡CUENTA ATRÁS FINAL!");
          playGong();
        }
      }
    } catch (error) {
      console.error("Error fetching game state:", error);
    }
  }, [isRunning, finalCountdownTriggered, playGong]);

  // Initial fetch and polling
  useEffect(() => {
    fetchGameState();
    const interval = setInterval(fetchGameState, 2000);
    return () => clearInterval(interval);
  }, [fetchGameState]);

  // Timer logic
  useEffect(() => {
    if (isRunning && localTimer > 0) {
      timerRef.current = setInterval(() => {
        setLocalTimer(prev => {
          const newVal = prev - 1;
          
          // Tick sound in last 60 seconds
          if (newVal <= 60 && newVal > 0) {
            const now = Date.now();
            if (now - lastTickRef.current >= 1000) {
              playTick();
              lastTickRef.current = now;
            }
          }
          
          // Gong at end
          if (newVal === 0) {
            playGong();
            setIsRunning(false);
          }
          
          return newVal;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, localTimer, playTick, playGong]);

  // Sync timer to backend periodically
  useEffect(() => {
    const syncTimer = async () => {
      if (gameState) {
        try {
          await axios.patch(`${API}/game-state/timer`, {
            timer_seconds: localTimer,
            timer_running: isRunning
          });
        } catch (e) {
          console.error("Error syncing timer:", e);
        }
      }
    };
    
    const interval = setInterval(syncTimer, 5000);
    return () => clearInterval(interval);
  }, [localTimer, isRunning, gameState]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerClass = () => {
    if (localTimer <= 180) return "timer-heartbeat"; // 3 min or less - red with heartbeat
    return "timer-green"; // More than 3 min - green
  };

  const handleStartPause = async () => {
    const newState = !isRunning;
    setIsRunning(newState);
    try {
      await axios.patch(`${API}/game-state/timer`, {
        timer_running: newState
      });
    } catch (e) {
      console.error("Error updating timer:", e);
    }
  };

  const handleReset = async () => {
    setIsRunning(false);
    setLocalTimer(600);
    setFinalCountdownActive(false);
    setFinalCountdownTriggered(false);
    setVictoryScreen(false);
    stopAllMusic();
    try {
      await axios.post(`${API}/game-state/reset`);
      toast.success("Juego reiniciado");
    } catch (e) {
      console.error("Error resetting game:", e);
    }
  };

  const handlePhaseChange = async (direction) => {
    const newPhase = Math.max(1, Math.min(5, currentPhase + direction));
    setCurrentPhase(newPhase);
    try {
      await axios.patch(`${API}/game-state/phase`, { phase: newPhase });
    } catch (e) {
      console.error("Error updating phase:", e);
    }
  };

  const handleStationClick = async (groupId, stationIndex) => {
    if (!gameState) return;
    
    const group = gameState.groups[groupId];
    if (!group) return;
    
    const newCompleted = !group.stations_completed[stationIndex];
    
    try {
      await axios.patch(`${API}/game-state/station`, {
        group_id: groupId,
        station_index: stationIndex,
        completed: newCompleted
      });
      
      if (newCompleted) {
        playChime();
        toast.success(`${GROUP_CONFIG[groupId].name} - Estación ${stationIndex + 1} completada!`);
      }
      
      fetchGameState();
    } catch (e) {
      console.error("Error updating station:", e);
    }
  };

  const handleResolveHelp = async (requestId) => {
    try {
      await axios.patch(`${API}/game-state/help-request/${requestId}/resolve`);
      toast.success("Solicitud resuelta");
      fetchGameState();
    } catch (e) {
      console.error("Error resolving help:", e);
    }
  };

  const handleAdjustTimer = (value) => {
    if (!isRunning) {
      setLocalTimer(value[0] * 60);
    }
  };

  const renderGroupCorner = (groupId, position) => {
    const config = GROUP_CONFIG[groupId];
    const group = gameState?.groups?.[groupId];
    const stations = group?.stations_completed || [false, false, false, false];
    
    // Center all content in each corner
    const positionClasses = {
      TL: "border-r border-b",
      TR: "border-l border-b",
      BL: "border-r border-t",
      BR: "border-l border-t"
    };

    const completedCount = stations.filter(Boolean).length;

    return (
      <div 
        className={`glass-panel p-6 md:p-10 flex flex-col items-center justify-center ${positionClasses[position]} border-white/10 transition-all duration-500 hover:bg-white/5`}
        data-testid={`group-corner-${groupId}`}
      >
        <h3 
          className="font-cinzel text-2xl md:text-4xl lg:text-5xl tracking-wider mb-4 text-center"
          style={{ color: config.color }}
        >
          {config.name}
        </h3>
        
        {/* Progress indicator */}
        <p className="text-[#C0C0C0] text-base md:text-lg lg:text-xl mb-6 font-lato">
          Progreso: {completedCount}/4 estaciones
        </p>
        
        {/* Station nodes */}
        <div className="flex gap-4 md:gap-6">
          {stations.map((completed, idx) => (
            <button
              key={idx}
              onClick={() => handleStationClick(groupId, idx)}
              className={`w-14 h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center font-cinzel text-xl md:text-2xl lg:text-3xl transition-all duration-300 cursor-pointer ${
                completed ? 'node-active' : 'node-default'
              }`}
              data-testid={`station-node-${groupId}-${idx}`}
            >
              {completed ? <Check className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-[#050510]" /> : idx + 1}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Victory Screen
  if (victoryScreen) {
    return (
      <div className="min-h-screen phase-5 relative overflow-hidden flex flex-col items-center justify-center" data-testid="victory-screen">
        <Toaster position="top-right" />
        
        {/* Victory Content */}
        <div className="text-center z-10">
          <div className="mb-8 animate-float">
            <Trophy className="w-32 h-32 md:w-48 md:h-48 text-[#D4AF37] mx-auto glow-gold" />
          </div>
          
          <h1 className="font-cinzel text-4xl md:text-7xl text-[#D4AF37] tracking-widest mb-6 text-glow animate-pulse">
            ¡HABÉIS SALVADO A FANTASIA!
          </h1>
          
          <p className="font-lato text-xl md:text-2xl text-[#f0e6d2] mb-8">
            La Emperatriz Infantil os da las gracias, valientes aventureros.
          </p>
          
          <Button
            onClick={handleReset}
            className="bg-[#D4AF37] text-[#050510] hover:bg-[#D4AF37]/80 font-cinzel text-lg px-8 py-4"
            data-testid="restart-btn"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Nueva Aventura
          </Button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-[#D4AF37]/10 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-[#39FF14]/10 blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-[#D4AF37]/20 blur-2xl animate-float"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen phase-${currentPhase} relative overflow-hidden`} data-testid="master-panel">
      <Toaster position="top-right" />
      
      {/* Help Requests Alert */}
      {helpRequests.length > 0 && (
        <div className="absolute top-4 right-4 z-50" data-testid="help-requests-alert">
          <div className="glass-panel p-4 rounded-lg border-2 border-[#D4AF37] max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-[#D4AF37] help-badge" />
              <span className="font-cinzel text-[#D4AF37]">Solicitudes de Ayuda</span>
            </div>
            {helpRequests.map(req => (
              <div key={req.id} className="bg-black/30 p-2 rounded mb-2 flex justify-between items-center">
                <span className="text-sm text-[#f0e6d2]">{req.group_name}</span>
                <Button
                  size="sm"
                  onClick={() => handleResolveHelp(req.id)}
                  className="bg-[#39FF14] text-[#050510] hover:bg-[#39FF14]/80"
                  data-testid={`resolve-help-${req.id}`}
                >
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="absolute top-4 left-4 z-50 flex gap-2">
        <Button
          onClick={() => navigate("/escape-room")}
          className="glass-panel text-[#C0C0C0] hover:text-[#D4AF37] border border-white/20"
          data-testid="home-btn"
        >
          <Home className="w-5 h-5" />
        </Button>
        <Button
          onClick={toggleMusic}
          className={`glass-panel border border-white/20 ${musicPlaying ? 'text-[#39FF14]' : 'text-[#C0C0C0]'} hover:text-[#D4AF37]`}
          data-testid="music-btn"
        >
          {musicPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </Button>
      </div>

      {/* 4 Corners Grid */}
      <div className="grid grid-cols-2 grid-rows-2 h-screen w-screen">
        {renderGroupCorner("comerrocas", "TL")}
        {renderGroupCorner("silfos", "TR")}
        {renderGroupCorner("fuegos", "BL")}
        {renderGroupCorner("diminutenses", "BR")}
      </div>

      {/* Central Timer */}
      <div 
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-80 md:h-80 rounded-full glass-panel border-4 flex flex-col items-center justify-center z-40 ${
          finalCountdownActive 
            ? 'final-countdown-active border-[#ff0000]' 
            : 'border-[#D4AF37] glow-gold'
        }`}
        data-testid="central-timer"
      >
        {/* Phase Display */}
        <div className="flex items-center gap-2 mb-2">
          {finalCountdownActive ? (
            <span className="font-cinzel text-sm md:text-base text-[#ff0000] tracking-wider animate-pulse font-bold">
              ¡CUENTA ATRÁS FINAL!
            </span>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handlePhaseChange(-1)}
                disabled={currentPhase <= 1}
                className="text-[#C0C0C0] hover:text-[#D4AF37] p-1"
                data-testid="phase-prev-btn"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-cinzel text-xs md:text-sm text-[#D4AF37] tracking-wider">
                Fase {currentPhase}: {PHASE_NAMES[currentPhase]}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handlePhaseChange(1)}
                disabled={currentPhase >= 5}
                className="text-[#C0C0C0] hover:text-[#D4AF37] p-1"
                data-testid="phase-next-btn"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        {/* Timer Display */}
        <div 
          className={`font-cinzel text-5xl md:text-7xl font-bold tracking-tighter ${getTimerClass()}`}
          data-testid="timer-display"
        >
          {formatTime(localTimer)}
        </div>

        {/* Victory Button - Only shown during final countdown */}
        {finalCountdownActive && (
          <Button
            onClick={handleVictory}
            className="mt-4 bg-[#39FF14] text-[#050510] hover:bg-[#39FF14]/80 font-cinzel text-lg px-6 py-3 glow-neon animate-pulse"
            data-testid="victory-btn"
          >
            <Trophy className="w-5 h-5 mr-2" />
            ¡VICTORIA!
          </Button>
        )}

        {/* Timer Controls */}
        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleStartPause}
            className="bg-[#D4AF37] text-[#050510] hover:bg-[#D4AF37]/80 font-cinzel"
            data-testid="start-pause-btn"
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          <Button
            onClick={handleReset}
            className="bg-[#800000] text-[#f0e6d2] hover:bg-[#800000]/80 font-cinzel"
            data-testid="reset-btn"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
          <Button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="glass-panel text-[#C0C0C0] hover:text-[#D4AF37] border border-white/20"
            data-testid="sound-toggle-btn"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
        </div>

        {/* Timer Adjustment Slider */}
        {!isRunning && !finalCountdownActive && (
          <div className="w-48 mt-4">
            <Slider
              value={[Math.floor(localTimer / 60)]}
              onValueChange={handleAdjustTimer}
              min={1}
              max={30}
              step={1}
              className="w-full"
              data-testid="timer-slider"
            />
            <p className="text-xs text-[#C0C0C0] text-center mt-1">
              Ajustar minutos: {Math.floor(localTimer / 60)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
