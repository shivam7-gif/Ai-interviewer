import React from "react";
import type { VoiceState } from "../types";

interface VoiceStatusProps {
  state: VoiceState;
}

const STATUS_LABELS: Record<VoiceState, string> = {
  idle: "Idle",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
};

export const VoiceStatus: React.FC<VoiceStatusProps> = ({ state }) => {
  const isSpeaking = state === "speaking";

  return (
    <div
      className="voice-status-container"
      title={`Interviewer: ${STATUS_LABELS[state] ?? "Listening"}`}
      aria-label={`Interviewer: ${STATUS_LABELS[state] ?? "Listening"}`}
    >
      <span
        className={`status-dot ${isSpeaking ? "status-dot-active" : ""}`}
        aria-hidden="true"
      />
    </div>
  );
};
