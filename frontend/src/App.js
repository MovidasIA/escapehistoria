import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "@/App.css";

// Auryn image URL
const AURYN_IMAGE = "https://customer-assets.emergentagent.com/job_d9bfee2e-1cd6-4cca-8124-1a128871d13b/artifacts/8q4brk6d_Auryn.png";

// Groups data
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

// All student names in sorting order (mixed from all groups for dramatic effect)
const SORTING_ORDER = [
  "Pablo A",    // Comerrocas
  "Jorge",      // Silfos
  "Salva",      // Fuegos
  "Elena",      // Diminutenses
  "Olivia",     // Comerrocas
  "Agustín",    // Silfos
  "Zoe",        // Fuegos
  "Lucía",      // Diminutenses
  "Carlos",     // Comerrocas
  "David",      // Silfos
  "Adriana",    // Fuegos
  "Alonso",     // Diminutenses
  "Luz",        // Comerrocas
  "Valeria",    // Silfos
  "Raúl",       // Fuegos
  "Ángel",      // Diminutenses
  "Miriam",     // Silfos
  "Marcos",     // Fuegos
  "Pablo M",    // Diminutenses
  "Dary"        // Special - last one
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

// Get purple shade based on name index
const getPurpleShade = (name) => {
  const index = ALL_NAMES.indexOf(name);
  return PURPLE_SHADES[index % PURPLE_SHADES.length];
};

// Get group color for a name (used after sorting)
const getGroupColor = (name) => {
  for (const [groupName, groupData] of Object.entries(GROUPS)) {
    if (groupData.members.includes(name)) {
      return { color: groupData.color, glow: groupData.glow };
    }
  }
  if (name === SPECIAL_MEMBER.name) {
    return { color: "text-yellow-300", glow: "drop-shadow-[0_0_12px_rgba(253,224,71,0.7)]" };
  }
  return { color: "text-white", glow: "" };
};

// Floating Name Component
const FloatingName = ({ name, initialPosition, sortedNames }) => {
  // Use purple shade when floating
  const { color, glow } = getPurpleShade(name);
  const isSorted = sortedNames.includes(name);
  
  // Generate random wandering animation
  const wanderAnimation = useMemo(() => {
    const points = Array.from({ length: 5 }, () => ({
      x: (Math.random() - 0.5) * 150,
      y: (Math.random() - 0.5) * 150,
    }));
    return {
      x: points.map(p => p.x),
      y: points.map(p => p.y),
    };
  }, []);

  if (isSorted) return null;

  return (
    <motion.div
      layoutId={name}
      className={`absolute font-cinzel font-semibold text-xl md:text-2xl ${color} ${glow} cursor-default select-none`}
      style={{
        left: `${initialPosition.x}%`,
        top: `${initialPosition.y}%`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: wanderAnimation.x,
        y: wanderAnimation.y,
      }}
      transition={{
        opacity: { duration: 0.5 },
        scale: { duration: 0.5 },
        x: {
          duration: 20 + Math.random() * 10,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        },
        y: {
          duration: 15 + Math.random() * 10,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        },
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

  // Filter members that have been sorted
  const sortedMembers = groupData.members.filter(name => sortedNames.includes(name));

  return (
    <div
      className={`absolute flex flex-col gap-1 md:gap-2 z-20 ${positionClasses[groupData.position]}`}
      data-testid={`group-corner-${groupData.position}`}
    >
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
              transition={{
                layout: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] },
                opacity: { duration: 0.5 },
                scale: { duration: 0.5 }
              }}
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
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      <div className="relative w-32 h-32 md:w-40 md:h-40 lg:w-52 lg:h-52 rounded-full overflow-hidden">
        <motion.img
          src={AURYN_IMAGE}
          alt="Auryn - Click para ordenar los grupos"
          className="w-full h-full object-cover drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]"
          animate={!isSorted ? {
            rotate: [0, 5, -5, 0],
            scale: [1, 1.02, 1],
          } : {
            rotate: 0,
            scale: 1,
          }}
          transition={{
            duration: 4,
            repeat: !isSorted ? Infinity : 0,
            ease: "easeInOut"
          }}
        />
      </div>
      {!isSorted && (
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
        transition={{
          layout: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] },
          opacity: { duration: 0.5 },
          scale: { duration: 0.5 }
        }}
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
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    })), []
  );

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

// Main App Component
function App() {
  const [isSorting, setIsSorting] = useState(false);
  const [sortedNames, setSortedNames] = useState([]);
  const [showDaryMessage, setShowDaryMessage] = useState(false);

  // Generate initial random positions for floating names
  const initialPositions = useMemo(() => {
    const positions = {};
    ALL_NAMES.forEach((name) => {
      // Keep names away from corners and center
      let x, y;
      do {
        x = Math.random() * 70 + 15; // 15% to 85%
        y = Math.random() * 70 + 15; // 15% to 85%
      } while (
        // Avoid center area
        (x > 35 && x < 65 && y > 35 && y < 65) ||
        // Avoid corners
        (x < 25 && y < 25) ||
        (x > 75 && y < 25) ||
        (x < 25 && y > 75) ||
        (x > 75 && y > 75)
      );
      positions[name] = { x, y };
    });
    return positions;
  }, []);

  // Sequential sorting effect
  useEffect(() => {
    if (isSorting && sortedNames.length < SORTING_ORDER.length) {
      const timer = setTimeout(() => {
        const nextName = SORTING_ORDER[sortedNames.length];
        setSortedNames(prev => [...prev, nextName]);
      }, 800); // 800ms between each name
      
      return () => clearTimeout(timer);
    } else if (sortedNames.length === SORTING_ORDER.length) {
      // All names sorted, show Dary's message
      const timer = setTimeout(() => {
        setShowDaryMessage(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isSorting, sortedNames]);

  const handleAurynClick = () => {
    if (!isSorting) {
      setIsSorting(true);
    }
  };

  return (
    <div 
      className="app-container relative w-full h-screen overflow-hidden bg-neutral-950"
      data-testid="escape-room-app"
    >
      {/* Radial Glow Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(30,30,30,1)_0%,_rgba(10,10,10,1)_70%,_rgba(5,5,5,1)_100%)]" />
      
      {/* Magical Particles */}
      <MagicalParticles />

      {/* Group Corners */}
      {Object.entries(GROUPS).map(([groupName, groupData]) => (
        <GroupCorner
          key={groupName}
          groupName={groupName}
          groupData={groupData}
          sortedNames={sortedNames}
        />
      ))}

      {/* Floating Names Container */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {ALL_NAMES.map((name) => (
          <FloatingName
            key={name}
            name={name}
            initialPosition={initialPositions[name]}
            sortedNames={sortedNames}
          />
        ))}
      </div>

      {/* Center Auryn */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
        <Auryn onClick={handleAurynClick} isSorted={isSorting} />
        <DarySpecial sortedNames={sortedNames} showMessage={showDaryMessage} />
      </div>

      {/* Click instruction */}
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

export default App;
