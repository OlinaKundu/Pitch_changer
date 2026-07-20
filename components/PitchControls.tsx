"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { NOTES } from "@/lib/audio";

interface PitchControlsProps {
  value: number; // semitones
  onChange: (val: number) => void;
  disabled: boolean;
}

const QUICK_PRESETS = [-12, -7, -5, 0, 5, 7, 12];

export default function PitchControls({ value, onChange, disabled }: PitchControlsProps) {
  // Calculate resulting key root assuming original is C
  const getTargetKeyLabel = (semitones: number) => {
    const originalRoot = "C";
    const rootIndex = NOTES.indexOf(originalRoot);
    const semitonesInt = Math.round(semitones);
    const cents = Math.round((semitones - semitonesInt) * 100);
    const targetIndex = (rootIndex + semitonesInt + 120) % 12;
    const targetRoot = NOTES[targetIndex];

    if (cents === 0) {
      return `Key: ${targetRoot}`;
    } else {
      return `Key: ${targetRoot} (${cents > 0 ? "+" : ""}${cents}¢)`;
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  const formatSemitones = (val: number) => {
    if (val === 0) return "0 semitones";
    return `${val > 0 ? "+" : ""}${val} semitones`;
  };

  return (
    <div className="w-full p-6 rounded-2xl border border-slate-800 bg-slate-950/20 backdrop-blur-md shadow-lg text-left">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pitch Changer
          </h2>
          <p className="text-xl font-bold text-slate-200 mt-1">
            {formatSemitones(value)} <span className="text-seagreen-400 font-medium text-sm ml-2">{getTargetKeyLabel(value)}</span>
          </p>
        </div>
        
        {value !== 0 && (
          <button
            onClick={() => onChange(0)}
            disabled={disabled}
            className="flex items-center gap-1.5 text-xs text-seagreen-400 hover:text-seagreen-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Reset to original pitch"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
            Reset
          </button>
        )}
      </div>

      {/* Slider */}
      <div className="relative mb-6">
        <input
          type="range"
          min="-12"
          max="12"
          step="0.5"
          value={value}
          onChange={handleSliderChange}
          disabled={disabled}
          className="w-full h-2 rounded-lg bg-slate-900 border border-slate-800 accent-seagreen-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-seagreen-500/50 appearance-none"
          style={{
            background: `linear-gradient(to right, #1b5937 0%, #2e8b57 ${((value + 12) / 24) * 100}%, #0f172a ${((value + 12) / 24) * 100}%, #0f172a 100%)`
          }}
        />
        <style jsx>{`
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #ffffff;
            border: 2px solid #2e8b57;
            box-shadow: 0 0 10px rgba(46, 139, 87, 0.5);
            cursor: pointer;
            transition: all 0.15s ease;
          }
          input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.15);
            box-shadow: 0 0 14px rgba(46, 139, 87, 0.8);
          }
          input[type="range"]::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #ffffff;
            border: 2px solid #2e8b57;
            box-shadow: 0 0 10px rgba(46, 139, 87, 0.5);
            cursor: pointer;
            transition: all 0.15s ease;
          }
          input[type="range"]::-moz-range-thumb:hover {
            transform: scale(1.15);
            box-shadow: 0 0 14px rgba(46, 139, 87, 0.8);
          }
        `}</style>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2 justify-between items-center border-t border-slate-900/60 pt-4">
        <span className="text-xs text-slate-500 font-medium">
          Quick Snap
        </span>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PRESETS.map((preset) => {
            const isSelected = value === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => onChange(preset)}
                disabled={disabled}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-mono transition-all ${
                  isSelected
                    ? "bg-seagreen-600/20 border-seagreen-500 text-seagreen-300 shadow-md shadow-seagreen-500/5"
                    : "bg-slate-950/40 border-slate-900 text-slate-500 hover:border-slate-800 hover:text-slate-350"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {preset === 0 ? "0" : preset > 0 ? `+${preset}` : preset}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
