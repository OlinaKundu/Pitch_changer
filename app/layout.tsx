import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pitch Changer — Change Audio Pitch Online Client-Side",
  description:
    "Adjust the pitch of your MP3, WAV, FLAC, OGG, M4A, or AAC audio files in real-time. Runs 100% locally in your browser using FFmpeg WebAssembly.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#060608] text-slate-100 selection:bg-seagreen-500/30 selection:text-seagreen-200">
        {children}
      </body>
    </html>
  );
}
