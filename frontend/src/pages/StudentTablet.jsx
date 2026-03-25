import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Input } from "../components/ui/input";
import { 
  Home, HelpCircle, Scroll, Check, 
  Crown, Mountain, Waves, Palmtree, Lock, Sparkles 
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "../components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const GROUP_CONFIG = {
  comerrocas: { 
    name: "Los Comerrocas", 
    icon: Mountain, 
    color: "#FFD700",
    description: "Gigantes de piedra que devoran montañas enteras"
  },
  silfos: { 
    name: "Los Silfos Nocturnos", 
    icon: Waves, 
    color: "#8B4513",
    description: "Espíritus del aire que danzan en la oscuridad"
  },
  fuegos: { 
    name: "Los Fuegos Fatuos", 
    icon: Crown, 
    color: "#DAA520",
    description: "Luces misteriosas que guían a los viajeros"
  },
  diminutenses: { 
    name: "Los diminutenses", 
    icon: Palmtree, 
    color: "#228B22",
    description: "Pequeños seres de gran valentía y astucia"
  }
};

export default function StudentTablet() {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [selectedGroup, setSelectedGroup] = useState(groupId || null);
  const [gameState, setGameState] = useState(null);
  const [oracleMessage, setOracleMessage] = useState(null);
  const [currentStation, setCurrentStation] = useState(1);
  const [helpSent, setHelpSent] = useState(false);
  const [timerDisplay, setTimerDisplay] = useState("15:00");
  
  // Code input for Station 4
  const [codeDigits, setCodeDigits] = useState(['', '', '']);
  const [codeError, setCodeError] = useState(false);
  const [finalClue, setFinalClue] = useState(null);
  const inputRefs = [useRef(null), useRef(null), useRef(null)];

  // Reset code state when group changes
  useEffect(() => {
    setCodeDigits(['', '', '']);
    setCodeError(false);
    setFinalClue(null);
  }, [selectedGroup]);

  // Fetch game state
  const fetchGameState = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/game-state`);
      const data = response.data;
      setGameState(data);
      
      // Calculate timer display
      const mins = Math.floor(data.timer_seconds / 60);
      const secs = data.timer_seconds % 60;
      setTimerDisplay(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      
      // Determine current station based on progress
      if (selectedGroup && data.groups[selectedGroup]) {
        const stations = data.groups[selectedGroup].stations_completed;
        const nextStation = stations.findIndex(s => !s);
        setCurrentStation(nextStation === -1 ? 4 : nextStation + 1);
        
        // If all 4 stations completed and no finalClue shown yet, fetch it
        const allCompleted = stations.every(s => s);
        if (allCompleted && !finalClue) {
          fetchFinalClue(selectedGroup);
        }
      }
    } catch (error) {
      console.error("Error fetching game state:", error);
    }
  }, [selectedGroup, finalClue]);

  // Fetch final clue for a group
  const fetchFinalClue = async (groupId) => {
    try {
      const response = await axios.get(`${API}/oracle/final-clue/${groupId}`);
      setFinalClue(response.data);
    } catch (error) {
      console.error("Error fetching final clue:", error);
    }
  };

  // Fetch oracle message
  const fetchOracleMessage = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/oracle/${currentStation}`);
      setOracleMessage(response.data);
    } catch (error) {
      console.error("Error fetching oracle message:", error);
    }
  }, [currentStation]);

  useEffect(() => {
    if (selectedGroup) {
      fetchGameState();
      const interval = setInterval(fetchGameState, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedGroup, fetchGameState]);

  useEffect(() => {
    if (selectedGroup && currentStation) {
      fetchOracleMessage();
    }
  }, [selectedGroup, currentStation, fetchOracleMessage]);

  const handleSelectGroup = (id) => {
    setSelectedGroup(id);
    navigate(`/escape-room/tablet/${id}`);
  };

  const handleRequestHelp = async () => {
    if (!selectedGroup || helpSent) return;
    
    try {
      const groupConfig = GROUP_CONFIG[selectedGroup];
      await axios.post(`${API}/game-state/help-request`, {
        group_id: selectedGroup,
        group_name: groupConfig.name,
        message: `Solicitud de ayuda - Estación ${currentStation}`
      });
      setHelpSent(true);
      toast.success("Solicitud enviada al Maestro");
      
      setTimeout(() => setHelpSent(false), 30000); // Reset after 30 seconds
    } catch (error) {
      console.error("Error requesting help:", error);
      toast.error("Error al enviar solicitud");
    }
  };

  // Handle code digit input
  const handleCodeInput = (index, value) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;
    
    const newDigits = [...codeDigits];
    newDigits[index] = value;
    setCodeDigits(newDigits);
    setCodeError(false);
    
    // Auto-focus next input
    if (value && index < 2) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const code = codeDigits.join('');
    if (code.length !== 3) {
      setCodeError(true);
      toast.error("Introduce los 3 dígitos del código");
      // Reset after showing error
      setTimeout(() => {
        setCodeError(false);
        setCodeDigits(['', '', '']);
        inputRefs[0].current?.focus();
      }, 1500);
      return;
    }
    
    try {
      const response = await axios.post(`${API}/oracle/verify-code?group_id=${selectedGroup}&code=${code}`);
      if (response.data.success) {
        setFinalClue(response.data.final_clue);
        toast.success("¡Código correcto! El Oráculo revela su secreto...");
      } else {
        setCodeError(true);
        toast.error(response.data.message);
        // Reset after showing error - clear inputs after 1.5 seconds
        setTimeout(() => {
          setCodeError(false);
          setCodeDigits(['', '', '']);
          inputRefs[0].current?.focus();
        }, 1500);
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      toast.error("Error al verificar el código");
      setCodeError(true);
      setTimeout(() => {
        setCodeError(false);
        setCodeDigits(['', '', '']);
        inputRefs[0].current?.focus();
      }, 1500);
    }
  };

  // Kingdom Selection Screen
  if (!selectedGroup) {
    return (
      <div className="min-h-screen phase-1 flex flex-col items-center justify-center p-4 md:p-8" data-testid="kingdom-selector">
        <Toaster position="top-center" />
        
        <div className="text-center mb-8">
          <h1 className="font-cinzel text-3xl md:text-5xl text-[#D4AF37] tracking-widest mb-2 text-glow">
            ELIGE TU REINO
          </h1>
          <p className="font-lato text-[#C0C0C0] text-sm md:text-base">
            Selecciona el reino al que pertenece tu grupo
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6 max-w-2xl w-full">
          {Object.entries(GROUP_CONFIG).map(([id, config]) => {
            const IconComponent = config.icon;
            return (
              <Card
                key={id}
                onClick={() => handleSelectGroup(id)}
                className="kingdom-card glass-panel border-2 cursor-pointer hover:border-[#D4AF37] transition-all duration-300"
                style={{ borderColor: config.color + '40' }}
                data-testid={`kingdom-card-${id}`}
              >
                <CardHeader className="text-center pb-2">
                  <div 
                    className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full flex items-center justify-center mb-2"
                    style={{ backgroundColor: config.color + '20', border: `2px solid ${config.color}` }}
                  >
                    <IconComponent className="w-8 h-8 md:w-10 md:h-10" style={{ color: config.color }} />
                  </div>
                  <CardTitle className="font-cinzel text-sm md:text-lg" style={{ color: config.color }}>
                    {config.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-xs md:text-sm text-[#C0C0C0] font-lato">
                    {config.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Button
          onClick={() => navigate("/escape-room")}
          className="mt-8 glass-panel text-[#C0C0C0] hover:text-[#D4AF37] border border-white/20"
          data-testid="back-home-btn"
        >
          <Home className="w-5 h-5 mr-2" />
          Volver al Inicio
        </Button>
      </div>
    );
  }

  // Final Clue Screen (after correct code)
  if (finalClue) {
    const groupConfig = GROUP_CONFIG[selectedGroup];
    const IconComponent = groupConfig.icon;
    const timerSeconds = gameState?.timer_seconds || 600;
    const finalTimerClass = timerSeconds <= 180 ? 'timer-heartbeat' : 'timer-green';
    
    return (
      <div className="min-h-screen phase-5 flex flex-col p-4 md:p-6" data-testid="final-clue-screen">
        <Toaster position="top-center" />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => setFinalClue(null)}
            className="glass-panel text-[#C0C0C0] hover:text-[#D4AF37] border border-white/20"
            data-testid="back-btn"
          >
            <Home className="w-5 h-5" />
          </Button>
          
          <div 
            className={`font-cinzel text-2xl md:text-3xl font-bold tracking-tighter ${finalTimerClass}`}
            data-testid="tablet-timer"
          >
            {timerDisplay}
          </div>
        </div>

        {/* Kingdom Header */}
        <div className="text-center mb-6">
          <div 
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-3 glow-gold"
            style={{ backgroundColor: groupConfig.color + '20', border: `3px solid ${groupConfig.color}` }}
          >
            <IconComponent className="w-10 h-10" style={{ color: groupConfig.color }} />
          </div>
          <h1 className="font-cinzel text-2xl md:text-3xl tracking-wider" style={{ color: groupConfig.color }}>
            {groupConfig.name}
          </h1>
        </div>

        {/* Final Clue Card */}
        <Card className="oracle-scroll mb-6 rounded-lg flex-1" data-testid="final-clue-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-[#5a3d1a]" />
              <CardTitle className="font-cinzel text-[#3d2a14] text-2xl">
                {finalClue.title}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-[#5a3d1a]/10 p-6 rounded-lg border-2 border-[#8A7124]/50">
              <p className="font-lato text-xl md:text-2xl text-[#2a1a0a] leading-relaxed italic text-center">
                "{finalClue.message}"
              </p>
            </div>
            <div className="text-center mt-6">
              <p className="font-cinzel text-[#5a3d1a] text-lg">
                ¡Id rápido! El destino de Fantasía está en vuestras manos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group Progress View
  const groupConfig = GROUP_CONFIG[selectedGroup];
  const groupData = gameState?.groups?.[selectedGroup];
  const stations = groupData?.stations_completed || [false, false, false, false];
  const completedCount = stations.filter(Boolean).length;
  const progressPercent = (completedCount / 4) * 100;
  const IconComponent = groupConfig.icon;

  // Timer styling: green > 3 min, red with heartbeat <= 3 min
  const timerSeconds = gameState?.timer_seconds || 600;
  const isTimerHeartbeat = timerSeconds <= 180; // 3 minutes or less
  
  // Check if we're on station 4 with code input
  const showCodeInput = currentStation === 4 && oracleMessage?.has_code;

  // Get timer class based on remaining time
  const getTabletTimerClass = () => {
    if (timerSeconds <= 180) return 'timer-heartbeat'; // 3 min or less - red with heartbeat
    return 'timer-green'; // More than 3 min - green
  };

  return (
    <div className="min-h-screen phase-1 flex flex-col p-4 md:p-6" data-testid="student-tablet">
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={() => {
            setSelectedGroup(null);
            navigate("/escape-room/tablet");
          }}
          className="glass-panel text-[#C0C0C0] hover:text-[#D4AF37] border border-white/20"
          data-testid="change-kingdom-btn"
        >
          <Home className="w-5 h-5" />
        </Button>
        
        {/* Timer Display */}
        <div 
          className={`font-cinzel text-2xl md:text-3xl font-bold tracking-tighter ${getTabletTimerClass()}`}
          data-testid="tablet-timer"
        >
          {timerDisplay}
        </div>
      </div>

      {/* Kingdom Header */}
      <div className="text-center mb-6">
        <div 
          className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-3 glow-gold"
          style={{ backgroundColor: groupConfig.color + '20', border: `3px solid ${groupConfig.color}` }}
        >
          <IconComponent className="w-10 h-10" style={{ color: groupConfig.color }} />
        </div>
        <h1 className="font-cinzel text-2xl md:text-3xl tracking-wider" style={{ color: groupConfig.color }}>
          {groupConfig.name}
        </h1>
      </div>

      {/* Progress Section */}
      <Card className="glass-panel border-[#D4AF37]/30 mb-6" data-testid="progress-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-cinzel text-[#D4AF37] text-lg">Tu Progreso</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercent} className="h-4 mb-4" />
          <div className="flex justify-between">
            {stations.map((completed, idx) => (
              <div 
                key={idx}
                className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-cinzel text-lg transition-all duration-300 ${
                  completed ? 'node-active' : idx + 1 === currentStation ? 'border-2 border-[#D4AF37] text-[#D4AF37]' : 'node-default'
                }`}
                data-testid={`progress-node-${idx}`}
              >
                {completed ? <Check className="w-6 h-6 text-[#050510]" /> : idx + 1}
              </div>
            ))}
          </div>
          <p className="text-center text-[#C0C0C0] mt-4 font-lato">
            {completedCount === 4 
              ? "¡Todas las estaciones completadas! Busca la pista final." 
              : `Estación actual: ${currentStation} de 4`
            }
          </p>
        </CardContent>
      </Card>

      {/* Oracle Message */}
      {oracleMessage && completedCount < 4 && (
        <Card className="oracle-scroll mb-6 rounded-lg" data-testid="oracle-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Scroll className="w-7 h-7 text-[#5a3d1a]" />
              <CardTitle className="font-cinzel text-[#3d2a14] text-xl">
                Mensaje del Oráculo
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="font-cinzel text-2xl text-[#5a3d1a] mb-4 font-bold">
              {oracleMessage.title}
            </h3>
            <div className="font-lato text-[#2a1a0a] mb-5 leading-relaxed whitespace-pre-line text-base md:text-lg">
              {oracleMessage.riddle}
            </div>
            <div className="bg-[#5a3d1a]/15 p-4 rounded-lg border-2 border-[#8A7124]/50">
              <p className="font-lato text-base md:text-lg text-[#3d2a14] font-medium">
                {oracleMessage.hint}
              </p>
            </div>
            
            {/* Code Input for Station 4 */}
            {showCodeInput && (
              <div className="mt-6 pt-6 border-t-2 border-[#8A7124]/30" data-testid="code-input-section">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Lock className="w-6 h-6 text-[#5a3d1a]" />
                  <h4 className="font-cinzel text-xl text-[#5a3d1a]">Introduce el Código del Candado</h4>
                </div>
                
                <div className="flex justify-center gap-4 mb-4">
                  {[0, 1, 2].map((index) => (
                    <Input
                      key={index}
                      ref={inputRefs[index]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={codeDigits[index]}
                      onChange={(e) => handleCodeInput(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`w-16 h-20 text-center text-4xl font-cinzel font-bold bg-[#f5e6c8] border-4 ${
                        codeError ? 'border-red-600' : 'border-[#8A7124]'
                      } text-[#2a1a0a] rounded-lg focus:border-[#D4AF37] focus:ring-[#D4AF37]`}
                      data-testid={`code-digit-${index}`}
                    />
                  ))}
                </div>
                
                <Button
                  onClick={handleVerifyCode}
                  className="w-full py-4 bg-[#8A7124] hover:bg-[#5a3d1a] text-[#f5e6c8] font-cinzel text-lg tracking-wider"
                  data-testid="verify-code-btn"
                >
                  <Lock className="w-5 h-5 mr-2" />
                  Abrir el Candado
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Help Button */}
      <div className="mt-auto">
        <Button
          onClick={handleRequestHelp}
          disabled={helpSent || completedCount === 4}
          className={`w-full py-6 font-cinzel text-lg tracking-wider transition-all duration-300 ${
            helpSent 
              ? 'bg-[#39FF14] text-[#050510]' 
              : 'bg-[#800000] hover:bg-[#800000]/80 text-[#f0e6d2]'
          }`}
          data-testid="help-btn"
        >
          <HelpCircle className="w-6 h-6 mr-2" />
          {helpSent ? "Ayuda Solicitada" : "Solicitar Ayuda al Maestro"}
        </Button>
      </div>
    </div>
  );
}
