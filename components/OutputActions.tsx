"use client";

import React from "react";
import { Download, RefreshCw, Trash2, Loader2 } from "lucide-react";

interface OutputActionsProps {
  onDownloadMp3: () => void;
  onDownloadWav: () => void;
  onReprocess: () => void;
  onReset: () => void;
  isConvertingMp3: boolean;
  isConvertingWav: boolean;
  disabled: boolean;
}

export default function OutputActions({
  onDownloadMp3,
  onDownloadWav,
  onReprocess,
  onReset,
  isConvertingMp3,
  isConvertingWav,
  disabled,
}: OutputActionsProps) {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 items-center justify-center p-2">
      {/* Download MP3 */}
      <button
        onClick={onDownloadMp3}
        disabled={disabled || isConvertingMp3 || isConvertingWav}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-seagreen-600 hover:bg-seagreen-500 text-white font-medium text-sm transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-md shadow-seagreen-500/10"
      >
        {isConvertingMp3 ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Converting to MP3...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Download MP3
          </>
        )}
      </button>

      {/* Download WAV */}
      <button
        onClick={onDownloadWav}
        disabled={disabled || isConvertingMp3 || isConvertingWav}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-medium text-sm transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
      >
        {isConvertingWav ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Converting to WAV...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Download WAV
          </>
        )}
      </button>

      {/* Spacer for mobile */}
      <div className="w-full h-px sm:w-px sm:h-6 bg-slate-800 my-1 sm:my-0" />

      {/* Reprocess */}
      <button
        onClick={onReprocess}
        disabled={disabled || isConvertingMp3 || isConvertingWav}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-950/40 border border-slate-900 hover:border-slate-800 hover:bg-slate-900/40 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className="w-4 h-4" />
        Reprocess
      </button>

      {/* Reset */}
      <button
        onClick={onReset}
        disabled={disabled || isConvertingMp3 || isConvertingWav}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-950/10 border border-red-950/20 hover:border-red-900/30 hover:bg-red-950/20 text-red-400 hover:text-red-300 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Trash2 className="w-4 h-4" />
        Reset
      </button>
    </div>
  );
}
