"use client";
import { useRef } from "react";

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  function ctx() {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    return ctxRef.current;
  }

  function tone(freq: number, type: OscillatorType, startAt: number, dur: number, vol = 0.3) {
    try {
      const c = ctx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, startAt);
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + dur);
      osc.start(startAt);
      osc.stop(startAt + dur + 0.01);
    } catch { /* ignore audio errors */ }
  }

  /** 正解：明るい上昇音 */
  function playCorrect() {
    const c = ctx();
    const t = c.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => tone(f, "sine", t + i * 0.09, 0.2, 0.25));
  }

  /** 不正解：低いブザー音 */
  function playWrong() {
    const c = ctx();
    tone(180, "sawtooth", c.currentTime, 0.4, 0.28);
  }

  /** クリア：ファンファーレ風 */
  function playClear() {
    const c = ctx();
    const t = c.currentTime;
    const melody = [523, 659, 784, 659, 784, 1047];
    melody.forEach((f, i) => tone(f, "sine", t + i * 0.13, 0.25, 0.32));
  }

  /** ボタンタップ：短いクリック音 */
  function playClick() {
    const c = ctx();
    tone(900, "square", c.currentTime, 0.05, 0.08);
  }

  return { playCorrect, playWrong, playClear, playClick };
}
