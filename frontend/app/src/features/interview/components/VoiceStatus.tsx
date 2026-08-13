import React from "react";
import { Mic, Activity, Brain, Volume2, Radio } from "lucide-react";
import type { VoiceState } from "../types";

const STATE_CONFIG: Record<
  VoiceState,
  { label: string; icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>; color: string; dot: string }
> = {
  idle: {
    label: "Idle",
    icon: Radio,
    color: "#A1A1AA",
    dot: "#52525B",
  },
  listening: {
    label: "Listening...",
    icon: Mic,
    color: "#22C55E",
    dot: "#22C55E",
  },
  thinking: {
    label: "Thinking...",
    icon: Brain,
    color: "#FACC15",
    dot: "#FACC15",
  },
  speaking: {
    label: "Speaking...",
    icon: Volume2,
    color: "#3B82F6",
    dot: "#3B82F6",
  },
};

interface VoiceStatusProps {
  state: VoiceState;
}

export const VoiceStatus: React.FC<VoiceStatusProps> = ({ state }) => {
  const cfg = STATE_CONFIG[state];
  const Icon = cfg.icon;

  return (
    <div className="voice-status-bar">
      <div className="voice-status-live">
        <span className="voice-live-dot" />
        <span className="voice-live-label">LIVE</span>
      </div>

      <div className="voice-status-state">
        <div
          className="voice-state-dot"
          style={{ background: cfg.dot, boxShadow: `0 0 8px ${cfg.dot}` }}
        />
        <Icon size={13} color={cfg.color} strokeWidth={2} />
        <span style={{ color: cfg.color, fontSize: 12, fontWeight: 500 }}>
          {cfg.label}
        </span>
      </div>

      <Activity size={14} color="#3F3F46" />
    </div>
  );
};
