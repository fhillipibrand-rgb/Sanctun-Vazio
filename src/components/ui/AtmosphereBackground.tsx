import React from "react";
import { motion, AnimatePresence } from "motion/react";

interface AtmosphereProps {
  mode: "deep-work" | "creative" | "routine";
}

const ATMOSPHERE_CONFIG = {
  "deep-work": {
    primary: "#a855f7",
    secondary: "#6b21a8",
    accent: "#000000",
    speed: 25,
    opacity: 0.4,
    label: "O VÁCUO"
  },
  "creative": {
    primary: "#3b82f6",
    secondary: "#ec4899",
    accent: "#1e1b4b",
    speed: 15,
    opacity: 0.5,
    label: "O ÉTER"
  },
  "routine": {
    primary: "#10b981",
    secondary: "#f59e0b",
    accent: "#064e3b",
    speed: 35,
    opacity: 0.3,
    label: "O SOLO"
  }
};

const AtmosphereBackground: React.FC<AtmosphereProps> = ({ mode }) => {
  const config = ATMOSPHERE_CONFIG[mode] || ATMOSPHERE_CONFIG["deep-work"];

  return (
    <div 
      className="absolute inset-0 overflow-hidden bg-black pointer-events-none"
      style={{
        // Dissipação elíptica ultra-suave
        maskImage: 'radial-gradient(ellipse at center, black 10%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 10%, transparent 75%)',
      }}
    >
      {/* Base Gradient */}
      <motion.div 
        animate={{ 
          backgroundColor: config.accent 
        }}
        transition={{ duration: 2 }}
        className="absolute inset-0" 
      />

      {/* SVG Filters for Fluid Effect */}
      <svg className="hidden">
        <defs>
          <filter id="fluid-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" seed="2">
              <animate attributeName="baseFrequency" dur="40s" values="0.01;0.007;0.01" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="80" />
          </filter>
        </defs>
      </svg>

      {/* Animated Blobs - Expanded for more organic feel */}
      <div 
        className="absolute inset-0 filter blur-[120px] opacity-70" 
        style={{ 
          filter: 'url(#fluid-filter) blur(120px)',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={mode + "-blob-1"}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: config.opacity,
              scale: [1, 1.2, 1],
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: config.speed, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute -top-[20%] -left-[10%] w-[80%] h-[80%] rounded-full"
            style={{ background: `radial-gradient(circle, ${config.primary} 0%, transparent 70%)` }}
          />
          <motion.div
            key={mode + "-blob-2"}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: config.opacity,
              scale: [1.2, 1, 1.2],
              x: [0, -100, 0],
              y: [0, -50, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: config.speed * 1.2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute -bottom-[20%] -right-[10%] w-[80%] h-[80%] rounded-full"
            style={{ background: `radial-gradient(circle, ${config.secondary} 0%, transparent 70%)` }}
          />
        </AnimatePresence>
      </div>

      {/* Grain / Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
    </div>
  );
};

export default AtmosphereBackground;
