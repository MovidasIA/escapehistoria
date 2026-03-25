import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const AURYN_IMAGE = "https://customer-assets.emergentagent.com/job_d9bfee2e-1cd6-4cca-8124-1a128871d13b/artifacts/8q4brk6d_Auryn.png";

// Magical Particles Background
const MagicalParticles = () => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-yellow-400/30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.1, 0.5, 0.1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div 
      className="app-container relative w-full h-screen overflow-hidden bg-neutral-950 flex flex-col items-center justify-center"
      data-testid="home-page"
    >
      {/* Radial Glow Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(30,30,30,1)_0%,_rgba(10,10,10,1)_70%,_rgba(5,5,5,1)_100%)]" />
      
      {/* Magical Particles */}
      <MagicalParticles />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Title */}
        <motion.h1
          className="font-cinzel font-bold text-3xl md:text-4xl lg:text-5xl text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] tracking-wider text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          data-testid="home-title"
        >
          La Historia Interminable
        </motion.h1>

        <motion.p
          className="font-cinzel text-lg md:text-xl text-yellow-200/70 tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          Escape Room
        </motion.p>

        {/* Auryn */}
        <motion.div
          className="relative w-40 h-40 md:w-52 md:h-52 lg:w-64 lg:h-64 rounded-full overflow-hidden my-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <motion.img
            src={AURYN_IMAGE}
            alt="Auryn"
            className="w-full h-full object-cover drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]"
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-yellow-400/20"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="font-cinzel text-base md:text-lg text-yellow-400/60 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
        >
          Selecciona tu clase
        </motion.p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
          <motion.button
            onClick={() => navigate("/5a")}
            className="font-cinzel font-bold text-xl md:text-2xl px-10 py-4 rounded-lg bg-gradient-to-b from-yellow-600 to-yellow-800 text-white shadow-lg shadow-yellow-900/50 hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 tracking-wider"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-testid="btn-5a"
          >
            5º A
          </motion.button>

          <motion.button
            onClick={() => navigate("/5b")}
            className="font-cinzel font-bold text-xl md:text-2xl px-10 py-4 rounded-lg bg-gradient-to-b from-orange-600 to-orange-800 text-white shadow-lg shadow-orange-900/50 hover:from-orange-500 hover:to-orange-700 transition-all duration-300 tracking-wider"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-testid="btn-5b"
          >
            5º B
          </motion.button>
        </div>
      </div>
    </div>
  );
}
