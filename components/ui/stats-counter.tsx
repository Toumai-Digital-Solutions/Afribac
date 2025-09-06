"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface StatsCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

export function StatsCounter({ end, duration = 2, suffix = "", prefix = "" }: StatsCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
      const increment = end / (duration * 60); // 60fps
      const timer = setInterval(() => {
        setCount(prev => {
          const next = prev + increment;
          if (next >= end) {
            clearInterval(timer);
            return end;
          }
          return next;
        });
      }, 1000 / 60);

      return () => clearInterval(timer);
    }
  }, [isInView, end, duration, hasAnimated]);

  return (
    <span ref={ref} className="font-bold">
      {prefix}{Math.floor(count)}{suffix}
    </span>
  );
}
