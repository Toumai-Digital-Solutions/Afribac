"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const FloatingParticles = ({ className }: { className?: string }) => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/10 dark:bg-primary/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.1, 0.8, 0.1],
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

export const GeometricShapes = ({ className }: { className?: string }) => {
  const shapes = [
    {
      id: 1,
      shape: "circle",
      size: 60,
      x: 10,
      y: 20,
      color: "bg-blue-500/5",
      duration: 20,
    },
    {
      id: 2,
      shape: "square",
      size: 40,
      x: 80,
      y: 30,
      color: "bg-purple-500/5",
      duration: 25,
    },
    {
      id: 3,
      shape: "triangle",
      size: 50,
      x: 15,
      y: 70,
      color: "bg-orange-500/5",
      duration: 18,
    },
    {
      id: 4,
      shape: "circle",
      size: 80,
      x: 70,
      y: 80,
      color: "bg-green-500/5",
      duration: 22,
    },
    {
      id: 5,
      shape: "square",
      size: 30,
      x: 50,
      y: 10,
      color: "bg-pink-500/5",
      duration: 28,
    },
  ];

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className={cn(
            shape.color,
            "absolute",
            shape.shape === "circle" && "rounded-full",
            shape.shape === "square" && "rounded-lg",
            shape.shape === "triangle" && "rounded-sm"
          )}
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: shape.size,
            height: shape.size,
          }}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export const MovingGradientBackground = ({ className }: { className?: string }) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%)
          `,
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
};

export const FloatingIcons = ({ className }: { className?: string }) => {
  const icons = [
    { id: 1, icon: "📚", x: 15, y: 25, size: "text-3xl", duration: 15 },
    { id: 2, icon: "🎓", x: 75, y: 15, size: "text-2xl", duration: 18 },
    { id: 3, icon: "✏️", x: 20, y: 75, size: "text-xl", duration: 12 },
    { id: 4, icon: "📝", x: 85, y: 65, size: "text-2xl", duration: 20 },
    { id: 5, icon: "🏆", x: 50, y: 85, size: "text-3xl", duration: 16 },
    { id: 6, icon: "⭐", x: 10, y: 50, size: "text-xl", duration: 14 },
    { id: 7, icon: "📊", x: 90, y: 40, size: "text-2xl", duration: 22 },
    { id: 8, icon: "🎯", x: 60, y: 20, size: "text-xl", duration: 19 },
  ];

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {icons.map((item) => (
        <motion.div
          key={item.id}
          className={cn(
            "absolute opacity-20 hover:opacity-40 transition-opacity",
            item.size
          )}
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {item.icon}
        </motion.div>
      ))}
    </div>
  );
};

export const WaveAnimation = ({ className }: { className?: string }) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              90deg,
              transparent,
              rgba(59, 130, 246, 0.05),
              transparent
            )
          `,
        }}
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              45deg,
              transparent,
              rgba(168, 85, 247, 0.03),
              transparent
            )
          `,
        }}
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
          delay: 2,
        }}
      />
    </div>
  );
};

export const GridPattern = ({ className }: { className?: string }) => {
  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
        animate={{
          backgroundPosition: ["0px 0px", "50px 50px", "0px 0px"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
};
