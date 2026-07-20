import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

let ffmpegInstance: FFmpeg | null = null;

/**
 * Returns the singleton FFmpeg instance in the browser environment.
 */
export function getFFmpeg(): FFmpeg {
  if (typeof window === "undefined") {
    throw new Error("FFmpeg can only be used in browser environment");
  }
  if (!ffmpegInstance) {
    ffmpegInstance = new FFmpeg();
  }
  return ffmpegInstance;
}

export interface FFmpegProgress {
  progress: number;
  time: number;
}

export interface FFmpegLog {
  type: string;
  message: string;
}

/**
 * Loads the FFmpeg WASM core library from unpkg CDN.
 */
export async function loadFFmpeg(
  onLog?: (log: FFmpegLog) => void,
  onProgress?: (progress: FFmpegProgress) => void
): Promise<FFmpeg> {
  const ffmpeg = getFFmpeg();

  if (onLog) {
    ffmpeg.on("log", onLog);
  }
  if (onProgress) {
    ffmpeg.on("progress", onProgress);
  }

  try {
    if (ffmpeg.loaded) {
      return ffmpeg;
    }

    // Load v0.12.6 core from unpkg CDN (umd version is compatible with web environments)
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });

    return ffmpeg;
  } finally {
    if (onLog) ffmpeg.off("log", onLog);
    if (onProgress) ffmpeg.off("progress", onProgress);
  }
}

/**
 * Helper to analyze an audio file's sample rate from FFmpeg logs.
 * We run an info command and listen to stderr output.
 */
export async function extractSampleRate(ffmpeg: FFmpeg, inputName: string): Promise<number> {
  let sampleRate = 44100; // Default fallback

  const logHandler = ({ message }: { message: string }) => {
    // Look for lines like: "Stream #0:0: Audio: mp3, 44100 Hz, stereo, fltp, 320 kb/s"
    const match = message.match(/Audio:.*?, (\d+)\s*Hz/i);
    if (match) {
      const rate = parseInt(match[1], 10);
      if (!isNaN(rate) && rate > 0) {
        sampleRate = rate;
      }
    }
  };

  ffmpeg.on("log", logHandler);

  try {
    // Running info command: ffmpeg -i filename
    // Note: This command exits with a failure exit code since no output is specified.
    // That is normal and expected for extracting metadata.
    await ffmpeg.exec(["-i", inputName]);
  } catch {
    // Expected error since no output is specified.
  } finally {
    ffmpeg.off("log", logHandler);
  }

  return sampleRate;
}

export interface ProcessOptions {
  file: File;
  semitones: number;
  outputFormat: "mp3" | "wav";
  onProgress?: (progress: number) => void;
  onLog?: (message: string) => void;
}

export interface ProcessResult {
  blob: Blob;
  url: string;
  sampleRate: number;
}

/**
 * Processes an uploaded file and shifts its pitch by the specified semitones.
 * Employs the formula: asetrate=SR*P,aresample=SR,atempo=1/P
 * Where P = 2^(semitones/12)
 */
export async function processPitchShift({
  file,
  semitones,
  outputFormat,
  onProgress,
  onLog,
}: ProcessOptions): Promise<ProcessResult> {
  const ffmpeg = getFFmpeg();

  // 1. Load FFmpeg core if not loaded
  if (!ffmpeg.loaded) {
    if (onLog) onLog("Downloading and compiling FFmpeg WebAssembly modules (~30MB)...");
    
    await loadFFmpeg(
      onLog ? (log) => onLog(log.message) : undefined,
      onProgress ? (prog) => onProgress(Math.round(prog.progress * 15)) : undefined // First 15% is initialization
    );
  }

  if (onLog) onLog("Writing source audio file to virtual filesystem...");
  
  // Use a unique name to avoid conflicts in consecutive runs
  const extension = file.name.split(".").pop() || "mp3";
  const inputName = `input_${Date.now()}.${extension}`;
  const outputName = `output_${Date.now()}.${outputFormat}`;

  const fileData = await fetchFile(file);
  await ffmpeg.writeFile(inputName, fileData);

  // 2. Check sample rate
  if (onLog) onLog("Analyzing audio sample rate...");
  const sampleRate = await extractSampleRate(ffmpeg, inputName);
  if (onLog) onLog(`Detected sample rate: ${sampleRate} Hz`);

  // 3. Compute pitch multiplier
  const p = Math.pow(2, semitones / 12);
  const targetSampleRate = Math.round(sampleRate * p);

  // 4. Set up the audio filter chain
  // If semitones === 0, we can use anull (no-op filter)
  const filterString = semitones === 0 
    ? "anull" 
    : `asetrate=${targetSampleRate},aresample=${sampleRate},atempo=${(1 / p).toFixed(6)}`;

  if (onLog) onLog(`Audio filter chain: ${filterString}`);

  // Setup callbacks during processing
  const progressHandler = ({ progress }: { progress: number }) => {
    if (onProgress) {
      // Map progress from [0, 1] to [15, 100]
      const currentProgress = 15 + Math.round(progress * 85);
      onProgress(Math.min(currentProgress, 100));
    }
  };
  ffmpeg.on("progress", progressHandler);

  const logHandler = ({ message }: { message: string }) => {
    if (onLog) onLog(message);
  };
  ffmpeg.on("log", logHandler);

  try {
    const args = ["-i", inputName, "-filter:a", filterString];

    if (outputFormat === "mp3") {
      args.push("-c:a", "libmp3lame", "-q:a", "2"); // Standard VBR Quality 2
    } else {
      args.push("-c:a", "pcm_s16le"); // Uncompressed 16-bit PCM WAV
    }

    args.push(outputName);

    if (onLog) onLog("Beginning processing. Please keep this tab active...");
    await ffmpeg.exec(args);

    if (onLog) onLog("Retrieving processed audio...");
    const data = await ffmpeg.readFile(outputName);

    const mimeType = outputFormat === "mp3" ? "audio/mp3" : "audio/wav";
    const blob = new Blob([data as unknown as BlobPart], { type: mimeType });
    const url = URL.createObjectURL(blob);

    // Clean up files in virtual fs to save browser memory
    try {
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch (fsError) {
      console.warn("Virtual FS clean up failed:", fsError);
    }

    if (onLog) onLog("Successfully completed audio processing!");
    return {
      blob,
      url,
      sampleRate,
    };
  } finally {
    ffmpeg.off("progress", progressHandler);
    ffmpeg.off("log", logHandler);
  }
}
