import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Crown, Users, Home } from "lucide-react";

const AURYN_IMAGE = "https://customer-assets.emergentagent.com/job_d9bfee2e-1cd6-4cca-8124-1a128871d13b/artifacts/8q4brk6d_Auryn.png";

export default function EscapeRoomHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen app-container bg-neutral-950 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Radial Glow Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(30,30,30,1)_0%,_rgba(10,10,10,1)_70%,_rgba(5,5,5,1)_100%)]" />
      
      {/* Back Button */}
      <motion.button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 z-50 font-cinzel text-yellow-400/70 hover:text-yellow-400 transition-colors flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        data-testid="back-button"
      >
        <Home className="w-5 h-5" />
        Volver
      </motion.button>

      <div className="relative z-10 flex flex-col items-center">
        {/* Title */}
        <motion.h1
          className="font-cinzel font-bold text-4xl md:text-5xl lg:text-6xl text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] tracking-widest mb-4 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          data-testid="app-title"
        >
          SALVANDO FANTASÍA
        </motion.h1>
        
        <motion.p
          className="font-cinzel text-base md:text-lg text-gray-400 tracking-wide mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          Escape Room basado en La Historia Interminable
        </motion.p>

        {/* AURYN Symbol */}
        <motion.div 
          className="mb-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-yellow-500 drop-shadow-[0_0_25px_rgba(250,204,21,0.4)]">
            <motion.img 
              src={AURYN_IMAGE}
              alt="AURYN"
              className="w-full h-full object-cover"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex flex-col md:flex-row gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <Button
              onClick={() => navigate("/escape-room/master")}
              className="px-8 py-6 text-lg font-cinzel tracking-wider border-2 border-yellow-500 text-yellow-400 bg-transparent hover:bg-yellow-500/20 transition-all duration-300"
              data-testid="master-panel-btn"
            >
              <Crown className="mr-3 h-6 w-6" />
              PANEL MAESTRO
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <Button
              onClick={() => navigate("/escape-room/tablet")}
              className="px-8 py-6 text-lg font-cinzel tracking-wider border-2 border-gray-400 text-gray-300 bg-transparent hover:bg-gray-400/20 transition-all duration-300"
              data-testid="student-tablet-btn"
            >
              <Users className="mr-3 h-6 w-6" />
              TABLET ALUMNO
            </Button>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.p 
          className="mt-12 text-yellow-700/60 text-sm font-cinzel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          5º de Primaria - Escape Room Educativo
        </motion.p>
      </div>
    </div>
  );
}
