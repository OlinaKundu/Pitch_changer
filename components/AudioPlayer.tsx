"use client";

import React from "react";
import { Play, Pause, Volume2, VolumeX, Volume1 } from "lucide-react";
import { formatTime } from "@/lib/audio";
import { AudioPlayerController } from "@/hooks/useAudioPlayer";

interface AudioPlayerProps {
  controller: AudioPlayerController;
  title?: string;
  isActive?: boolean;
}

export default function AudioPlayer({ controller, title, isActive = true }: AudioPlayerProps) {
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
  } = controller;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const renderVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="w-4 h-4" />;
    if (volume < 0.4) return <Volume1 className="w-4 h-4" />;
    return <Volume2 className="w-4 h-4" />;
  };

  return (
    <div
      className={`w-full p-5 rounded-2xl border transition-all duration-300 ${
        isActive
          ? "border-slate-800 bg-slate-950/30 backdrop-blur-md shadow-lg"
          : "border-slate-900 bg-slate-950/10 opacity-60 hover:opacity-85"
      }`}
    >
      {title && (
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3 text-left">
          {title}
        </span>
      )}

      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          disabled={!duration}
          className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all ${
            isActive && duration
              ? "bg-seagreen-600 hover:bg-seagreen-500 text-white shadow-md shadow-seagreen-500/20 hover:scale-105"
              : "bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed"
          }`}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Seek Bar and Times */}
        <div className="flex-grow w-full flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 min-w-[40px] text-right">
            {formatTime(currentTime)}
          </span>

          <div className="relative flex-grow h-6 flex items-center">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeekChange}
              disabled={!duration}
              className="w-full h-1.5 rounded-lg bg-slate-900 border border-slate-950 accent-seagreen-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none appearance-none"
              style={{
                background: `linear-gradient(to right, #2e8b57 0%, #2e8b57 ${
                  duration ? (currentTime / duration) * 100 : 0
                }%, #0f172a ${
                  duration ? (currentTime / duration) * 100 : 0
                }%, #0f172a 100%)`
              }}
            />
            <style jsx>{`
              input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #ffffff;
                border: 1.5px solid #2e8b57;
                cursor: pointer;
                transition: transform 0.1s ease;
              }
              input[type="range"]::-webkit-slider-thumb:hover {
                transform: scale(1.2);
              }
              input[type="range"]::-moz-range-thumb {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #ffffff;
                border: 1.5px solid #2e8b57;
                cursor: pointer;
                transition: transform 0.1s ease;
              }
              input[type="range"]::-moz-range-thumb:hover {
                transform: scale(1.2);
              }
            `}</style>
          </div>

          <span className="text-xs font-mono text-slate-400 min-w-[40px] text-left">
            {formatTime(duration)}
          </span>
        </div>

        {/* Volume Control */}
        <div className="flex-shrink-0 flex items-center gap-2 min-w-[110px] w-full md:w-auto justify-end">
          <button
            onClick={toggleMute}
            disabled={!duration}
            className="text-slate-400 hover:text-white hover:bg-slate-900 p-1.5 rounded-lg transition-colors disabled:opacity-50"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {renderVolumeIcon()}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            disabled={!duration}
            className="w-16 md:w-20 h-1 rounded bg-slate-900 accent-seagreen-500 cursor-pointer disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}
