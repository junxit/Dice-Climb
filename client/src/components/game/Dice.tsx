import { motion, useAnimation } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DiceProps {
  value: number;
  rolling: boolean;
  onRollComplete?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Dice({ value, rolling, onRollComplete, size = "md", className }: DiceProps) {
  const controls = useAnimation();
  const [displayValue, setDisplayValue] = useState(value);

  const sizeClasses = {
    sm: "w-12 h-12 text-xl",
    md: "w-20 h-20 text-3xl",
    lg: "w-32 h-32 text-5xl",
  };

  useEffect(() => {
    if (rolling) {
      // Shake animation
      controls.start({
        rotate: [0, -15, 15, -15, 15, 0],
        x: [0, -5, 5, -5, 5, 0],
        y: [0, -5, 5, -5, 5, 0],
        transition: { duration: 0.5, repeat: Infinity }
      });

      // Randomize values while rolling
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 100);

      return () => clearInterval(interval);
    } else {
      // Stop rolling, show final value
      controls.stop();
      setDisplayValue(value);
      
      // Land animation
      controls.start({
        scale: [1.2, 1],
        rotate: [0, 360],
        transition: { type: "spring", stiffness: 300, damping: 15 }
      }).then(() => {
        if (onRollComplete) onRollComplete();
      });
    }
  }, [rolling, value, controls, onRollComplete]);

  const dots = {
    1: [[50, 50]],
    2: [[20, 20], [80, 80]],
    3: [[20, 20], [50, 50], [80, 80]],
    4: [[20, 20], [20, 80], [80, 20], [80, 80]],
    5: [[20, 20], [20, 80], [50, 50], [80, 20], [80, 80]],
    6: [[20, 20], [20, 50], [20, 80], [80, 20], [80, 50], [80, 80]]
  };

  const currentDots = dots[displayValue as keyof typeof dots] || dots[1];

  return (
    <motion.div
      animate={controls}
      className={cn(
        "bg-white rounded-2xl shadow-[0_8px_0_0_rgba(0,0,0,0.15)] border-2 border-slate-100 flex items-center justify-center relative overflow-hidden",
        sizeClasses[size],
        className
      )}
    >
      {currentDots.map((pos, i) => (
        <div
          key={i}
          className="absolute bg-slate-800 rounded-full w-[18%] h-[18%] shadow-inner"
          style={{ left: `${pos[0]}%`, top: `${pos[1]}%`, transform: 'translate(-50%, -50%)' }}
        />
      ))}
    </motion.div>
  );
}
