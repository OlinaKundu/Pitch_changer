import { useState, useEffect, useRef, useCallback } from "react";
import { Jungle } from "@/lib/jungle";

export interface UseAudioPlayerProps {
  url: string | null;
  pitch?: number; // Pitch in semitones (default 0)
  onEnded?: () => void;
}

export interface AudioPlayerController {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
}

let globalAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!globalAudioContext) {
    const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      globalAudioContext = new AudioContextClass();
    }
  }
  return globalAudioContext;
}

/**
 * A custom hook to manage HTML5 Audio state reactively and route it through a real-time pitch shifter.
 */
export function useAudioPlayer({ url, pitch = 0, onEnded }: UseAudioPlayerProps): AudioPlayerController {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const jungleRef = useRef<Jungle | null>(null);

  const volumeRef = useRef(volume);
  const isMutedRef = useRef(isMuted);
  const onEndedRef = useRef(onEnded);
  const pitchRef = useRef(pitch);

  useEffect(() => {
    volumeRef.current = volume;
    isMutedRef.current = isMuted;
    onEndedRef.current = onEnded;
    pitchRef.current = pitch;
  }, [volume, isMuted, onEnded, pitch]);

  // Sync pitch to jungle shifter
  useEffect(() => {
    if (jungleRef.current) {
      jungleRef.current.setPitchOffset(pitch / 12);
    }
  }, [pitch]);

  // Synchronize player with URL updates
  useEffect(() => {
    if (!url) {
      const timeoutId = setTimeout(() => {
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
      }, 0);
      audioRef.current = null;
      return () => clearTimeout(timeoutId);
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    audio.volume = isMutedRef.current ? 0 : volumeRef.current;

    const ctx = getAudioContext();
    let jungle: Jungle | null = null;
    let source: MediaElementAudioSourceNode | null = null;

    if (ctx) {
      try {
        jungle = new Jungle(ctx);
        jungleRef.current = jungle;
        jungle.setPitchOffset(pitchRef.current / 12);

        source = ctx.createMediaElementSource(audio);
        sourceRef.current = source;

        source.connect(jungle.input);
        jungle.output.connect(ctx.destination);
      } catch (err) {
        console.warn("Failed to connect Web Audio nodes, falling back to direct play:", err);
      }
    }

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (onEndedRef.current) {
        onEndedRef.current();
      }
    };

    // Attach event listeners
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);

    if (audio.readyState >= 1) {
      const durationTimeout = setTimeout(() => {
        setDuration(audio.duration || 0);
      }, 0);
      return () => {
        audio.pause();
        audio.removeEventListener("play", handlePlay);
        audio.removeEventListener("pause", handlePause);
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("durationchange", handleDurationChange);
        audio.removeEventListener("ended", handleEnded);
        if (jungle) jungle.disconnect();
        if (source) source.disconnect();
        jungleRef.current = null;
        sourceRef.current = null;
        audioRef.current = null;
        clearTimeout(durationTimeout);
      };
    }

    return () => {
      audio.pause();
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      if (jungle) jungle.disconnect();
      if (source) source.disconnect();
      jungleRef.current = null;
      sourceRef.current = null;
      audioRef.current = null;
    };
  }, [url]);

  // Sync volume & mute settings to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const play = useCallback(() => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume();
    }
    audioRef.current?.play().catch((err) => {
      console.warn("Audio playback failed to start:", err);
    });
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      const boundTime = Math.max(0, Math.min(audioRef.current.duration || 0, time));
      audioRef.current.currentTime = boundTime;
      setCurrentTime(boundTime);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    const boundVol = Math.max(0, Math.min(1, vol));
    setVolumeState(boundVol);
    if (boundVol > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
  };
}
