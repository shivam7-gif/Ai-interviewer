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
      {/* Glow behind */}
      <div className="ai-avatar-glow" />

      {/* Rings */}
      <Ring size={130} delay="0s" opacity={0.25} />
      <Ring size={160} delay="0.4s" opacity={0.14} />
      <Ring size={192} delay="0.8s" opacity={0.07} />

      {/* Avatar circle */}
      <div className="ai-avatar-circle">
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
          {/* Head */}
          <circle cx="26" cy="18" r="11" fill="#FACC15" opacity="0.95" />
          {/* Body */}
          <path
            d="M8 46c0-9.94 8.06-18 18-18s18 8.06 18 18"
            fill="#FACC15"
            opacity="0.9"
          />
          {/* Eyes */}
          <circle cx="21" cy="17" r="2.2" fill="#0B0B0D" />
          <circle cx="31" cy="17" r="2.2" fill="#0B0B0D" />
          {/* Smile */}
          <path
            d="M21 22 Q26 27 31 22"
            stroke="#0B0B0D"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Name badge */}
      <div className="ai-name-badge">
        <span className="ai-live-dot" />
        <div>
          <div className="ai-name">Sarah</div>
          <div className="ai-subtitle">AI Interviewer</div>
        </div>
      </div>

      {/* Waveform when speaking */}
      {speaking && (
        <div className="ai-wave">
          <WaveBar delay="0s" height="8px" />
          <WaveBar delay="0.1s" height="16px" />
          <WaveBar delay="0.2s" height="24px" />
          <WaveBar delay="0.15s" height="18px" />
          <WaveBar delay="0.05s" height="10px" />
          <WaveBar delay="0.25s" height="22px" />
          <WaveBar delay="0.3s" height="14px" />
        </div>
      )}
    </div>
  );
};
