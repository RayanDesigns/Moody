"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

const PHASES: { name: string; duration: number }[] = [
  { name: "Breathe In", duration: 4000 },
  { name: "Hold", duration: 4000 },
  { name: "Breathe Out", duration: 6000 },
  { name: "Hold", duration: 2000 },
];

const TOTAL_CYCLE = PHASES.reduce((sum, p) => sum + p.duration, 0);

export function BreathingExercise() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [cycles, setCycles] = useState(0);

  const cycleElapsed = elapsed % TOTAL_CYCLE;
  let accumulated = 0;
  let currentPhase = PHASES[0];
  let phaseProgress = 0;

  for (const phase of PHASES) {
    if (cycleElapsed < accumulated + phase.duration) {
      currentPhase = phase;
      phaseProgress = (cycleElapsed - accumulated) / phase.duration;
      break;
    }
    accumulated += phase.duration;
  }

  const scale =
    currentPhase.name === "Breathe In"
      ? 1 + phaseProgress * 0.5
      : currentPhase.name === "Breathe Out"
        ? 1.5 - phaseProgress * 0.5
        : currentPhase.name === "Hold" && accumulated > 0 && accumulated < TOTAL_CYCLE / 2
          ? 1.5
          : 1;

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 50;
        if (Math.floor(next / TOTAL_CYCLE) > Math.floor(prev / TOTAL_CYCLE)) {
          setCycles((c) => c + 1);
        }
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isRunning]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setElapsed(0);
    setCycles(0);
  }, []);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative flex h-64 w-64 items-center justify-center">
        <motion.div
          className="absolute rounded-full bg-primary/10"
          animate={{ scale, width: 200, height: 200 }}
          transition={{ duration: 0.05, ease: "linear" }}
        />
        <motion.div
          className="absolute rounded-full bg-primary/20"
          animate={{ scale: scale * 0.85, width: 160, height: 160 }}
          transition={{ duration: 0.05, ease: "linear" }}
        />
        <motion.div
          className="absolute rounded-full bg-primary/30"
          animate={{ scale: scale * 0.7, width: 120, height: 120 }}
          transition={{ duration: 0.05, ease: "linear" }}
        />
        <div className="relative z-10 text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentPhase.name + accumulated}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-lg font-semibold text-primary"
            >
              {isRunning ? currentPhase.name : "Ready"}
            </motion.p>
          </AnimatePresence>
          {isRunning && (
            <p className="text-xs text-muted-foreground mt-1">
              Cycle {cycles + 1}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={reset}
          disabled={elapsed === 0}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          size="lg"
          onClick={() => setIsRunning(!isRunning)}
          className="px-8"
        >
          {isRunning ? (
            <Pause className="mr-2 h-4 w-4" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          {isRunning ? "Pause" : "Start"}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground text-center max-w-xs">
        4-4-6-2 box breathing. Breathe in through your nose, hold, slowly exhale
        through your mouth, then hold briefly before the next cycle.
      </p>
    </div>
  );
}
