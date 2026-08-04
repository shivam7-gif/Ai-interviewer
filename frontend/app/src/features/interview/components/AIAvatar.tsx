import React, { useEffect, useState, useRef } from "react";

/* ── Animated rings around the avatar ─────────────────────────── */
const Ring: React.FC<{ size: number; delay: string; opacity: number }> = ({
  size,
  delay,
  opacity,
}) => (
  <div
    style={{
      position: "absolute",
      width: size,
      height: size,
      borderRadius: "50%",
      border: `1px solid rgba(250, 204, 21, ${opacity})`,
      animation: `avatarPulse 2.4s ease-in-out ${delay} infinite`,
    }}
  />
);

/* ── Waveform bars ─────────────────────────────────────────────── */
const WaveBar: React.FC<{ delay: string; height: string }> = ({ delay, height }) => (
  <div
    style={{
      width: 3,
      height,
      borderRadius: 99,
      background: "rgba(250, 204, 21, 0.8)",
      animation: `waveAnim 1s ease-in-out ${delay} infinite alternate`,
    }}
  />
);

interface AIAvatarProps {
  speaking?: boolean;
}

export const AIAvatar: React.FC<AIAvatarProps> = ({ speaking = false }) => {
  const [tick, setTick] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setTick((t) => t + 1), 100);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="ai-avatar-container">
    </div>
  );
};
