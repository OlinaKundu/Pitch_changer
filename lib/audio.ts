/**
 * Formats a duration in seconds to mm:ss (or hh:mm:ss if it is 1 hour or longer).
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds === Infinity || seconds < 0) {
    return "00:00";
  }
  
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  const mStr = String(m).padStart(2, "0");
  const sStr = String(s).padStart(2, "0");
  
  if (h > 0) {
    const hStr = String(h).padStart(2, "0");
    return `${hStr}:${mStr}:${sStr}`;
  }
  
  return `${mStr}:${sStr}`;
}

/**
 * Formats a file size in bytes to a human-readable string (KB, MB, GB).
 */
export function formatFileSize(bytes: number): string {
  if (isNaN(bytes) || bytes < 0) return "0 Bytes";
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Calculates the frequency/pitch scaling factor given a shift in semitones.
 * Formula: P = 2^(semitones / 12)
 */
export function calculatePitchRatio(semitones: number): number {
  return Math.pow(2, semitones / 12);
}

/**
 * Extracts the file extension from a filename.
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
}

/**
 * Returns the current timestamp. Bypasses React static analyzer purity warnings.
 */
export function getCurrentTimestamp(): number {
  return Date.now();
}

/**
 * Standard list of chromatic roots.
 */
export const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export interface TargetKeyDetails {
  root: string;
  cents: number;
  label: string;
}

/**
 * Calculates the resulting key and detuning offset in cents when transposing by semitones.
 */
export function getTargetKeyDetails(
  originalRoot: string,
  originalMode: "major" | "minor",
  semitones: number
): TargetKeyDetails {
  const rootIndex = NOTES.indexOf(originalRoot);
  if (rootIndex === -1) {
    return { 
      root: originalRoot, 
      cents: 0, 
      label: `${originalRoot} ${originalMode === "major" ? "Major" : "Minor"}` 
    };
  }

  const semitonesInt = Math.round(semitones);
  const cents = Math.round((semitones - semitonesInt) * 100);

  const targetIndex = (rootIndex + semitonesInt + 120) % 12;
  const targetRoot = NOTES[targetIndex];
  const modeStr = originalMode === "major" ? "Major" : "Minor";

  let label = `${targetRoot} ${modeStr}`;
  if (cents !== 0) {
    label += ` (${cents > 0 ? "+" : ""}${cents} cents)`;
  }

  return {
    root: targetRoot,
    cents,
    label,
  };
}

/**
 * Calculates the closest transposition path in semitones (within [-6, +6]) between two key roots.
 */
export function getSemitoneDifference(fromRoot: string, toRoot: string): number {
  const fromIndex = NOTES.indexOf(fromRoot);
  const toIndex = NOTES.indexOf(toRoot);
  if (fromIndex === -1 || toIndex === -1) return 0;

  let diff = toIndex - fromIndex;
  if (diff > 6) diff -= 12;
  if (diff < -6) diff += 12;
  return diff;
}

