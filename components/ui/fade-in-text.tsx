"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FadeInTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function FadeInText({ text, className, delay = 0 }: FadeInTextProps) {
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: delay }
    })
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    },
    hidden: {
      opacity: 0,
      y: 10,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    }
  };

  return (
    <motion.div
      className={cn("flex flex-wrap justify-center gap-x-2 gap-y-1", className)}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {words.map((word, index) => (
        <motion.span
          variants={child as any}
          key={index}
          className="inline-block"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}

interface AnimatedTextProps {
  words: { text: string; className?: string }[];
  className?: string;
}

export function AnimatedText({ words, className }: AnimatedTextProps) {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200
      }
    },
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.8,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200
      }
    }
  };

  return (
    <motion.div
      className={cn("flex flex-wrap justify-center gap-x-3 gap-y-2 text-center", className)}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {words.map((word, index) => (
        <motion.span
          variants={child as any}
          key={index}
          className={cn(
            "inline-block text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold",
            word.className
          )}
        >
          {word.text}
        </motion.span>
      ))}
    </motion.div>
  );
}
