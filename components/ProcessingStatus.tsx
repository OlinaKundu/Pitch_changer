"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface ProcessingStatusProps {
  progress: number; // 0 to 100
  statusMessage: string;
  isProcessing: boolean;
}

export default function ProcessingStatus({
  progress,
  statusMessage,
  isProcessing,
}: ProcessingStatusProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [estimatedRemaining, setEstimatedRemaining] = useState<number | null>(null);

  const progressRef = React.useRef(progress);

  // Keep progress ref updated
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Timer for elapsed seconds and estimated remaining time
  useEffect(() => {
    const startTime = Date.now();
    
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(elapsed);
      
      const currentProgress = progressRef.current;
      // Calculate remaining time based on current progress
      // Wait at least 2 seconds and 5% progress to avoid unstable estimation
      if (currentProgress > 5 && elapsed > 2) {
        const totalEstimated = (elapsed / currentProgress) * 100;
        const remaining = Math.max(0, Math.round(totalEstimated - elapsed));
        setEstimatedRemaining(remaining);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  if (!isProcessing) return null;

  const formatRemaining = (sec: number | null) => {
    if (sec === null) return "Estimating...";
    if (sec === 0) return "Finishing...";
    if (sec < 60) return `${sec}s remaining`;
    
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}m ${secs}s remaining`;
  };

  return (
    <div className="w-full p-6 rounded-2xl border border-seagreen-900/30 bg-seagreen-950/5 backdrop-blur-md shadow-xl text-left animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Loader2 className="w-4 h-4 text-seagreen-400 animate-spin" />
          <span className="text-xs font-semibold text-seagreen-300 uppercase tracking-wider">
            Audio Processing
          </span>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          <span>{formatRemaining(estimatedRemaining)}</span>
          <span className="mx-2">•</span>
          <span>Elapsed: {elapsedSeconds}s</span>
        </div>
      </div>

      <p className="text-sm font-medium text-slate-300 mb-4 truncate" title={statusMessage}>
        {statusMessage}
      </p>

      {/* Progress Bar Container */}
      <div className="w-full bg-slate-950/80 border border-slate-900 h-3 rounded-full overflow-hidden relative">
        <div
          className="bg-gradient-to-r from-seagreen-600 to-seagreen-400 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-slate-500 font-medium">
          Processing entirely in browser
        </span>
        <span className="text-sm font-bold text-seagreen-300 font-mono">
          {progress}%
        </span>
      </div>
    </div>
  );
}
