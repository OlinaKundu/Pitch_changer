"use client";

import React, { useRef, useState } from "react";
import { Upload, FileAudio, AlertCircle } from "lucide-react";
import { formatFileSize, formatTime, getFileExtension } from "@/lib/audio";

interface AudioUploaderProps {
  onFileSelect: (file: File, duration: number) => void;
  selectedFile: File | null;
  duration: number | null;
  onReset: () => void;
}

const ACCEPTED_EXTENSIONS = ["mp3", "wav", "flac", "ogg", "m4a", "aac"];
const ACCEPTED_MIME_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/flac",
  "audio/x-flac",
  "audio/ogg",
  "audio/x-m4a",
  "audio/m4a",
  "audio/aac",
  "audio/x-aac",
];

export default function AudioUploader({
  onFileSelect,
  selectedFile,
  duration,
  onReset,
}: AudioUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFile = (file: File) => {
    setError(null);
    const ext = getFileExtension(file.name);
    const isExtensionValid = ACCEPTED_EXTENSIONS.includes(ext);
    const isMimeValid = ACCEPTED_MIME_TYPES.includes(file.type);

    if (!isExtensionValid && !isMimeValid) {
      setError(`Unsupported file format. Please upload: ${ACCEPTED_EXTENSIONS.join(", ").toUpperCase()}`);
      return;
    }

    if (file.size > 200 * 1024 * 1024) {
      setError("File is too large. Maximum size is 200 MB to prevent browser memory issues.");
      return;
    }

    // Determine duration client-side
    const objectUrl = URL.createObjectURL(file);
    const tempAudio = new Audio(objectUrl);
    
    tempAudio.addEventListener("loadedmetadata", () => {
      onFileSelect(file, tempAudio.duration);
      URL.revokeObjectURL(objectUrl);
    });

    tempAudio.addEventListener("error", () => {
      setError("Failed to read audio metadata. The file might be corrupted.");
      URL.revokeObjectURL(objectUrl);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`relative group cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 min-h-[220px] text-center transition-all duration-300 backdrop-blur-md ${
            isDragActive
              ? "border-seagreen-500 bg-seagreen-950/20 shadow-[0_0_20px_rgba(46,139,87,0.15)]"
              : "border-slate-800 bg-slate-950/20 hover:border-slate-700 hover:bg-slate-900/10"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".mp3,.wav,.flac,.ogg,.m4a,.aac,audio/*"
            onChange={handleChange}
          />
          
          <div className="p-4 rounded-full bg-slate-950/50 border border-slate-800 text-slate-400 group-hover:text-seagreen-400 group-hover:border-seagreen-500/30 group-hover:scale-110 transition-all duration-300 mb-4">
            <Upload className="w-6 h-6" />
          </div>

          <p className="text-slate-200 font-medium mb-1 group-hover:text-white transition-colors">
            Drag and drop your audio file here, or <span className="text-seagreen-400 font-semibold group-hover:underline">browse</span>
          </p>
          <p className="text-xs text-slate-500 max-w-sm mb-4">
            Supports MP3, WAV, FLAC, OGG, M4A, AAC up to 200 MB
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-950/30 border border-red-500/20 text-red-400 rounded-xl text-xs max-w-md animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-5 border border-slate-800/80 bg-slate-950/40 rounded-2xl flex items-center justify-between gap-4 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-3 bg-seagreen-950/30 border border-seagreen-500/20 rounded-xl text-seagreen-400 flex-shrink-0">
              <FileAudio className="w-6 h-6" />
            </div>
            <div className="overflow-hidden text-left">
              <h3 className="text-sm font-semibold text-slate-200 truncate pr-4">
                {selectedFile.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>{formatFileSize(selectedFile.size)}</span>
                <span>•</span>
                <span>{duration ? formatTime(duration) : "Reading..."}</span>
                <span>•</span>
                <span className="uppercase">{getFileExtension(selectedFile.name)}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onReset}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-900/50 transition-all font-medium"
          >
            Change File
          </button>
        </div>
      )}
    </div>
  );
}
