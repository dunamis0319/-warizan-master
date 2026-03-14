"use client";
import { useEffect, useRef, useState } from "react";

const COLORS = ["#FF6B6B","#4ECDC4","#FFE66D","#A855F7","#3B82F6","#10B981","#F97316","#EC4899"];
const EMOJIS = ["⭐","✨","🎉","🌟","💫","🎊"];
let uid = 0;

type Part = {
  id: number; x: number; y: number;
  tx: number; ty: number; dur: number;
  color?: string; emoji?: string; size?: number;
};

export default function Fireworks({ trigger }: { trigger: number }) {
  const [parts, setParts] = useState<Part[]>([]);
  const prev = useRef(0);

  useEffect(() => {
    if (trigger === prev.current || trigger === 0) return;
    prev.current = trigger;

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.38;
    const batch: Part[] = [];

    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 70 + Math.random() * 120;
      batch.push({
        id: uid++,
        x: cx + (Math.random() - 0.5) * 80,
        y: cy,
        tx: Math.cos(angle) * dist,
        ty: -(50 + Math.random() * 100),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 9 + Math.random() * 8,
        dur: 0.6 + Math.random() * 0.5,
      });
    }
    for (let i = 0; i < 5; i++) {
      batch.push({
        id: uid++,
        x: 10 + Math.random() * 80,
        y: 15 + Math.random() * 50,
        tx: (Math.random() - 0.5) * 90,
        ty: -(70 + Math.random() * 80),
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        dur: 0.9 + Math.random() * 0.4,
      });
    }

    const ids = new Set(batch.map(p => p.id));
    setParts(p => [...p, ...batch]);
    setTimeout(() => setParts(p => p.filter(x => !ids.has(x.id))),
      Math.max(...batch.map(p => p.dur)) * 1000 + 300);
  }, [trigger]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {parts.map(p => p.emoji ? (
        <span key={p.id} className="absolute text-3xl animate-particle" style={{
          left: `${p.x}vw`, top: `${p.y}vh`,
          "--tx": `${p.tx}px`, "--ty": `${p.ty}px`, "--dur": `${p.dur}s`,
        } as React.CSSProperties}>{p.emoji}</span>
      ) : (
        <div key={p.id} className="absolute rounded-full animate-particle" style={{
          left: p.x, top: p.y,
          width: p.size, height: p.size,
          background: p.color,
          "--tx": `${p.tx}px`, "--ty": `${p.ty}px`, "--dur": `${p.dur}s`,
        } as React.CSSProperties} />
      ))}
    </div>
  );
}
