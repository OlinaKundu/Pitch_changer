# Client-Side Audio Pitch Changer

A modern, fast, and responsive client-side web application built in **Next.js (App Router)** that allows users to change the pitch of uploaded audio files entirely in the browser using FFmpeg WebAssembly (`@ffmpeg/ffmpeg`) and the Web Audio API.

## Live Demo 

- **Live Deployment (Vercel)**: [pitch-changer.vercel.app](https://pitch-changer.vercel.app/)

---

## Features

- **100% Client-Side Processing**: No servers or backends. Your audio data stays entirely inside your browser context.
- **Premium Sea-Green Workstation UI**: A responsive, full-page dashboard layout styled with a dark sea-depth background grid, custom glassmorphism cards, and floating ambient glow animations.
- **Intro & Workspace States**: Restructures fluidly. Landing state shows feature decks and uploader; loading a file unlocks a 2-column workspace putting uploader & pitch tools on the left and visual playback & export control consoles on the right.
- **Drag-and-Drop Uploader**: Easily drag files or use the file picker. Supports MP3, WAV, FLAC, OGG, M4A, and AAC up to 200 MB.
- **Pitch Presets and Sliders**: Shift pitch by -12 to +12 semitones in steps of 0.5. Or use quick buttons (-12, -7, -5, 0, +5, +7, +12) with real-time target key signatures estimation.
- **Synchronized Player A/B Comparison**: Instantly switch between the original and processed audio while keeping playback positions perfectly synchronized.
- **Format Caching & Multi-Download**: Shift once, then download in either MP3 (VBR quality 2) or WAV (16-bit lossless PCM) formats. MP3 conversion happens on-demand in the browser in under 1 second.

---

## Tech Stack

- **Framework**: [Next.js (App Router, v16)](https://nextjs.org/)
- **UI Logic**: [React 19](https://react.dev/) / [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS (v4)](https://tailwindcss.com/) with a custom Sea Green theme
- **Audio Processing**: [FFmpeg WASM Core (v0.12)](https://github.com/ffmpegwasm/ffmpeg.wasm)
- **Playback Control**: Custom Web Audio state triggers mapping HTML5 Audio elements
- **Icons**: [Lucide React](https://lucide.dev/)

---

## Pitch-Shifting DSP Implementation

To shift the pitch of the audio without changing its duration (preventing the chipmunk speed-up/slow-down effect), we employ a chained filter sequence in FFmpeg:
`asetrate=SR*P,aresample=SR,atempo=1/P`

Where:
- `SR` is the original sample rate of the input file (detected dynamically from FFmpeg streams).
- `P = 2^(semitones / 12)` is the calculated pitch multiplier frequency factor.

1. **`asetrate=SR*P`** scales the sample rate, raising or lowering the pitch but also speeding up/slowing down the track.
2. **`aresample=SR`** resamples the audio stream back to the original sample rate.
3. **`atempo=1/P`** stretches or compresses the audio speed by the exact inverse of the pitch change, returning the track to its original duration while retaining the shifted pitch.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## Deploying on Vercel

FFmpeg WASM utilizes `SharedArrayBuffer` for threading and memory layout. Modern browsers require strict security headers for sites using `SharedArrayBuffer` to mitigate Spectre/Meltdown vulnerabilities.

We have included configurations for both development and production headers:
1. **Local Development**: Configured via headers in `next.config.ts`.
2. **Vercel Production**: Configured via headers in `vercel.json` at the root directory.

The headers configured are:
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

Ensure `vercel.json` is included in your deployment repository.
