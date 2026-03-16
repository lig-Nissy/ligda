"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const TERMINAL_LINES = [
  { text: "$ sudo hack ligda-typing-game --force", delay: 0 },
  { text: "[sudo] password for hacker: ********", delay: 800 },
  { text: "Connecting to target server...", delay: 1500 },
  { text: "Injecting payload...", delay: 2200 },
  { text: "Bypassing firewall......", delay: 2800 },
  { text: "ACCESS GRANTED", delay: 3500 },
  { text: "", delay: 4000 },
  { text: "...just kidding.", delay: 4500 },
];

export default function NiceTryPage() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    TERMINAL_LINES.forEach((line, index) => {
      timers.push(
        setTimeout(() => {
          setVisibleLines(index + 1);
        }, line.delay)
      );
    });

    timers.push(
      setTimeout(() => {
        setGlitch(true);
        setTimeout(() => {
          setGlitch(false);
          setShowResult(true);
        }, 500);
      }, 5500)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  if (showResult) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
        <div className="flex flex-col items-center gap-8 max-w-lg text-center">
          <div className="text-8xl">🤡</div>
          <h1 className="text-4xl font-bold text-red-500">
            Nice try.
          </h1>
          <div className="space-y-4">
            <p className="text-xl text-zinc-300">
              インジェクション攻撃を検知しました
            </p>
            <p className="text-zinc-500">
              ここはタイピングゲームです。<br />
              ハッキングの練習場ではありません。
            </p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-left">
              <p className="text-green-400 font-mono text-sm">
                &gt; SELECT * FROM skills WHERE type = &apos;hacking&apos;
              </p>
              <p className="text-red-400 font-mono text-sm mt-1">
                ERROR: 0 rows returned. スキルが見つかりません。
              </p>
            </div>
            <p className="text-zinc-600 text-sm mt-4">
              おとなしくタイピングの練習をしましょう。
            </p>
          </div>
          <Link
            href="/"
            className="mt-4 py-3 px-8 rounded-full bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors"
          >
            反省してトップへ戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen items-center justify-center bg-black p-4 transition-all ${glitch ? "animate-pulse bg-red-950" : ""}`}>
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-lg p-6 font-mono">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-2 text-zinc-600 text-sm">terminal</span>
        </div>
        <div className="space-y-1">
          {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
            <p
              key={i}
              className={`text-sm ${
                line.text === "ACCESS GRANTED"
                  ? "text-green-400 font-bold text-lg"
                  : line.text === "...just kidding."
                    ? "text-red-400 font-bold"
                    : "text-green-500"
              }`}
            >
              {line.text || "\u00A0"}
            </p>
          ))}
          {!showResult && visibleLines < TERMINAL_LINES.length && (
            <span className="inline-block w-2 h-4 bg-green-500 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
