import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Auryn image URL
const AURYN_IMAGE = "https://customer-assets.emergentagent.com/job_d9bfee2e-1cd6-4cca-8124-1a128871d13b/artifacts/8q4brk6d_Auryn.png";

// Groups data for 5ºA
const GROUPS = {
  "Los Comerrocas": {
    members: ["Pablo A", "Olivia", "Carlos", "Luz"],
    color: "text-yellow-400",
    glow: "drop-shadow-[0_0_12px_rgba(250,204,21,0.7)]",
    position: "top-left"
  },
  "Los Silfos Nocturnos": {
    members: ["Jorge", "Agustín", "David", "Valeria", "Miriam"],
    color: "text-orange-500",
    glow: "drop-shadow-[0_0_12px_rgba(234,88,12,0.7)]",
    position: "top-right"
  },
  "Los Fuegos Fatuos": {
    members: ["Salva", "Zoe", "Adriana", "Raúl", "Marcos"],
    color: "text-orange-400",
    glow: "drop-shadow-[0_0_12px_rgba(249,115,22,0.7)]",
    position: "bottom-left"
  },
  "Los Diminutenses": {
    members: ["Elena", "Lucía", "Alonso", "Ángel", "Pablo M"],
    color: "text-green-500",
    glow: "drop-shadow-[0_0_12px_rgba(34,197,94,0.7)]",
    position: "bottom-right"
  }
};

// Special member
const SPECIAL_MEMBER = {
  name: "Dary",
  message: "Ayudante de Jose"
};

// Sorting order for 5ºA
const SORTING_ORDER = [
  "Pablo A", "Jorge", "Salva", "Elena",
  "Olivia", "Agustín", "Zoe", "Lucía",
  "Carlos", "David", "Adriana", "Alonso",
  "Luz", "Valeria", "Raúl", "Ángel",
  "Miriam", "Marcos", "Pablo M", "Dary"
];

// All student names
const ALL_NAMES = [
  "Pablo A", "David", "Raúl", "Luz", "Jorge", "Lucía", "Elena", "Miriam",
  "Salva", "Dary", "Pablo M", "Adriana", "Olivia", "Valeria", "Marcos",
  "Zoe", "Alonso", "Carlos", "Ángel", "Agustín"
];

// Purple shades for floating names
const PURPLE_SHADES = [
  { color: "text-purple-300", glow: "drop-shadow-[0_0_10px_rgba(216,180,254,0.6)]" },
  { color: "text-purple-400", glow: "drop-shadow-[0_0_10px_rgba(192,132,252,0.6)]" },
  { color: "text-purple-500", glow: "drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]" },
  { color: "text-violet-300", glow: "drop-shadow-[0_0_10px_rgba(196,181,253,0.6)]" },
  { color: "text-violet-400", glow: "drop-shadow-[0_0_10px_rgba(167,139,250,0.6)]" },
  { color: "text-fuchsia-300", glow: "drop-shadow-[0_0_10px_rgba(240,171,252,0.6)]" },
  { color: "text-fuchsia-400", glow: "drop-shadow-[0_0_10px_rgba(232,121,249,0.6)]" },
];

const getPurpleShade = (name) => {
  const index = ALL_NAMES.indexOf(name);
  return PURPLE_SHADES[index % PURPLE_SHADES.length];
};

// Floating Name Component
const FloatingName = ({ name, initialPosition, sortedNames }) => {
  const { color, glow } = getPurpleShade(name);
  const isSorted = sortedNames.includes(name);
  
  const wanderAnimation = useMemo(() => {
    const points = Array.from({ length: 5 }, () => ({
      x: (Math.random() - 0.5) * 150,
      y: (Math.random() - 0.5) * 150,
    }));
    return { x: points.map(p => p.x), y: points.map(p => p.y) };
  }, []);

  if (isSorted) return null;

  return (
    <motion.div
      layoutId={name}
      className={`absolute font-cinzel font-semibold text-xl md:text-2xl ${color} ${glow} cursor-default select-none`}
      style={{ left: `${initialPosition.x}%`, top: `${initialPosition.y}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1, x: wanderAnimation.x, y: wanderAnimation.y }}
      transition={{
        opacity: { duration: 0.5 },
        scale: { duration: 0.5 },
        x: { duration: 20 + Math.random() * 10, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
        y: { duration: 15 + Math.random() * 10, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
      }}
      data-testid={`floating-name-${name.replace(/\s+/g, '-')}`}
    >
      {name}
    </motion.div>
  );
};

// Group Corner Component
const GroupCorner = ({ groupName, groupData, sortedNames }) => {
  const positionClasses = {
    "top-left": "top-2 left-4 md:top-4 md:left-6 items-start text-left",
    "top-right": "top-2 right-4 md:top-4 md:right-6 items-end text-right",
    "bottom-left": "bottom-10 left-4 md:bottom-12 md:left-6 items-start text-left",
    "bottom-right": "bottom-10 right-4 md:bottom-12 md:right-6 items-end text-right"
  };

  const sortedMembers = groupData.members.filter(name => sortedNames.includes(name));

  return (
    <div className={`absolute flex flex-col gap-1 md:gap-2 z-20 ${positionClasses[groupData.position]}`} data-testid={`group-corner-${groupData.position}`}>
      <motion.h2
        className={`font-cinzel font-bold text-lg md:text-xl lg:text-2xl tracking-wider uppercase ${groupData.color} ${groupData.glow}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        data-testid={`group-title-${groupName.replace(/\s+/g, '-')}`}
      >
        {groupName}
      </motion.h2>
      
      <div className="flex flex-col gap-0.5 md:gap-1 mt-1">
        <AnimatePresence>
          {sortedMembers.map((name) => (
            <motion.div
              key={name}
              layoutId={name}
              className={`font-cinzel font-semibold text-base md:text-lg ${groupData.color} ${groupData.glow}`}
              initial={{ opacity: 0, scale: 1.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ layout: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }, opacity: { duration: 0.5 }, scale: { duration: 0.5 } }}
              data-testid={`sorted-name-${name.replace(/\s+/g, '-')}`}
            >
              {name}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Auryn Component
const Auryn = ({ onClick, isSorted }) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={isSorted}
      className="relative z-50 focus:outline-none cursor-pointer disabled:cursor-default"
      whileHover={!isSorted ? { scale: 1.1 } : {}}
      whileTap={!isSorted ? { scale: 0.95 } : {}}
      data-testid="auryn-trigger"
    >
      <div className="relative w-32 h-32 md:w-40 md:h-40 lg:w-52 lg:h-52 rounded-full overflow-hidden">
        <motion.img
          src={AURYN_IMAGE}
          alt="Auryn"
          className="w-full h-full object-cover drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]"
          animate={!isSorted ? { rotate: [0, 5, -5, 0], scale: [1, 1.02, 1] } : { rotate: 0, scale: 1 }}
          transition={{ duration: 4, repeat: !isSorted ? Infinity : 0, ease: "easeInOut" }}
        />
      </div>
      {!isSorted && (
        <motion.div
          className="absolute inset-0 rounded-full bg-yellow-400/20"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.button>
  );
};

// Dary Special Component
const DarySpecial = ({ sortedNames, showMessage }) => {
  const isDarySorted = sortedNames.includes("Dary");
  if (!isDarySorted) return null;

  return (
    <div className="flex flex-col items-center gap-3 mt-4">
      <motion.div
        layoutId="Dary"
        className="font-cinzel font-semibold text-xl md:text-2xl text-yellow-300 drop-shadow-[0_0_12px_rgba(253,224,71,0.7)]"
        initial={{ opacity: 0, scale: 1.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ layout: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }, opacity: { duration: 0.5 }, scale: { duration: 0.5 } }}
        data-testid="dary-name"
      >
        Dary
      </motion.div>
      
      <AnimatePresence>
        {showMessage && (
          <motion.p
            className="font-cinzel italic text-base md:text-lg text-yellow-200/90 drop-shadow-[0_0_8px_rgba(253,224,71,0.5)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            data-testid="dary-message"
          >
            {SPECIAL_MEMBER.message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// Magical Particles Background
const MagicalParticles = () => {
  const particles = useMemo(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 3 + 1, duration: Math.random() * 20 + 10, delay: Math.random() * 5,
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-yellow-400/30"
          style={{ left: `${particle.x}%`, top: `${particle.y}%`, width: particle.size, height: particle.size }}
          animate={{ y: [0, -100, 0], opacity: [0.1, 0.5, 0.1] }}
          transition={{ duration: particle.duration, repeat: Infinity, delay: particle.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
};

// Main Component for 5ºA
export default function ClassA() {
  const navigate = useNavigate();
  const [isSorting, setIsSorting] = useState(false);
  const [sortedNames, setSortedNames] = useState([]);
  const [showDaryMessage, setShowDaryMessage] = useState(false);

  const initialPositions = useMemo(() => {
    const positions = {};
    ALL_NAMES.forEach((name) => {
      let x, y;
      do {
        x = Math.random() * 70 + 15;
        y = Math.random() * 70 + 15;
      } while (
        (x > 35 && x < 65 && y > 35 && y < 65) ||
        (x < 25 && y < 25) || (x > 75 && y < 25) ||
        (x < 25 && y > 75) || (x > 75 && y > 75)
      );
      positions[name] = { x, y };
    });
    return positions;
  }, []);

  useEffect(() => {
    if (isSorting && sortedNames.length < SORTING_ORDER.length) {
      const timer = setTimeout(() => {
        setSortedNames(prev => [...prev, SORTING_ORDER[sortedNames.length]]);
      }, 800);
      return () => clearTimeout(timer);
    } else if (sortedNames.length === SORTING_ORDER.length) {
      const timer = setTimeout(() => setShowDaryMessage(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isSorting, sortedNames]);

  const handleAurynClick = () => {
    if (!isSorting) setIsSorting(true);
  };

  return (
    <div className="app-container relative w-full h-screen overflow-hidden bg-neutral-950" data-testid="class-a-page">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(30,30,30,1)_0%,_rgba(10,10,10,1)_70%,_rgba(5,5,5,1)_100%)]" />
      <MagicalParticles />

      {/* Back Button - centered below class title */}
      <motion.button
        onClick={() => navigate("/")}
        className="absolute top-12 left-1/2 transform -translate-x-1/2 z-50 font-cinzel text-sm text-yellow-400/70 hover:text-yellow-400 transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        data-testid="back-button"
      >
        ← Volver
      </motion.button>

      {/* Class Title */}
      <motion.h1
        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 font-cinzel font-bold text-xl md:text-2xl text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        data-testid="class-title"
      >
        5º A
      </motion.h1>

      {Object.entries(GROUPS).map(([groupName, groupData]) => (
        <GroupCorner key={groupName} groupName={groupName} groupData={groupData} sortedNames={sortedNames} />
      ))}

      <div className="absolute inset-0 z-10 pointer-events-none">
        {ALL_NAMES.map((name) => (
          <FloatingName key={name} name={name} initialPosition={initialPositions[name]} sortedNames={sortedNames} />
        ))}
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
        <Auryn onClick={handleAurynClick} isSorted={isSorting} />
        <DarySpecial sortedNames={sortedNames} showMessage={showDaryMessage} />
      </div>

      <AnimatePresence>
        {!isSorting && (
          <motion.p
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 font-cinzel text-sm md:text-base text-yellow-400/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 2, duration: 1 }}
            data-testid="click-instruction"
          >
            Haz clic en el Auryn para formar los grupos
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
